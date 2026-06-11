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
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setOccurredAt(Instant.now());
        auditLog.setIpAddress(ipAddress != null && !ipAddress.isBlank() ? ipAddress : "127.0.0.1");
        auditLog.setUserAgent(userAgent);

        // Sérialisation indépendante : échec de sérialisation ≠ échec de l'audit
        if (result != null) {
            try {
                auditLog.setNewValue(objectMapper.writeValueAsString(result));
            } catch (Exception e) {
                LOG.warn("Impossible de sérialiser le résultat pour l'audit ({}/{}): {}", action, entityType, e.getMessage());
            }
            try {
                java.lang.reflect.Method getIdMethod = result.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(result);
                if (id instanceof Long longId) {
                    auditLog.setEntityId(longId);
                }
            } catch (Exception ignored) {}
        }
        auditLog.setOldValue(oldValue);

        // Résolution user + compagnie
        userProfileRepository
            .findByJhiUserId(login)
            .ifPresent(user -> {
                auditLog.setUser(user);
                if (user.getCompany() != null) {
                    auditLog.setCompany(user.getCompany());
                }
            });

        // Fallback : admin sans UserProfile (inscrit via /register-with-company)
        if (auditLog.getCompany() == null && login != null) {
            companyRepository.findFirstByAdminLoginIgnoreCase(login).ifPresent(auditLog::setCompany);
        }

        if (auditLog.getCompany() == null) {
            LOG.error("AuditLog ignoré : aucune compagnie résolue pour login={} action={}", login, action);
            return;
        }

        try {
            auditLogRepository.save(auditLog);
            LOG.debug("AuditLog saved: action={} entity={}/{}", action, entityType, auditLog.getEntityId());
        } catch (Exception e) {
            LOG.error("Erreur sauvegarde AuditLog action={} entity={}: {}", action, entityType, e.getMessage());
        }
    }
}
