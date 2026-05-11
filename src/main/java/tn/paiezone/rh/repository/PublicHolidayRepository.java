package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.paiezone.rh.domain.PublicHoliday;

import java.time.LocalDate;
import java.util.List;

public interface PublicHolidayRepository extends JpaRepository<PublicHoliday, Long> {

    List<PublicHoliday> findByYear(int year);

    List<PublicHoliday> findByYearAndActiveTrue(int year);

    boolean existsByHolidayDate(LocalDate date);
}
