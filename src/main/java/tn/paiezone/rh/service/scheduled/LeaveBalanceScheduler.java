package tn.paiezone.rh.service.scheduled;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.paiezone.rh.service.LeaveBalanceService;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class LeaveBalanceScheduler {

    private final LeaveBalanceService leaveBalanceService;

    /** 1er du mois à 2h : accumulation mensuelle */
    @Scheduled(cron = "0 0 2 1 * *")
    public void accrueMonthly() {
        log.info("⏰ Démarrage accumulation mensuelle congés");
        leaveBalanceService.accrueMonthlyAnnualLeave();
    }

    /** 31 décembre à 23h : report des congés */
    @Scheduled(cron = "0 0 23 31 12 *")
    public void yearEndCarryOver() {
        int year = LocalDate.now().getYear();
        log.info("⏰ Report congés {} → {}", year, year + 1);
        leaveBalanceService.processYearEndCarryOver(year);
    }
}
