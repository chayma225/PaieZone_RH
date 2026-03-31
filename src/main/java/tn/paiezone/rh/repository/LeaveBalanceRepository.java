package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.LeaveBalance;

/**
 * Spring Data JPA repository for the LeaveBalance entity.
 */
@SuppressWarnings("unused")
@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, Long> {}
