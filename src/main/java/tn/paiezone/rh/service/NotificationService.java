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
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;

@Service
@Transactional
public class NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationService.class);

    private final AuditLogRepository auditLogRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;

    public NotificationService(
        AuditLogRepository auditLogRepository,
        CompanyRepository companyRepository,
        UserProfileRepository userProfileRepository
    ) {
        this.auditLogRepository = auditLogRepository;
        this.companyRepository = companyRepository;
        this.userProfileRepository = userProfileRepository;
    }

    public void createContractExpirationNotification(Contract contract, String delayLabel) {
        try {
            AuditLog notification = new AuditLog();
            notification.setAction("NOTIFICATION_CONTRACT_EXPIRATION");
            notification.setEntityType("Contract");
            notification.setEntityId(contract.getId());
            notification.setOccurredAt(Instant.now());
            notification.setIpAddress("SYSTEM_SCHEDULER");

            String message = buildNotificationMessage(contract, delayLabel);
            notification.setNewValue(message);

            Company company = resolveCompany(contract);
            if (company == null) {
                LOG.warn("Impossible de créer la notification : Company introuvable pour le contrat {}", contract.getReference());
                return;
            }
            notification.setCompany(company);

            // Stocker le UserProfile de l'admin company comme déclencheur
            if (company.getAdminLogin() != null) {
                userProfileRepository.findByJhiUserId(company.getAdminLogin()).ifPresent(notification::setUser);
            }

            auditLogRepository.save(notification);
            LOG.debug("✅ Notification créée pour le contrat : {} (expire dans {})", contract.getReference(), delayLabel);
        } catch (Exception e) {
            LOG.error("❌ Erreur création notification contrat {} : {}", contract.getReference(), e.getMessage());
        }
    }

    private Company resolveCompany(Contract contract) {
        if (contract.getEmployee() != null && contract.getEmployee().getCompany() != null) {
            return contract.getEmployee().getCompany();
        }
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
