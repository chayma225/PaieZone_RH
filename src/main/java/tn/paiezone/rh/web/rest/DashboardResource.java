package tn.paiezone.rh.web.rest;

import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;
import tn.paiezone.rh.domain.enumeration.CompanySubscriptionStatus;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.TenantContextService;

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
    private final TenantContextService tenantContextService;
    // Calcule la date limite (27 Avril + 30 jours = 27 Mai)
    LocalDate limite = LocalDate.now().plusDays(30);

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
        CompanySubscriptionRepository companySubscriptionRepository,
        TenantContextService tenantContextService
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
        this.tenantContextService = tenantContextService;
    }

    // =========================================================
    // GET /api/dashboard/stats
    // =========================================================

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getStats() {
        LOG.debug("REST request to get Dashboard stats");

        Long companyId = tenantContextService.getCurrentCompanyId();
        Map<String, Object> stats = new HashMap<>();

        int currentMonth = java.time.LocalDate.now().getMonthValue();
        int currentYear = java.time.LocalDate.now().getYear();

        if (companyId != null) {
            stats.put("totalEmployees", employeeRepository.countByCompanyId(companyId));
            stats.put("activeEmployees", employeeRepository.countByCompanyIdAndActiveTrue(companyId));
            stats.put("departments", departmentRepository.countByCompanyId(companyId));
            stats.put("positions", jobPositionRepository.countByCompanyId(companyId));
            stats.put("expiringContracts", contractRepository.countExpiringWithin30DaysByCompanyId(limite, companyId));
            stats.put("pendingLeaves", leaveRequestRepository.countByEmployee_Company_IdAndStatus(companyId, LeaveStatus.PENDING));
            stats.put("approvedLeaves", leaveRequestRepository.countByEmployee_Company_IdAndStatus(companyId, LeaveStatus.APPROVED));
            stats.put("payrollDrafts", payrollPeriodRepository.countByCompanyIdAndStatus(companyId, PayrollStatus.DRAFT));
            stats.put("payrollValidated", payrollPeriodRepository.countByCompanyIdAndStatus(companyId, PayrollStatus.VALIDATED));
            stats.put("pendingAdvances", advanceRepository.countByEmployee_Company_IdAndStatus(companyId, AdvanceStatus.REQUESTED));
            stats.put("bonusThisMonth", bonusRepository.countByCompanyIdAndMonthAndYear(companyId, currentMonth, currentYear));
            stats.put("auditLogsToday", auditLogRepository.countByCompanyIdSince(companyId, Instant.now().minus(24, ChronoUnit.HOURS)));
            // SUPER_ADMIN stats masquées pour les admins tenant
            stats.put("totalCompanies", 1L);
            stats.put("activeSubscriptions", companySubscriptionRepository.countByStatus(CompanySubscriptionStatus.ACTIVE));
        } else {
            // SUPER_ADMIN : voit tout
            stats.put("totalEmployees", employeeRepository.count());
            stats.put("activeEmployees", employeeRepository.countByActiveTrue());
            stats.put("departments", departmentRepository.count());
            stats.put("positions", jobPositionRepository.count());
            stats.put("expiringContracts", contractRepository.countExpiringWithin30Days(limite));
            stats.put("pendingLeaves", leaveRequestRepository.countByStatus(LeaveStatus.PENDING));
            stats.put("approvedLeaves", leaveRequestRepository.countByStatus(LeaveStatus.APPROVED));
            stats.put("payrollDrafts", payrollPeriodRepository.countByStatus(PayrollStatus.DRAFT));
            stats.put("payrollValidated", payrollPeriodRepository.countByStatus(PayrollStatus.VALIDATED));
            stats.put("pendingAdvances", advanceRepository.countByStatus(AdvanceStatus.REQUESTED));
            stats.put("bonusThisMonth", bonusRepository.countByMonthAndYear(currentMonth, currentYear));
            stats.put("auditLogsToday", auditLogRepository.countSince(Instant.now().minus(24, ChronoUnit.HOURS)));
            stats.put("totalCompanies", companyRepository.count());
            stats.put("activeSubscriptions", companySubscriptionRepository.countByStatus(CompanySubscriptionStatus.ACTIVE));
        }

        return ResponseEntity.ok(stats);
    }

    // =========================================================
    // GET /api/dashboard/activity
    // =========================================================

    private static final ZoneId TN = ZoneId.of("Africa/Tunis");
    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");
    private static final String[] MONTHS_FR = {
        "janvier",
        "février",
        "mars",
        "avril",
        "mai",
        "juin",
        "juillet",
        "août",
        "septembre",
        "octobre",
        "novembre",
        "décembre",
    };

    @GetMapping("/activity")
    @PreAuthorize("isAuthenticated()")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, String>>> getRecentActivity() {
        LOG.debug("REST request to get recent activity");

        Long companyId = tenantContextService.getCurrentCompanyId();
        List<Map<String, String>> activities = new ArrayList<>();
        LocalDate today = LocalDate.now(TN);
        LocalDate yesterday = today.minusDays(1);

        List<AuditLog> logs =
            companyId != null
                ? auditLogRepository.findTop20ByCompany_IdOrderByOccurredAtDesc(companyId)
                : auditLogRepository.findTop20ByOrderByOccurredAtDesc();

        logs.forEach(log -> {
            ZonedDateTime zdt = log.getOccurredAt().atZone(TN);
            LocalDate logDate = zdt.toLocalDate();

            String dateLabel;
            if (logDate.equals(today)) dateLabel = "Aujourd'hui";
            else if (logDate.equals(yesterday)) dateLabel = "Hier";
            else dateLabel = logDate.getDayOfMonth() + "/" + String.format("%02d", logDate.getMonthValue());

            String userLogin = log.getUser() != null ? formatLogin(log.getUser().getJhiUserId()) : "Système";

            Map<String, String> item = new LinkedHashMap<>();
            item.put("icon", actionIcon(log.getAction(), log.getEntityType()));
            item.put("userLogin", userLogin);
            item.put("message", buildMessage(log.getAction(), log.getEntityType(), userLogin));
            item.put("dateLabel", dateLabel);
            item.put("timeHm", zdt.format(HM));
            item.put("entityType", log.getEntityType() != null ? log.getEntityType() : "");
            item.put("entityId", log.getEntityId() != null ? String.valueOf(log.getEntityId()) : "");
            activities.add(item);
        });

        return ResponseEntity.ok(activities);
    }

    // =========================================================
    // GET /api/dashboard/payroll-chart   (6 derniers mois)
    // =========================================================

    @GetMapping("/payroll-chart")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getPayrollChart() {
        LOG.debug("REST request to get payroll chart data");

        Long companyId = tenantContextService.getCurrentCompanyId();
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusMonths(5).withDayOfMonth(1);

        int fromYm = from.getYear() * 100 + from.getMonthValue();
        int toYm = today.getYear() * 100 + today.getMonthValue();

        // Résultats DB : [month, year, sumGross, sumCharges]
        Map<String, double[]> dbMap = new HashMap<>();
        List<Object[]> rows =
            companyId != null
                ? paySlipRepository.aggregatePayrollByMonthAndCompany(companyId, fromYm, toYm)
                : paySlipRepository.aggregatePayrollByMonth(fromYm, toYm);
        rows.forEach(row -> {
            int m = ((Number) row[0]).intValue();
            int y = ((Number) row[1]).intValue();
            double brut = ((Number) row[2]).doubleValue();
            double charges = ((Number) row[3]).doubleValue();
            dbMap.put(y + "-" + m, new double[] { brut, charges });
        });

        // Construire la série complète des 6 mois (même si 0)
        List<Map<String, Object>> series = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate d = today.minusMonths(i);
            int m = d.getMonthValue(),
                y = d.getYear();
            double[] vals = dbMap.getOrDefault(y + "-" + m, new double[] { 0.0, 0.0 });

            Map<String, Object> pt = new LinkedHashMap<>();
            pt.put("month", m);
            pt.put("year", y);
            pt.put("label", shortMonth(m));
            pt.put("brut", vals[0]);
            pt.put("charges", vals[1]);
            series.add(pt);
        }

        return ResponseEntity.ok(series);
    }

    // =========================================================
    // GET /api/dashboard/contract-alerts
    // =========================================================

    @GetMapping("/contract-alerts")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_RH_COMPTABLE')")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Map<String, Object>>> getContractAlerts() {
        try {
            Long companyId = tenantContextService.getCurrentCompanyId();
            LocalDate today = LocalDate.now();
            LocalDate limit = today.plusDays(30);

            LOG.info("contract-alerts: recherche entre {} et {}", today, limit);

            List<Contract> contracts =
                companyId != null
                    ? contractRepository.findByStatusAndEndDateBetweenAndCompanyId(ContractStatus.ACTIVE, today, limit, companyId)
                    : contractRepository.findByStatusAndEndDateBetween(ContractStatus.ACTIVE, today, limit);

            List<Map<String, Object>> alerts = contracts
                .stream()
                .map(c -> {
                    long daysLeft = ChronoUnit.DAYS.between(today, c.getEndDate());
                    String empName = "N/A";
                    try {
                        if (c.getEmployee() != null) {
                            empName = c.getEmployee().getFirstName() + " " + c.getEmployee().getLastName();
                        }
                    } catch (Exception ex) {
                        LOG.warn("Impossible de charger l'employé du contrat {}: {}", c.getId(), ex.getMessage());
                    }
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("reference", c.getReference() != null ? c.getReference() : "");
                    m.put("contractType", c.getContractType() != null ? c.getContractType().name() : "");
                    m.put("endDate", c.getEndDate().toString());
                    m.put("daysLeft", daysLeft);
                    m.put("employeeName", empName);
                    return m;
                })
                .toList();

            LOG.info("contract-alerts: {} contrat(s) trouvé(s)", alerts.size());
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            LOG.error("ERREUR contract-alerts: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    // =========================================================
    // Helpers privés
    // =========================================================

    private String shortMonth(int m) {
        return switch (m) {
            case 1 -> "Jan";
            case 2 -> "Fév";
            case 3 -> "Mars";
            case 4 -> "Avr";
            case 5 -> "Mai";
            case 6 -> "Jun";
            case 7 -> "Jul";
            case 8 -> "Aoû";
            case 9 -> "Sep";
            case 10 -> "Oct";
            case 11 -> "Nov";
            case 12 -> "Déc";
            default -> String.valueOf(m);
        };
    }

    /** "salma.bouzidi" → "Salma Bouzidi" */
    private String formatLogin(String login) {
        if (login == null || login.isBlank()) return "Utilisateur";
        String[] parts = login.replace('.', ' ').replace('_', ' ').split(" ");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (!p.isEmpty()) {
                if (!sb.isEmpty()) sb.append(' ');
                sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1).toLowerCase());
            }
        }
        return sb.toString();
    }

    private String actionIcon(String action, String entity) {
        if (action == null) return "History";
        return switch (action.toUpperCase()) {
            case "CREATE" -> entityIcon(entity);
            case "UPDATE", "PATCH" -> "Edit";
            case "DELETE" -> "Trash";
            case "ACTIVATE" -> "Check";
            case "TERMINATE" -> "X";
            case "APPROVE_LEAVE", "APPROVE" -> "Check";
            case "REJECT_LEAVE", "REJECT" -> "X";
            case "CALCULATE_PAYROLL", "CALCULATE" -> "Cash";
            case "VALIDATE_PAYROLL", "VALIDATE" -> "Check";
            case "LOCK_PAYROLL", "LOCK" -> "Lock";
            case "TOGGLE_STATUS" -> "Globe";
            default -> "History";
        };
    }

    private String entityIcon(String entity) {
        if (entity == null) return "History";
        return switch (entity.toUpperCase()) {
            case "EMPLOYEE", "USERPROFILE" -> "User";
            case "CONTRACT" -> "Doc";
            case "LEAVEREQUEST", "LEAVE" -> "Calendar";
            case "ADVANCE" -> "Cash";
            case "PAYSLIP", "PAYROLLPERIOD" -> "Cash";
            case "COMPANY" -> "Building";
            case "DEPARTMENT" -> "Users";
            default -> "History";
        };
    }

    private String buildMessage(String action, String entity, String userLogin) {
        if (action == null) return "Action inconnue";
        String ent = entity != null ? entity.toLowerCase() : "entité";
        return switch (action.toUpperCase()) {
            case "CREATE" -> userLogin + " a créé un(e) " + translateEntity(ent);
            case "UPDATE" -> userLogin + " a mis à jour un(e) " + translateEntity(ent);
            case "PATCH" -> userLogin + " a modifié un(e) " + translateEntity(ent);
            case "DELETE" -> userLogin + " a supprimé un(e) " + translateEntity(ent);
            case "ACTIVATE" -> userLogin + " a activé un contrat";
            case "TERMINATE" -> userLogin + " a résilié un contrat";
            case "APPROVE_LEAVE", "APPROVE" -> userLogin + " a approuvé une demande de congé";
            case "REJECT_LEAVE", "REJECT" -> userLogin + " a rejeté une demande de congé";
            case "CALCULATE_PAYROLL", "CALCULATE" -> userLogin + " a lancé le calcul de la paie";
            case "VALIDATE_PAYROLL", "VALIDATE" -> userLogin + " a validé la période de paie";
            case "LOCK_PAYROLL", "LOCK" -> userLogin + " a verrouillé la période de paie";
            case "TOGGLE_STATUS" -> userLogin + " a changé le statut d'une " + translateEntity(ent);
            default -> userLogin + " — " + action + " / " + ent;
        };
    }

    private String translateEntity(String ent) {
        return switch (ent.toLowerCase()) {
            case "employee" -> "employé";
            case "contract" -> "contrat";
            case "leaverequest", "leave" -> "demande de congé";
            case "advance" -> "avance sur salaire";
            case "company" -> "entreprise";
            case "department" -> "département";
            case "jobposition" -> "poste";
            case "userprofile" -> "utilisateur";
            case "payslip" -> "bulletin de paie";
            case "payrollperiod" -> "période de paie";
            default -> ent;
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
