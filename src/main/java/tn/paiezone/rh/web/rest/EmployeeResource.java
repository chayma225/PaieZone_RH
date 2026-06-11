package tn.paiezone.rh.web.rest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Department;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.domain.enumeration.EmployeeCategory;
import tn.paiezone.rh.domain.enumeration.Gender;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.DepartmentRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.JobPositionRepository;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.EmployeeQueryService;
import tn.paiezone.rh.service.EmployeeService;
import tn.paiezone.rh.service.criteria.EmployeeCriteria;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.DepartmentDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/employees")
public class EmployeeResource {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeResource.class);
    private static final String ENTITY_NAME = "employee";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeQueryService employeeQueryService;
    private final CompanyRepository companyRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final UserProfileRepository userProfileRepository;

    public EmployeeResource(
        EmployeeService employeeService,
        EmployeeRepository employeeRepository,
        EmployeeQueryService employeeQueryService,
        CompanyRepository companyRepository,
        DepartmentRepository departmentRepository,
        JobPositionRepository jobPositionRepository,
        UserProfileRepository userProfileRepository
    ) {
        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
        this.employeeQueryService = employeeQueryService;
        this.companyRepository = companyRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.userProfileRepository = userProfileRepository;
    }

    /** GET /api/employees/me — Retourne le profil employé de l'utilisateur connecté */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EmployeeDTO> getMyEmployee() {
        return SecurityUtils.getCurrentUserLogin()
            .flatMap(login -> employeeRepository.findByUserProfile_JhiUserId(login))
            .flatMap(e -> employeeService.findOne(e.getId()))
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** POST /api/employees/create-simple — Création simplifiée sans @Valid */
    @PostMapping("/create-simple")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "CREATE", entityType = "Employee")
    public ResponseEntity<EmployeeDTO> createSimpleEmployee(@RequestBody Map<String, Object> body) throws URISyntaxException {
        EmployeeDTO dto = new EmployeeDTO();

        // Champs obligatoires
        dto.setMatricule(require(body, "matricule"));
        dto.setFirstName(require(body, "firstName"));
        dto.setLastName(require(body, "lastName"));
        dto.setBirthDate(LocalDate.parse(require(body, "birthDate")));
        dto.setGender(Gender.valueOf(require(body, "gender")));
        dto.setMaritalStatus(MaritalStatus.valueOf(require(body, "maritalStatus")));
        dto.setNumberOfChildren(body.get("numberOfChildren") != null ? Integer.valueOf(body.get("numberOfChildren").toString()) : 0);
        dto.setChefDeFamille(body.get("chefDeFamille") != null ? Boolean.valueOf(body.get("chefDeFamille").toString()) : false);
        dto.setNationalId(require(body, "nationalId"));
        dto.setCategory(EmployeeCategory.valueOf(body.get("category") != null ? body.get("category").toString() : "EMPLOYEE"));
        dto.setHireDate(LocalDate.parse(require(body, "hireDate")));
        dto.setActive(true);
        dto.setCreatedAt(Instant.now());

        // Champs optionnels
        if (body.get("personalEmail") != null) dto.setPersonalEmail(body.get("personalEmail").toString());
        if (body.get("professionalEmail") != null) dto.setProfessionalEmail(body.get("professionalEmail").toString());
        if (body.get("phoneNumber") != null) dto.setPhoneNumber(body.get("phoneNumber").toString());
        if (body.get("city") != null) dto.setCity(body.get("city").toString());
        if (body.get("cnssNumber") != null) dto.setCnssNumber(body.get("cnssNumber").toString());
        if (body.get("address") != null) dto.setAddress(body.get("address").toString());

        // Société — priorité : adminLogin sur la société (admin inscrit) ; fallback : UserProfile (RH rattaché)
        Company company = SecurityUtils.getCurrentUserLogin()
            .flatMap(login -> {
                Optional<Company> byAdmin = companyRepository.findFirstByAdminLogin(login);
                if (byAdmin.isPresent()) return byAdmin;
                return userProfileRepository.findByJhiUserId(login).map(up -> up.getCompany());
            })
            .orElseThrow(() -> new EntityNotFoundException("Aucune société trouvée pour l'utilisateur courant"));
        CompanyDTO companyDto = new CompanyDTO();
        companyDto.setId(company.getId());
        dto.setCompany(companyDto);

        // Département
        if (body.get("departmentId") != null) {
            Long deptId = Long.valueOf(body.get("departmentId").toString());
            Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new BadRequestAlertException("Département introuvable.", ENTITY_NAME, "nodepartment"));
            if (!Boolean.TRUE.equals(dept.getActive())) {
                throw new BusinessException("Le département sélectionné est inactif.", ENTITY_NAME, "departementInactif");
            }
            DepartmentDTO deptDto = new DepartmentDTO();
            deptDto.setId(dept.getId());
            dto.setDepartment(deptDto);
        } else {
            Department dept = departmentRepository
                .findAll()
                .stream()
                .filter(d -> Boolean.TRUE.equals(d.getActive()))
                .findFirst()
                .orElseThrow(() -> new BadRequestAlertException("Veuillez créer au moins un département actif", ENTITY_NAME, "nodepartment"));
            DepartmentDTO deptDto = new DepartmentDTO();
            deptDto.setId(dept.getId());
            dto.setDepartment(deptDto);
        }

        // Poste
        if (body.get("positionId") != null) {
            Long posId = Long.valueOf(body.get("positionId").toString());
            JobPosition pos = jobPositionRepository.findById(posId)
                .orElseThrow(() -> new BadRequestAlertException("Poste introuvable.", ENTITY_NAME, "noposition"));
            if (!Boolean.TRUE.equals(pos.getActive())) {
                throw new BusinessException("Le poste sélectionné est inactif.", ENTITY_NAME, "posteInactif");
            }
            JobPositionDTO posDto = new JobPositionDTO();
            posDto.setId(pos.getId());
            dto.setPosition(posDto);
        } else {
            String posTitle = body.get("positionTitle") != null ? body.get("positionTitle").toString() : "Collaborateur";
            JobPosition pos = jobPositionRepository
                .findAll()
                .stream()
                .filter(p -> p.getTitle().equalsIgnoreCase(posTitle))
                .findFirst()
                .orElseGet(() -> {
                    JobPosition newPos = new JobPosition();
                    newPos.setCode(posTitle.substring(0, Math.min(posTitle.length(), 18)).toUpperCase().replaceAll("\\s+", "_"));
                    newPos.setTitle(posTitle);
                    newPos.setActive(true);
                    newPos.setCompany(company);
                    return jobPositionRepository.save(newPos);
                });
            JobPositionDTO posDto = new JobPositionDTO();
            posDto.setId(pos.getId());
            dto.setPosition(posDto);
        }

        // Vérification limite de plan
        var sub = company.getCompanySubscription();
        if (sub != null && sub.getMaxEmployees() != null && sub.getMaxEmployees() > 0) {
            long current = employeeRepository.countByCompanyIdAndActiveTrue(company.getId());
            if (current >= sub.getMaxEmployees()) {
                String next = nextPlanLabel(sub.getPlan() != null ? sub.getPlan().name() : "STARTER");
                throw new BadRequestAlertException(
                    "Limite atteinte : votre plan " +
                        sub.getPlan() +
                        " autorise " +
                        sub.getMaxEmployees() +
                        " employés. Passez au plan " +
                        next +
                        " pour continuer.",
                    ENTITY_NAME,
                    "planLimitReached"
                );
            }
        }

        EmployeeDTO result = employeeService.save(dto);
        return ResponseEntity.created(new URI("/api/employees/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    // ── US-09 : Créer employé ─────────────────────────────────────────────────
    @PostMapping("")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "CREATE", entityType = "Employee")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) throws URISyntaxException {
        LOG.debug("REST request to save Employee : {}", employeeDTO);
        if (employeeDTO.getId() != null) {
            throw new BadRequestAlertException("Un nouvel employé ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        employeeDTO = employeeService.save(employeeDTO);
        return ResponseEntity.created(new URI("/api/employees/" + employeeDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, employeeDTO.getId().toString()))
            .body(employeeDTO);
    }

    // ── US-10 : Modifier employé ──────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "UPDATE", entityType = "Employee")
    public ResponseEntity<EmployeeDTO> updateEmployee(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EmployeeDTO employeeDTO
    ) throws URISyntaxException {
        if (employeeDTO.getId() == null) throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        if (!Objects.equals(id, employeeDTO.getId())) throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        if (!employeeRepository.existsById(id)) throw new BadRequestAlertException("Employé introuvable.", ENTITY_NAME, "idnotfound");
        employeeDTO = employeeService.update(employeeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, employeeDTO.getId().toString()))
            .body(employeeDTO);
    }

    /**
     * PATCH /api/employees/{id}/update — mise à jour "champs plats" (département, poste par titre, etc.)
     * Utilisé par rh-employees pour éviter le problème MapStruct partial-update sur les FK.
     */
    @PatchMapping("/{id}/update")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    public ResponseEntity<EmployeeDTO> quickUpdateEmployee(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        final tn.paiezone.rh.domain.Employee emp = employeeRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Employé introuvable.", ENTITY_NAME, "idnotfound"));

        if (body.get("firstName") != null) emp.setFirstName(body.get("firstName").toString());
        if (body.get("lastName") != null) emp.setLastName(body.get("lastName").toString());
        if (body.get("professionalEmail") != null) emp.setProfessionalEmail(body.get("professionalEmail").toString());
        if (body.get("phoneNumber") != null) emp.setPhoneNumber(body.get("phoneNumber").toString());
        if (body.get("city") != null) emp.setCity(body.get("city").toString());
        if (body.get("cnssNumber") != null) emp.setCnssNumber(body.get("cnssNumber").toString());
        if (body.get("numberOfChildren") != null) emp.setNumberOfChildren(Integer.valueOf(body.get("numberOfChildren").toString()));
        if (body.get("category") != null) emp.setCategory(EmployeeCategory.valueOf(body.get("category").toString()));
        if (body.get("active") != null) emp.setActive(Boolean.valueOf(body.get("active").toString()));

        if (body.get("departmentId") != null) {
            Long deptId = Long.valueOf(body.get("departmentId").toString());
            Department dept = departmentRepository.findById(deptId)
                .orElseThrow(() -> new BadRequestAlertException("Département introuvable.", ENTITY_NAME, "nodepartment"));
            if (!Boolean.TRUE.equals(dept.getActive())) {
                throw new BusinessException("Le département sélectionné est inactif.", ENTITY_NAME, "departementInactif");
            }
            emp.setDepartment(dept);
        }

        if (body.get("positionTitle") != null) {
            String title = body.get("positionTitle").toString().trim();
            if (!title.isEmpty()) {
                final tn.paiezone.rh.domain.Company empCompany = emp.getCompany();
                tn.paiezone.rh.domain.JobPosition pos = jobPositionRepository
                    .findAll()
                    .stream()
                    .filter(p -> p.getTitle().equalsIgnoreCase(title))
                    .findFirst()
                    .orElseGet(() -> {
                        tn.paiezone.rh.domain.JobPosition np = new tn.paiezone.rh.domain.JobPosition();
                        np.setCode(title.substring(0, Math.min(title.length(), 18)).toUpperCase().replaceAll("\\s+", "_"));
                        np.setTitle(title);
                        np.setActive(true);
                        np.setCompany(empCompany);
                        return jobPositionRepository.save(np);
                    });
                emp.setPosition(pos);
            }
        }

        tn.paiezone.rh.domain.Employee saved = employeeRepository.save(emp);
        return ResponseEntity.ok(employeeService.findOne(saved.getId()).orElseThrow());
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    public ResponseEntity<EmployeeDTO> partialUpdateEmployee(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EmployeeDTO employeeDTO
    ) throws URISyntaxException {
        if (employeeDTO.getId() == null) throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        if (!Objects.equals(id, employeeDTO.getId())) throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        if (!employeeRepository.existsById(id)) throw new BadRequestAlertException("Employé introuvable.", ENTITY_NAME, "idnotfound");
        Optional<EmployeeDTO> result = employeeService.partialUpdate(employeeDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, employeeDTO.getId().toString())
        );
    }

    @GetMapping("")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees(
        EmployeeCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        Page<EmployeeDTO> page = employeeQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countEmployees(EmployeeCriteria criteria) {
        return ResponseEntity.ok().body(employeeQueryService.countByCriteria(criteria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable("id") Long id) {
        return ResponseUtil.wrapOrNotFound(employeeService.findOne(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "DELETE", entityType = "Employee")
    public ResponseEntity<Void> deleteEmployee(@PathVariable("id") Long id) {
        employeeService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    private String require(Map<String, Object> body, String key) {
        Object val = body.get(key);
        if (val == null || val.toString().isBlank()) {
            throw new BadRequestAlertException("Champ obligatoire manquant : " + key, ENTITY_NAME, "missingfield");
        }
        return val.toString();
    }

    private String nextPlanLabel(String current) {
        return switch (current) {
            case "STARTER" -> "PME (30 employés, 290 TND/mois)";
            case "PME" -> "BUSINESS (100 employés, 720 TND/mois)";
            case "BUSINESS" -> "ENTERPRISE (500 employés, 1 480 TND/mois)";
            default -> "CUSTOM — contactez-nous";
        };
    }
}
