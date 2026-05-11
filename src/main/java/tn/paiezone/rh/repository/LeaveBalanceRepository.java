package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.paiezone.rh.domain.LeaveBalance;

import java.util.List;
import java.util.Optional;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {

    List<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, int year);

    List<LeaveBalance> findByLeaveTypeIdAndYear(Long leaveTypeId, int year);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(
        Long employeeId, Long leaveTypeId, int year
    );
}
