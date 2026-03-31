package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.AccountPlan;

/**
 * Spring Data JPA repository for the AccountPlan entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AccountPlanRepository extends JpaRepository<AccountPlan, Long> {}
