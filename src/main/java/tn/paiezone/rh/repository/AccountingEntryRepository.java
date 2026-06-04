package tn.paiezone.rh.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AccountingEntry;

/**
 * Spring Data JPA repository for the AccountingEntry entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AccountingEntryRepository extends JpaRepository<AccountingEntry, Long> {
    Page<AccountingEntry> findByCompanyId(Long companyId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM AccountingEntry ae WHERE ae.payrollPeriod.id = :periodId")
    void deleteByPayrollPeriodId(@Param("periodId") Long periodId);
}
