package tn.paiezone.rh.aop.logging.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;

@Aspect
@Component
public class AuditAspect {

    private static final Logger LOG = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditLogRepository auditLogRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;
    private final ObjectMapper objectMapper;

    public AuditAspect(
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

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        // Capturer l'ancien état avant exécution
        String oldValue = null;
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0 && args[0] != null) {
                oldValue = objectMapper.writeValueAsString(args[0]);
            }
        } catch (Exception e) {
            LOG.warn("Impossible de sérialiser l'ancien état : {}", e.getMessage());
        }

        // Exécuter la méthode
        Object result = joinPoint.proceed();

        // Enregistrer l'audit après exécution
        try {
            saveAuditLog(auditable, oldValue, result);
        } catch (Exception e) {
            LOG.error("Erreur lors de l'enregistrement de l'audit : {}", e.getMessage());
        }

        return result;
    }

    private void saveAuditLog(Auditable auditable, String oldValue, Object result) {
        try {
            // Récupérer l'utilisateur connecté
            String login = SecurityContextHolder.getContext().getAuthentication().getName();

            // Récupérer la requête HTTP
            String ipAddress = "unknown";
            String userAgent = "unknown";
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                ipAddress = getClientIp(request);
                userAgent = request.getHeader("User-Agent");
                if (userAgent != null && userAgent.length() > 255) {
                    userAgent = userAgent.substring(0, 255);
                }
            }

            // Sérialiser le nouveau état
            String newValue = null;
            try {
                newValue = objectMapper.writeValueAsString(result);
            } catch (Exception e) {
                LOG.warn("Impossible de sérialiser le nouveau état : {}", e.getMessage());
            }

            // Construire l'entrée d'audit
            AuditLog auditLog = new AuditLog();
            auditLog.setAction(auditable.action());
            auditLog.setEntityType(auditable.entityType());
            auditLog.setOldValue(oldValue);
            auditLog.setNewValue(newValue);
            auditLog.setIpAddress(ipAddress);
            auditLog.setUserAgent(userAgent);
            auditLog.setOccurredAt(Instant.now());

            // Lier l'utilisateur connecté
            userProfileRepository
                .findByJhiUserId(login)
                .ifPresent(userProfile -> {
                    auditLog.setUser(userProfile);
                    // Lier la company de l'utilisateur
                    if (userProfile.getCompany() != null) {
                        auditLog.setCompany(userProfile.getCompany());
                    }
                });

            // Si pas de company via userProfile → prendre la première company
            if (auditLog.getCompany() == null) {
                companyRepository.findAll().stream().findFirst().ifPresent(auditLog::setCompany);
            }

            auditLogRepository.save(auditLog);
            LOG.debug("AuditLog enregistré : {} {} par {}", auditable.action(), auditable.entityType(), login);
        } catch (Exception e) {
            LOG.error("Erreur AuditAspect : {}", e.getMessage());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        // Prendre le premier IP si plusieurs
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "unknown";
    }
}
