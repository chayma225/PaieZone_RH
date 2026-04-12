package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PaySlipLine;

/**
 * Spring Data JPA repository for the PaySlipLine entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PaySlipLineRepository extends JpaRepository<PaySlipLine, Long> {}
