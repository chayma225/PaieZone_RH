package tn.paiezone.rh.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, Long> {
    /** Toutes les périodes d'une société — triées par année/mois DESC */
    @Query("SELECT p FROM PayrollPeriod p WHERE p.company.id = :companyId " + "ORDER BY p.year DESC, p.month DESC")
    Page<PayrollPeriod> findByCompanyId(@Param("companyId") Long companyId, Pageable pageable);

    /** Vérifie si une période existe déjà (contrainte unicité) */
    boolean existsByCompanyIdAndMonthAndYear(Long companyId, Integer month, Integer year);

    /** Compte les bulletins non calculés d'une période (utilisé pour lockPeriod) */
    @Query("SELECT COUNT(ps) FROM PaySlip ps " + "WHERE ps.payrollPeriod.id = :periodId AND ps.status <> :status")
    long countByPayrollPeriodIdAndStatusNot(@Param("periodId") Long periodId, @Param("status") PayrollStatus status);

    Optional<PayrollPeriod> findByCompanyIdAndMonthAndYear(Long companyId, Integer month, Integer year);
    long countByStatus(PayrollStatus status);
}
