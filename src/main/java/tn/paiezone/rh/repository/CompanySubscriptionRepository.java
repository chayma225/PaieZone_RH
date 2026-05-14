package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.domain.enumeration.CompanySubscriptionStatus;

/**
 * Spring Data JPA repository for the CompanySubscription entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, Long> {
    // AVANT : @Query("SELECT COUNT(s) FROM Subscription s WHERE s.status = :status")
    // APRÈS (vérifie bien le nom exact de ta classe Entity) :

    @Query("SELECT COUNT(s) FROM CompanySubscription s WHERE s.status = :status")
    long countByStatus(@Param("status") CompanySubscriptionStatus status);
}
