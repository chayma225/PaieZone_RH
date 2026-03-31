package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.CnssRate;

/**
 * Spring Data JPA repository for the CnssRate entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CnssRateRepository extends JpaRepository<CnssRate, Long> {}
