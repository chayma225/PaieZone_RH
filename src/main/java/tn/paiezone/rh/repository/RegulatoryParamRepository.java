package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.RegulatoryParam;

/**
 * Spring Data JPA repository for the RegulatoryParam entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RegulatoryParamRepository extends JpaRepository<RegulatoryParam, Long> {}
