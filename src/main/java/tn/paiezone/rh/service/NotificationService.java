package tn.paiezone.rh.service;

import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.repository.CompanyRepository;

@Service
@Transactional
public class NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationService.class);

    private final AuditLogRepository auditLogRepository;
    private final CompanyRepository companyRepository;

    public NotificationService(AuditLogRepository auditLogRepository, CompanyRepository companyRepository) {
        this.auditLogRepository = auditLogRepository;
        this.companyRepository = companyRepository;
    }

    public void createContractExpirationNotification(Contract contract, String delayLabel) {
        try {
            AuditLog notification = new AuditLog();
            notification.setAction("NOTIFICATION_CONTRACT_EXPIRATION");
            notification.setEntityType("Contract");
            notification.setEntityId(contract.getId());
            notification.setOccurredAt(Instant.now());
            notification.setIpAddress("SYSTEM_SCHEDULER");

            // Message de notification
            String message = buildNotificationMessage(contract, delayLabel);
            notification.setNewValue(message);

            // ← Correction : récupérer la Company depuis l'employé
            Company company = resolveCompany(contract);
            if (company == null) {
                LOG.warn("Impossible de créer la notification : Company introuvable pour le contrat {}", contract.getReference());
                return; // Ne pas créer si Company manquante (NOT NULL en BDD)
            }
            notification.setCompany(company);

            auditLogRepository.save(notification);
            LOG.debug("✅ Notification créée pour le contrat : {} (expire dans {})", contract.getReference(), delayLabel);
        } catch (Exception e) {
            LOG.error("❌ Erreur création notification contrat {} : {}", contract.getReference(), e.getMessage());
        }
    }

    private Company resolveCompany(Contract contract) {
        // Priorité 1 : Company via l'employé
        if (contract.getEmployee() != null && contract.getEmployee().getCompany() != null) {
            return contract.getEmployee().getCompany();
        }
        // Priorité 2 : Première Company disponible (fallback)
        Optional<Company> fallback = companyRepository.findAll().stream().findFirst();
        return fallback.orElse(null);
    }

    private String buildNotificationMessage(Contract contract, String delayLabel) {
        String employeeName = "N/A";
        String matricule = "N/A";

        if (contract.getEmployee() != null) {
            employeeName = contract.getEmployee().getFirstName() + " " + contract.getEmployee().getLastName();
            matricule = contract.getEmployee().getMatricule();
        }

        return String.format(
            "⚠️ ALERTE EXPIRATION — Contrat %s (%s) de l'employé %s [%s] " + "arrive à expiration dans %s (le %s). Type : %s.",
            contract.getReference(),
            contract.getContractType(),
            employeeName,
            matricule,
            delayLabel,
            contract.getEndDate(),
            contract.getContractType()
        );
    }
}
