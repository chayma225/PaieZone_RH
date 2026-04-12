package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.EmployeeHistory;

/**
 * Spring Data JPA repository for the EmployeeHistory entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, Long> {}
