package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PaySlip;

/**
 * Spring Data JPA repository for the PaySlip entity.
 */
@SuppressWarnings("unused")
@Repository
public interface PaySlipRepository extends JpaRepository<PaySlip, Long>, JpaSpecificationExecutor<PaySlip> {}
