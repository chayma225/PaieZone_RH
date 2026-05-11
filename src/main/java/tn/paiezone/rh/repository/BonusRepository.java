package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Bonus;

import java.util.List;

/**
 * Spring Data JPA repository for the Bonus entity.
 */
@SuppressWarnings("unused")
@Repository
public interface BonusRepository extends JpaRepository<Bonus, Long>, JpaSpecificationExecutor<Bonus> {
    // Primes d'un employé pour un mois donné (à intégrer dans son bulletin)
    List<Bonus> findByEmployeeIdAndMonthAndYear(Long employeeId, int month, int year);
    List<Bonus> findByPaySlipId(Long paySlipId);
}
