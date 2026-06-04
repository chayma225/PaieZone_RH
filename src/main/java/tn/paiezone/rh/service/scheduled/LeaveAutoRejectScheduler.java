package tn.paiezone.rh.service.scheduled;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.LeaveBalance;
import tn.paiezone.rh.domain.LeaveRequest;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;
import tn.paiezone.rh.repository.LeaveBalanceRepository;
import tn.paiezone.rh.repository.LeaveRequestRepository;

/**
 * Chaque matin à 6h : rejette automatiquement toutes les demandes de congé
 * PENDING dont la date de début est passée sans validation RH.
 * Le solde est intégralement restitué à l'employé.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveAutoRejectScheduler {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void autoRejectExpiredRequests() {
        LocalDate today = LocalDate.now();
        List<LeaveRequest> expired = leaveRequestRepository.findByStatusAndStartDateBefore(LeaveStatus.PENDING, today);

        if (expired.isEmpty()) {
            return;
        }

        log.info("⏰ Rejet automatique : {} demande(s) PENDING expirée(s) détectée(s)", expired.size());

        for (LeaveRequest lr : expired) {
            int year = lr.getStartDate().getYear();

            // Restituer les jours au solde de l'employé
            leaveBalanceRepository
                .findByEmployeeIdAndLeaveTypeIdAndYear(lr.getEmployee().getId(), lr.getLeaveType().getId(), year)
                .ifPresent(balance -> restoreBalance(balance, lr.getNumberOfDays()));

            // Mettre à jour le statut
            lr.setStatus(LeaveStatus.REJECTED);
            lr.setProcessedAt(Instant.now());
            lr.setManagerComment(
                "Rejet automatique : aucune validation du responsable avant la date de début (" + lr.getStartDate() + ")."
            );
            leaveRequestRepository.save(lr);

            log.warn(
                "⛔ Congé #{} emp#{} ({} → {}) rejeté automatiquement — date passée sans réponse RH",
                lr.getId(),
                lr.getEmployee().getId(),
                lr.getStartDate(),
                lr.getEndDate()
            );
        }

        log.info("✅ Rejet automatique terminé : {} demande(s) refusée(s)", expired.size());
    }

    private void restoreBalance(LeaveBalance balance, int days) {
        BigDecimal d = BigDecimal.valueOf(days);
        BigDecimal newPending = balance.getPending().subtract(d);
        balance.setPending(newPending.compareTo(BigDecimal.ZERO) >= 0 ? newPending : BigDecimal.ZERO);
        balance.setRemaining(balance.getRemaining().add(d));
        leaveBalanceRepository.save(balance);
    }
}
