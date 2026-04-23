package tn.paiezone.rh.aop.logging.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import tn.paiezone.rh.service.AuditService;

@Aspect
@Component
public class AuditAspect {

    private static final Logger LOG = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditService auditService;
    private final ObjectMapper objectMapper;

    public AuditAspect(AuditService auditService, ObjectMapper objectMapper) {
        this.auditService = auditService;
        this.objectMapper = objectMapper;
    }

    @Around("@annotation(auditable)")
    public Object auditMethod(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String oldValue = null;
        try {
            Object[] args = joinPoint.getArgs();
            if (args != null && args.length > 0 && args[0] != null) {
                oldValue = objectMapper.writeValueAsString(args[0]);
            }
        } catch (Exception e) {
            LOG.warn("Impossible de sérialiser l'ancien état : {}", e.getMessage());
        }

        Object result = joinPoint.proceed();

        try {
            Object valueToSave = result;
            if (result instanceof org.springframework.http.ResponseEntity<?> responseEntity) {
                valueToSave = responseEntity.getBody();
            }

            // Extraction des infos de contexte (IP, User-Agent, Login)
            String login = SecurityContextHolder.getContext().getAuthentication().getName();
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

            // Appel au Service (Architecture respectée !)
            auditService.saveAuditLog(login, auditable.action(), auditable.entityType(), oldValue, valueToSave, ipAddress, userAgent);
        } catch (Exception e) {
            LOG.error("Erreur AuditAspect : {}", e.getMessage());
        }

        return result;
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) ip = request.getHeader("X-Real-IP");
        if (ip == null || ip.isEmpty()) ip = request.getRemoteAddr();
        if (ip != null && ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip != null ? ip : "unknown";
    }
}
