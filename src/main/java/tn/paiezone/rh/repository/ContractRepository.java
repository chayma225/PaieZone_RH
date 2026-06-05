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

    @Query("SELECT c FROM Contract c JOIN FETCH c.employee WHERE c.status = :status AND c.endDate BETWEEN :start AND :end")
    List<Contract> findByStatusAndEndDateBetween(
        @Param("status") ContractStatus status,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    List<Contract> findByEmployeeIdAndStatus(Long employeeId, ContractStatus status);

    long countByEmployeeIdAndStatus(Long employeeId, ContractStatus status);

    List<Contract> findAllByStatus(ContractStatus status);

    @Query(
        "SELECT c FROM Contract c WHERE c.employee.id = :employeeId " +
            "AND c.startDate <= :periodEnd AND (c.endDate IS NULL OR c.endDate >= :periodStart)"
    )
    Optional<Contract> findActiveContractByEmployee(
        @Param("employeeId") Long employeeId,
        @Param("periodStart") LocalDate periodStart,
        @Param("periodEnd") LocalDate periodEnd
    );

    long countByStatus(ContractStatus status);

    long countByEmployee_Company_IdAndStatus(Long companyId, ContractStatus status);

    java.util.Optional<Contract> findFirstByEmployeeIdAndStatusOrderByStartDateDesc(Long employeeId, ContractStatus status);

    java.util.Optional<Contract> findFirstByEmployeeIdOrderByStartDateDesc(Long employeeId);

    @Query("SELECT count(c) FROM Contract c WHERE c.endDate <= :date AND c.status = 'ACTIVE'")
    long countExpiringWithin30Days(@Param("date") LocalDate date);

    @Query("SELECT count(c) FROM Contract c WHERE c.endDate <= :date AND c.status = 'ACTIVE' AND c.employee.company.id = :companyId")
    long countExpiringWithin30DaysByCompanyId(@Param("date") LocalDate date, @Param("companyId") Long companyId);

    @Query(
        "SELECT c FROM Contract c JOIN FETCH c.employee WHERE c.status = :status AND c.endDate BETWEEN :start AND :end AND c.employee.company.id = :companyId"
    )
    List<Contract> findByStatusAndEndDateBetweenAndCompanyId(
        @Param("status") ContractStatus status,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end,
        @Param("companyId") Long companyId
    );

    @Query(
        "SELECT c FROM Contract c JOIN FETCH c.employee WHERE c.status = :status AND c.trialPeriodMonths IS NOT NULL AND c.trialPeriodMonths > 0 AND c.employee.company.id = :companyId"
    )
    List<Contract> findActiveWithTrialByCompany(@Param("status") ContractStatus status, @Param("companyId") Long companyId);

    @Query(
        "SELECT c FROM Contract c JOIN FETCH c.employee WHERE c.status = :status AND c.trialPeriodMonths IS NOT NULL AND c.trialPeriodMonths > 0"
    )
    List<Contract> findActiveWithTrial(@Param("status") ContractStatus status);
}
