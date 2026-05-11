package tn.paiezone.rh.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.CnssDeclarationService;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CnssDeclarationServiceImpl implements CnssDeclarationService {

    private final PaySlipRepository paySlipRepository;

    @Override
    public byte[] generateCnssFile(Long companyId, int month, int year) {
        // CORRECTION : Utilisation du nouveau nom de méthode du repository
        List<PaySlip> paySlips = paySlipRepository
            .findByEmployee_Company_IdAndMonthAndYear(companyId, month, year);

        if (paySlips.isEmpty()) {
            throw new IllegalStateException(
                "Aucun bulletin trouvé pour la société #" + companyId +
                    " période " + month + "/" + year);
        }

        StringBuilder sb = new StringBuilder();

        // En-tête
        sb.append("MATRICULE;NOM;PRENOM;CNSS;SALAIRE_BRUT;CNSS_SALARIAL;CNSS_PATRONAL\n");

        for (PaySlip ps : paySlips) {
            Employee emp = ps.getEmployee();
            sb.append(emp.getMatricule()).append(";")
                .append(emp.getLastName().toUpperCase()).append(";")
                .append(emp.getFirstName()).append(";")
                .append(nullSafe(emp.getCnssNumber())).append(";")
                .append(ps.getGrossSalary()).append(";")
                .append(ps.getCnssSalaryAmount()).append(";")
                .append(ps.getEmployerCnss()).append("\n");
        }

        // Totaux
        BigDecimal totalBrut     = paySlips.stream().map(PaySlip::getGrossSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSalarial = paySlips.stream().map(PaySlip::getCnssSalaryAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPatronal = paySlips.stream().map(PaySlip::getEmployerCnss)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        sb.append("TOTAL;;;;" )
            .append(totalBrut).append(";")
            .append(totalSalarial).append(";")
            .append(totalPatronal).append("\n");

        log.info("✅ Fichier CNSS généré — société #{} — {}/{} — {} bulletins",
            companyId, month, year, paySlips.size());

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public byte[] generateVirementFile(Long companyId, int month, int year) {
        // CORRECTION : Nom de méthode + Nom de variable cohérent
        List<PaySlip> paySlips = paySlipRepository
            .findByEmployee_Company_IdAndMonthAndYear(companyId, month, year);

        if (paySlips.isEmpty()) {
            throw new IllegalStateException(
                "Aucun bulletin trouvé pour la société #" + companyId +
                    " période " + month + "/" + year);
        }

        StringBuilder sb = new StringBuilder();

        // En-tête format virement
        sb.append("MATRICULE;NOM;PRENOM;RIB;NET_A_PAYER\n");

        for (PaySlip ps : paySlips) {
            Employee emp = ps.getEmployee();
            sb.append(emp.getMatricule()).append(";")
                .append(emp.getLastName().toUpperCase()).append(";")
                .append(emp.getFirstName()).append(";")
                .append(nullSafe(emp.getBankRib())).append(";")
                .append(ps.getNetSalary()).append("\n");
        }

        // Total virement
        BigDecimal totalNet = paySlips.stream().map(PaySlip::getNetSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        sb.append("TOTAL;;;;").append(totalNet).append("\n");

        log.info("✅ Fichier virement généré — société #{} — {}/{} — {} virements",
            companyId, month, year, paySlips.size());

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }
}
