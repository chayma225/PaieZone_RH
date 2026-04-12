package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PayrollPeriod;

/**
 * Spring Data JPA repository for the PayrollPeriod entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, Long> {}
