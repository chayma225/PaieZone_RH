package tn.paiezone.rh.service.scheduled;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;
import tn.paiezone.rh.repository.TimeEntryRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TimeEntryAnomalyScheduler {

    private final TimeEntryRepository timeEntryRepository;

    private static final BigDecimal MAX_DAILY_HOURS  = new BigDecimal("12");
    private static final BigDecimal MIN_DAILY_HOURS  = new BigDecimal("1");

    /** Chaque soir lun-ven à 23h : détection des anomalies du jour */
    @Scheduled(cron = "0 0 23 * * MON-FRI")
    @Transactional
    public void detectAnomalies() {
        LocalDate today = LocalDate.now();
        List<TimeEntry> pending = timeEntryRepository
            .findByStatusAndEntryDate(TimeEntryStatus.PENDING, today);

        int anomalies = 0;

        for (TimeEntry entry : pending) {

            // Cas 1 : Check-in manquant
            if (entry.getCheckIn() == null) {
                markAnomaly(entry, "Check-in manquant");
                anomalies++;
                continue;
            }

            // Cas 2 : Check-out manquant après 23h
            if (entry.getCheckOut() == null) {
                markAnomaly(entry, "Check-out manquant");
                anomalies++;
                continue;
            }

            // Cas 3 : Durée anormalement longue (> 12h)
            if (entry.getWorkedHours() != null &&
                entry.getWorkedHours().compareTo(MAX_DAILY_HOURS) > 0) {
                markAnomaly(entry, "Durée anormale : " + entry.getWorkedHours() + "h");
                anomalies++;
                continue;
            }

            // Cas 4 : Durée trop courte (< 1h — probable erreur de badgeage)
            if (entry.getWorkedHours() != null &&
                entry.getWorkedHours().compareTo(MIN_DAILY_HOURS) < 0) {
                markAnomaly(entry, "Durée trop courte : " + entry.getWorkedHours() + "h");
                anomalies++;
            }
        }

        timeEntryRepository.saveAll(pending);
        log.info("🔍 Anomalies pointage détectées : {}/{} pour le {}",
            anomalies, pending.size(), today);
    }

    private void markAnomaly(TimeEntry entry, String note) {
        entry.setStatus(TimeEntryStatus.ANOMALY);
        entry.setAnomalyNote(note);
    }
}
