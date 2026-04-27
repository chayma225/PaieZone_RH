package tn.paiezone.rh.web.rest;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.security.AuthoritiesConstants;

/**
 * REST controller pour les données du Dashboard.
 * Adapte les statistiques selon le rôle de l'utilisateur connecté.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    private static final Logger LOG = LoggerFactory.getLogger(DashboardResource.class);

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final JobPositionRepository jobPositionRepository;
    private final ContractRepository contractRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PaySlipRepository paySlipRepository;
    private final PayrollPeriodRepository payrollPeriodRepository;
    private final BonusRepository bonusRepository;
    private final AdvanceRepository advanceRepository;
    private final AuditLogRepository auditLogRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final CompanyRepository companyRepository;
    private final CompanySubscriptionRepository companySubscriptionRepository;

    public DashboardResource(
        EmployeeRepository employeeRepository,
        DepartmentRepository departmentRepository,
        JobPositionRepository jobPositionRepository,
        ContractRepository contractRepository,
        LeaveRequestRepository leaveRequestRepository,
        PaySlipRepository paySlipRepository,
        PayrollPeriodRepository payrollPeriodRepository,
        BonusRepository bonusRepository,
        AdvanceRepository advanceRepository,
        AuditLogRepository auditLogRepository,
        ChatSessionRepository chatSessionRepository,
        CompanyRepository companyRepository,
        CompanySubscriptionRepository companySubscriptionRepository
    ) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.jobPositionRepository = jobPositionRepository;
        this.contractRepository = contractRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.paySlipRepository = paySlipRepository;
        this.payrollPeriodRepository = payrollPeriodRepository;
        this.bonusRepository = bonusRepository;
        this.advanceRepository = advanceRepository;
        this.auditLogRepository = auditLogRepository;
        this.chatSessionRepository = chatSessionRepository;
        this.companyRepository = companyRepository;
        this.companySubscriptionRepository = companySubscriptionRepository;
    }

    // =========================================================
    // GET /api/dashboard/stats
    // =========================================================

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getStats() {
        LOG.debug("REST request to get Dashboard stats");

        Map<String, Object> stats = new HashMap<>();

        // --- Stats communes à tous les rôles ---
        stats.put("totalEmployees", employeeRepository.count());
        stats.put("activeEmployees", employeeRepository.countByActiveTrue());
        stats.put("departments", departmentRepository.count());
        stats.put("positions", jobPositionRepository.count());
        stats.put("activeContracts", contractRepository.countByStatus("ACTIVE"));
        stats.put("expiringContracts", contractRepository.countExpiringWithin30Days());
        stats.put("chatSessions", chatSessionRepository.countByStatus("ACTIVE"));

        // --- Congés ---
        stats.put("pendingLeaves", leaveRequestRepository.countByStatus("PENDING"));
        stats.put("approvedLeaves", leaveRequestRepository.countByStatus("APPROVED"));

        // --- Paie ---
        stats.put("payrollDrafts", payrollPeriodRepository.countByStatus("DRAFT"));
        stats.put("payrollValidated", payrollPeriodRepository.countByStatus("VALIDATED"));

        // --- RH_COMPTABLE ---
        int currentMonth = java.time.LocalDate.now().getMonthValue();
        int currentYear = java.time.LocalDate.now().getYear();
        stats.put("pendingAdvances", advanceRepository.countByStatus("REQUESTED"));
        stats.put("bonusThisMonth", bonusRepository.countByMonthAndYear(currentMonth, currentYear));

        // --- ADMIN / SUPER_ADMIN ---
        stats.put("auditLogsToday", auditLogRepository.countSince(Instant.now().minus(24, ChronoUnit.HOURS)));

        // --- SUPER_ADMIN uniquement ---
        stats.put("totalCompanies", companyRepository.count());
        stats.put("activeSubscriptions", companySubscriptionRepository.countByStatus("ACTIVE"));

        return ResponseEntity.ok(stats);
    }

    // =========================================================
    // GET /api/dashboard/activity
    // =========================================================

    @GetMapping("/activity")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "', '" +
            AuthoritiesConstants.MANAGER +
            "')"
    )
    public ResponseEntity<List<Map<String, String>>> getRecentActivity() {
        LOG.debug("REST request to get recent activity");

        // Ici vous pouvez construire une vraie liste depuis AuditLog
        // Pour l'instant on retourne les 5 derniers logs d'audit
        List<Map<String, String>> activities = new ArrayList<>();

        auditLogRepository
            .findTop5ByOrderByOccurredAtDesc()
            .forEach(log -> {
                Map<String, String> item = new LinkedHashMap<>();
                item.put("type", mapActionToType(log.getAction()));
                item.put("message", log.getAction() + " — " + log.getEntityType());
                item.put("timestamp", formatRelativeTime(log.getOccurredAt()));
                item.put("severity", mapActionToSeverity(log.getAction()));
                activities.add(item);
            });

        return ResponseEntity.ok(activities);
    }

    // =========================================================
    // Helpers privés
    // =========================================================

    private String mapActionToType(String action) {
        if (action == null) return "OTHER";
        if (action.contains("LEAVE")) return "LEAVE";
        if (action.contains("PAY") || action.contains("PAYSLIP")) return "PAYSLIP";
        if (action.contains("CONTRACT")) return "CONTRACT";
        return "AUDIT";
    }

    private String mapActionToSeverity(String action) {
        if (action == null) return "info";
        return switch (action.toUpperCase()) {
            case "DELETE" -> "danger";
            case "CREATE" -> "success";
            case "UPDATE", "PATCH" -> "warning";
            default -> "info";
        };
    }

    private String formatRelativeTime(Instant instant) {
        if (instant == null) return "—";
        long minutes = ChronoUnit.MINUTES.between(instant, Instant.now());
        if (minutes < 60) return "Il y a " + minutes + " min";
        long hours = ChronoUnit.HOURS.between(instant, Instant.now());
        if (hours < 24) return "Il y a " + hours + "h";
        return "Hier";
    }
}
