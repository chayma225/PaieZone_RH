package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.CompanySubscription;

/**
 * Spring Data JPA repository for the CompanySubscription entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, Long> {}
