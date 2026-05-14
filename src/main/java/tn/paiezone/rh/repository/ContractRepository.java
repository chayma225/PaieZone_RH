package tn.paiezone.rh.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    List<Contract> findByStatusAndEndDateBetween(ContractStatus status, LocalDate start, LocalDate end);

    List<Contract> findByEmployeeIdAndStatus(Long employeeId, ContractStatus status);

    long countByEmployeeIdAndStatus(Long employeeId, ContractStatus status);

    List<Contract> findAllByStatus(ContractStatus status);

    @Query(
        "SELECT c FROM Contract c WHERE c.employee.id = :employeeId " +
            "AND c.startDate <= :date AND (c.endDate IS NULL OR c.endDate >= :date)"
    )
    Optional<Contract> findActiveContractByEmployee(@Param("employeeId") Long employeeId, @Param("date") LocalDate date);

    long countByStatus(ContractStatus status);

    @Query("SELECT count(c) FROM Contract c WHERE c.endDate <= :date AND c.status = 'ACTIVE'")
    long countExpiringWithin30Days(@Param("date") LocalDate date);
}
