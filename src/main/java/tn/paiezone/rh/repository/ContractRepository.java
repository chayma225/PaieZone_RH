package tn.paiezone.rh.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.domain.enumeration.ContractStatus;

/**
 * Spring Data JPA repository for the Contract entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ContractRepository extends JpaRepository<Contract, Long>, JpaSpecificationExecutor<Contract> {
    boolean existsByReference(String reference);

    // Pour les alertes d'expiration
    List<Contract> findByStatusAndEndDateBetween(ContractStatus status, LocalDate start, LocalDate end);

    List<Contract> findByEmployeeIdAndStatus(Long employeeId, ContractStatus status);

    long countByEmployeeIdAndStatus(Long employeeId, ContractStatus status);
    long countByStatus(String status);

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.status = 'ACTIVE' AND c.endDate <= :date")
    long countExpiringWithin30Days();
}
