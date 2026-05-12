package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Bonus;

/**
 * Spring Data JPA repository for the Bonus entity.
 */
@SuppressWarnings("unused")
@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long>, JpaSpecificationExecutor<Bonus> {
    // Primes d'un employé pour un mois donné (à intégrer dans son bulletin)
    List<Bonus> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);
    List<Bonus> findByPaySlipId(Long paySlipId);

    @Query("SELECT count(b) FROM Bonus b WHERE b.month = :month AND b.year = :year")
    long countByMonthAndYear(@Param("month") int month, @Param("year") int year);
}
