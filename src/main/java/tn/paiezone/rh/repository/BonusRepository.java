package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Bonus;

/**
 * Spring Data JPA repository for the Bonus entity.
 */
@SuppressWarnings("unused")
@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long>, JpaSpecificationExecutor<Bonus> {
    @Query("SELECT COUNT(b) FROM Bonus b WHERE b.month = :month AND b.year = :year")
    long countByMonthAndYear(int month, int year);
}
