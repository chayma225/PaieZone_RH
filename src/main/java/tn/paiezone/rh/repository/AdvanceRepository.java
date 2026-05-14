package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

/**
 * Spring Data JPA repository for the Advance entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AdvanceRepository extends JpaRepository<Advance, Long>, JpaSpecificationExecutor<Advance> {
    List<Advance> findByPaySlipId(Long paySlipId);

    @Query(
        "SELECT a FROM Advance a WHERE a.employee.id = :employeeId " +
            "AND a.deductionMonth = :month AND a.deductionYear = :year " +
            "AND a.status = 'APPROVED'"
    )
    List<Advance> findApprovedForDeduction(@Param("employeeId") Long employeeId, @Param("month") int month, @Param("year") int year);

    long countByStatus(AdvanceStatus status);
}
