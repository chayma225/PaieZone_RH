package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.EmployeeHistory;

@Repository
public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, Long> {
    Page<EmployeeHistory> findByEmployeeIdOrderByChangedAtDesc(Long employeeId, Pageable pageable);

    @Query(
        """
        SELECT eh FROM EmployeeHistory eh
        JOIN eh.employee e
        WHERE (:firstName IS NULL OR LOWER(CAST(e.firstName AS text)) LIKE LOWER(CONCAT('%', CAST(:firstName AS text), '%')))
        AND (:lastName IS NULL OR LOWER(CAST(e.lastName AS text)) LIKE LOWER(CONCAT('%', CAST(:lastName AS text), '%')))
        AND (:departmentId IS NULL OR e.department.id = :departmentId)
        AND (:positionId IS NULL OR e.position.id = :positionId)
        AND (:fieldName IS NULL OR eh.fieldName = :fieldName)
        ORDER BY eh.changedAt DESC
        """
    )
    Page<EmployeeHistory> findWithFilters(
        @Param("firstName") String firstName,
        @Param("lastName") String lastName,
        @Param("departmentId") Long departmentId,
        @Param("positionId") Long positionId,
        @Param("fieldName") String fieldName,
        Pageable pageable
    );

    List<EmployeeHistory> findByEmployeeIdAndFieldNameOrderByChangedAtDesc(Long employeeId, String fieldName);
}
