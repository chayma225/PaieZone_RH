package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.LeaveRequest;

/**
 * Spring Data JPA repository for the LeaveRequest entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {
    @Query(
        "SELECT lr FROM LeaveRequest lr WHERE lr.employee.id = :empId " +
            "AND lr.status = 'APPROVED' " +
            "AND MONTH(lr.startDate) = :month AND YEAR(lr.startDate) = :year"
    )
    List<LeaveRequest> findApprovedByEmployeeAndMonth(@Param("empId") Long empId, @Param("month") int month, @Param("year") int year);

    long countByStatus(String status);
}
