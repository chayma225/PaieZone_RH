package tn.paiezone.rh.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;

@Service
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
    @Transactional(propagation = Propagation.REQUIRES_NEW)
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

            // Extraction de l'entityId depuis le DTO résultat via reflection
            if (result != null) {
                try {
                    java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                    Object id = getIdMethod.invoke(result);
                    if (id instanceof Long longId) {
                        auditLog.setEntityId(longId);
                    }
                } catch (Exception ignored) {
                    // Certains résultats n'ont pas de getId()
                }
            }

            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setIpAddress(ipAddress != null && !ipAddress.isBlank() ? ipAddress : "127.0.0.1");
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

            // Fallback : admin enregistré via /register-with-company (sans UserProfile)
            if (auditLog.getCompany() == null && login != null) {
                companyRepository.findFirstByAdminLoginIgnoreCase(login).ifPresent(auditLog::setCompany);
            }

            auditLogRepository.save(auditLog);
            LOG.debug("AuditLog enregistré avec succès pour l'action : {}", action);
        } catch (Exception e) {
            LOG.error("Erreur lors de la sauvegarde de l'audit dans AuditService : {}", e.getMessage());
        }
    }
}
