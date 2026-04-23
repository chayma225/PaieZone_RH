package tn.paiezone.rh.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;

@Service
@Transactional
public class AuditService {

    private static final Logger LOG = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;
    private final ObjectMapper objectMapper;

    public AuditService(
        AuditLogRepository auditLogRepository,
        UserProfileRepository userProfileRepository,
        CompanyRepository companyRepository,
        ObjectMapper objectMapper
    ) {
        this.auditLogRepository = auditLogRepository;
        this.userProfileRepository = userProfileRepository;
        this.companyRepository = companyRepository;
        this.objectMapper = objectMapper;
    }

    /**
     * Centralise la création de l'audit pour respecter les règles ArchUnit.
     */
    public void saveAuditLog(
        String login,
        String action,
        String entityType,
        String oldValue,
        Object result,
        String ipAddress,
        String userAgent
    ) {
        try {
            String newValue = null;
            if (result != null) {
                newValue = objectMapper.writeValueAsString(result);
            }

            AuditLog auditLog = new AuditLog();
            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLog.setOccurredAt(Instant.now());

            // Récupération du profil utilisateur et de la compagnie
            userProfileRepository
                .findByJhiUserId(login)
                .ifPresent(user -> {
                    auditLog.setUser(user);
                    if (user.getCompany() != null) {
                        auditLog.setCompany(user.getCompany());
                    }
                });

            // Fallback si aucune compagnie n'est trouvée
            if (auditLog.getCompany() == null) {
                companyRepository.findAll().stream().findFirst().ifPresent(auditLog::setCompany);
            }

            auditLogRepository.save(auditLog);
            LOG.debug("AuditLog enregistré avec succès pour l'action : {}", action);
        } catch (Exception e) {
            LOG.error("Erreur lors de la sauvegarde de l'audit dans AuditService : {}", e.getMessage());
        }
    }
}
