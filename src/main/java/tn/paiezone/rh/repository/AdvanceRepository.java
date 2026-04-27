package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

/**
 * Spring Data JPA repository for the Advance entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AdvanceRepository extends JpaRepository<Advance, Long>, JpaSpecificationExecutor<Advance> {
    long countByStatus(AdvanceStatus status);

    // ou :
    @Query("SELECT COUNT(a) FROM Advance a WHERE a.status = :status")
    long countByStatus(String status);
}
