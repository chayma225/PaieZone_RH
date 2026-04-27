package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

/**
 * Spring Data JPA repository for the PayrollPeriod entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, Long> {
    long countByStatus(PayrollStatus status);

    // ou avec String :
    @Query("SELECT COUNT(p) FROM PayrollPeriod p WHERE p.status = :status")
    long countByStatus(String status);
}
