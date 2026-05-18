package tn.paiezone.rh.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.AuditLog;

/**
 * Spring Data JPA repository for the AuditLog entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {
    List<AuditLog> findTop5ByOrderByOccurredAtDesc();

    List<AuditLog> findTop10ByOrderByOccurredAtDesc();

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.occurredAt >= :since")
    long countSince(Instant since);
}
