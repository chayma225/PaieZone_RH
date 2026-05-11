package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;

import java.time.LocalDate;
import java.util.List;

public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long>, JpaSpecificationExecutor<TimeEntry> {
    List<TimeEntry> findByEmployeeIdAndEntryDateBetweenAndStatus(
        Long empId, LocalDate from, LocalDate to, TimeEntryStatus status);

    List<TimeEntry> findByStatusAndEntryDate(TimeEntryStatus status, LocalDate date);
    @Query("SELECT COUNT(t) FROM TimeEntry t " +
        "WHERE t.employee.id = :empId " +
        "AND t.status = 'ANOMALY' " +
        "AND MONTH(t.entryDate) = :month " +
        "AND YEAR(t.entryDate)  = :year")
    long countAnomaliesByEmployeeAndMonth(
        @Param("empId") Long empId,
        @Param("month") int month,
        @Param("year")  int year
    );

    @Query("SELECT t FROM TimeEntry t WHERE t.employee.id = :empId " +
        "AND t.status = 'VALIDATED' " +
        "AND MONTH(t.entryDate) = :month AND YEAR(t.entryDate) = :year")
    List<TimeEntry> findValidatedByEmployeeAndMonth(
        @Param("empId") Long empId,
        @Param("month") int month,
        @Param("year") int year
    );
}
