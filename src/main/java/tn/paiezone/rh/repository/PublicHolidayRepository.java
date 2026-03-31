package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PublicHoliday;

/**
 * Spring Data JPA repository for the PublicHoliday entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PublicHolidayRepository extends JpaRepository<PublicHoliday, Long> {}
