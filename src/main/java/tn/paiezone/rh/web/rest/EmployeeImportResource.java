package tn.paiezone.rh.web.rest;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.*;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.TenantContextService;

/**
 * POST /api/employees/import-excel
 *
 * Colonnes attendues (ligne 1 = en-têtes, lignes 2+ = données) :
 *   A Matricule  B Prénom  C Nom  D Genre (M/F)  E Situation familiale
 *   F Nb enfants  G Chef famille (O/N)  H CIN  I Date embauche (DD/MM/YYYY)
 *   J Département  K Poste  L Email pro  M Téléphone  N Ville  O N° CNSS
 *   P Type contrat  Q Salaire base  R Date début contrat
 */
@RestController
@RequestMapping("/api/employees")
public class EmployeeImportResource {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeImportResource.class);
    private static final DateTimeFormatter DATE_FR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int HEADER_ROW = 0;

    @PersistenceContext
    private EntityManager em;

    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final TenantContextService tenantContextService;

    public EmployeeImportResource(
        EmployeeRepository employeeRepository,
        ContractRepository contractRepository,
        DepartmentRepository departmentRepository,
        JobPositionRepository jobPositionRepository,
        TenantContextService tenantContextService
    ) {
        this.employeeRepository = employeeRepository;
        this.contractRepository = contractRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.tenantContextService = tenantContextService;
    }

    @PostMapping("/import-excel")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "','" +
            AuthoritiesConstants.RH_COMPTABLE +
            "','" +
            AuthoritiesConstants.SUPER_ADMIN +
            "')"
    )
    @Transactional
    public ResponseEntity<ImportResultDTO> importExcel(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ImportResultDTO.error("Fichier vide."));
        }
        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            return ResponseEntity.badRequest().body(ImportResultDTO.error("Format non supporté. Utilisez un fichier .xlsx"));
        }

        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null || companyId < 0) {
            return ResponseEntity.badRequest().body(ImportResultDTO.error("Impossible de résoudre l'entreprise courante."));
        }

        // Proxy JPA géré par le contexte de persistance — évite TransientPropertyValueException
        Company company = em.getReference(Company.class, companyId);

        int imported = 0,
            skipped = 0,
            errors = 0;
        List<String> errorLines = new ArrayList<>();
        List<String> skippedLines = new ArrayList<>();
        List<String> importedNames = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {
            Sheet sheet = wb.getSheetAt(0);
            int lastRow = sheet.getLastRowNum();

            for (int i = HEADER_ROW + 1; i <= lastRow; i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowEmpty(row)) continue;

                try {
                    String matricule = str(row, 0);
                    String firstName = str(row, 1);
                    String lastName = str(row, 2);

                    if (matricule.isBlank() || firstName.isBlank() || lastName.isBlank()) {
                        errorLines.add("Ligne " + (i + 1) + " : Matricule, Prénom et Nom sont obligatoires.");
                        errors++;
                        continue;
                    }

                    if (employeeRepository.existsByMatriculeAndCompanyId(matricule, companyId)) {
                        skippedLines.add(
                            "Ligne " + (i + 1) + " [" + matricule + " " + firstName + " " + lastName + "] : matricule déjà existant."
                        );
                        skipped++;
                        continue;
                    }

                    // Département — obligatoire en BDD
                    String deptName = str(row, 9);
                    if (deptName.isBlank()) {
                        errorLines.add("Ligne " + (i + 1) + " [" + matricule + "] : Département obligatoire.");
                        errors++;
                        continue;
                    }
                    var dept = departmentRepository.findByNameIgnoreCaseAndCompanyId(deptName, companyId);
                    if (dept.isEmpty()) {
                        errorLines.add("Ligne " + (i + 1) + " [" + matricule + "] : Département introuvable : « " + deptName + " ».");
                        errors++;
                        continue;
                    }

                    // Poste — obligatoire en BDD
                    String positionTitle = str(row, 10);
                    if (positionTitle.isBlank()) {
                        errorLines.add("Ligne " + (i + 1) + " [" + matricule + "] : Poste obligatoire.");
                        errors++;
                        continue;
                    }
                    var pos = jobPositionRepository.findByTitleIgnoreCaseAndCompanyId(positionTitle, companyId);
                    if (pos.isEmpty()) {
                        errorLines.add("Ligne " + (i + 1) + " [" + matricule + "] : Poste introuvable : « " + positionTitle + " ».");
                        errors++;
                        continue;
                    }

                    // Construire l'employé
                    Employee emp = new Employee();
                    emp.setMatricule(matricule);
                    emp.setFirstName(firstName);
                    emp.setLastName(lastName);
                    emp.setGender(parseGender(str(row, 3)));
                    emp.setMaritalStatus(parseMarital(str(row, 4)));
                    emp.setNumberOfChildren(parseInt(row, 5, 0));
                    emp.setChefDeFamille("O".equalsIgnoreCase(str(row, 6)));
                    emp.setNationalId(str(row, 7));

                    LocalDate hireDate = parseDate(str(row, 8));
                    if (hireDate == null) {
                        errorLines.add(
                            "Ligne " + (i + 1) + " [" + matricule + "] : Date embauche invalide ou manquante (format attendu DD/MM/YYYY)."
                        );
                        errors++;
                        continue;
                    }
                    emp.setHireDate(hireDate);
                    emp.setBirthDate(LocalDate.of(1990, 1, 1));
                    emp.setProfessionalEmail(str(row, 11));
                    emp.setPhoneNumber(str(row, 12));
                    emp.setCity(str(row, 13));
                    emp.setCnssNumber(str(row, 14));
                    emp.setActive(true);
                    emp.setCategory(EmployeeCategory.EMPLOYEE);
                    emp.setCompany(company);
                    emp.setCreatedAt(Instant.now());
                    emp.setDepartment(dept.get());
                    emp.setPosition(pos.get());

                    em.persist(emp);
                    em.flush();

                    // Contrat (si type renseigné)
                    String contractTypeStr = str(row, 15);
                    if (!contractTypeStr.isBlank()) {
                        Contract contract = new Contract();
                        contract.setEmployee(emp);
                        contract.setContractType(parseContractType(contractTypeStr));
                        contract.setStatus(ContractStatus.ACTIVE);
                        BigDecimal salary = parseBigDecimal(row, 16);
                        contract.setBaseSalary(salary != null ? salary : BigDecimal.ZERO);
                        LocalDate startDate = parseDate(str(row, 17));
                        contract.setStartDate(startDate != null ? startDate : hireDate);
                        contract.setReference("IMP-" + matricule + "-" + System.nanoTime());
                        contract.setWorkingHoursWeek(40);
                        contract.setWorkingDaysWeek(5);
                        contract.setCreatedAt(Instant.now());
                        em.persist(contract);
                        em.flush();
                    }

                    importedNames.add(firstName + " " + lastName);
                    imported++;
                } catch (Exception e) {
                    LOG.warn("[ImportExcel] Erreur ligne {} : {}", i + 1, e.getMessage(), e);
                    errorLines.add("Ligne " + (i + 1) + " : " + e.getMessage());
                    errors++;
                    em.clear(); // réinitialise la session JPA pour que la ligne suivante reparte proprement
                }
            }
        } catch (IOException e) {
            LOG.error("[ImportExcel] Impossible de lire le fichier : {}", e.getMessage());
            return ResponseEntity.badRequest().body(ImportResultDTO.error("Impossible de lire le fichier Excel : " + e.getMessage()));
        }

        LOG.info("[ImportExcel] company={} — importés={} ignorés={} erreurs={}", companyId, imported, skipped, errors);

        return ResponseEntity.ok(
            new ImportResultDTO(
                imported,
                skipped,
                errors,
                importedNames,
                skippedLines,
                errorLines,
                imported + " employé(s) importé(s) avec succès. [companyId=" + companyId + "]"
            )
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String str(Row row, int col) {
        Cell cell = row.getCell(col, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> cell.getBooleanCellValue() ? "true" : "false";
            default -> "";
        };
    }

    private int parseInt(Row row, int col, int defaultVal) {
        try {
            return Integer.parseInt(str(row, col));
        } catch (NumberFormatException e) {
            return defaultVal;
        }
    }

    private BigDecimal parseBigDecimal(Row row, int col) {
        try {
            String s = str(row, col).replace(",", ".");
            if (s.isBlank()) return null;
            return new BigDecimal(s);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s, DATE_FR);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(s);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    private Gender parseGender(String s) {
        return "F".equalsIgnoreCase(s) || "FEMALE".equalsIgnoreCase(s) ? Gender.FEMALE : Gender.MALE;
    }

    private MaritalStatus parseMarital(String s) {
        return switch (s.toUpperCase()) {
            case "MARRIED", "MARIE", "MARIÉ" -> MaritalStatus.MARRIED;
            case "DIVORCED", "DIVORCE", "DIVORCÉ" -> MaritalStatus.DIVORCED;
            case "WIDOWED", "VEUF", "VEUVE" -> MaritalStatus.WIDOWED;
            default -> MaritalStatus.SINGLE;
        };
    }

    private ContractType parseContractType(String s) {
        return switch (s.toUpperCase().trim()) {
            case "CDD" -> ContractType.CDD;
            case "CIVP" -> ContractType.CIVP;
            case "KARAMA" -> ContractType.KARAMA;
            case "INTERIM", "INTÉRIM", "INTERIMAIRE" -> ContractType.INTERIMAIRE;
            case "STAGE" -> ContractType.STAGE;
            default -> ContractType.CDI;
        };
    }

    private boolean isRowEmpty(Row row) {
        for (int i = 0; i < 5; i++) {
            if (!str(row, i).isBlank()) return false;
        }
        return true;
    }

    // ── DTO résultat ──────────────────────────────────────────────────────────

    public record ImportResultDTO(
        int imported,
        int skipped,
        int errors,
        List<String> importedNames,
        List<String> skippedLines,
        List<String> errorLines,
        String message
    ) {
        static ImportResultDTO error(String msg) {
            return new ImportResultDTO(0, 0, 1, List.of(), List.of(), List.of(msg), msg);
        }
    }
}
