package tn.paiezone.rh.repository;

import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
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

    List<AuditLog> findTop20ByOrderByOccurredAtDesc();

    List<AuditLog> findTop20ByCompany_IdOrderByOccurredAtDesc(Long companyId);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.occurredAt >= :since")
    long countSince(Instant since);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.company.id = :companyId AND a.occurredAt >= :since")
    long countByCompanyIdSince(@Param("companyId") Long companyId, @Param("since") Instant since);
}
