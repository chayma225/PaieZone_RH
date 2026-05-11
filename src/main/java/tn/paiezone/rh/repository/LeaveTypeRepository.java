package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.domain.enumeration.LeaveTypeName;

import java.util.List;
import java.util.Optional;

public interface LeaveTypeRepository extends JpaRepository<LeaveType, Long> {

    Optional<LeaveType> findByName(LeaveTypeName name);

    List<LeaveType> findByActiveTrueOrderByNameAsc();
}
