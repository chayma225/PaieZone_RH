package tn.paiezone.rh.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaySlipRepository extends JpaRepository<PaySlip, Long>, JpaSpecificationExecutor<PaySlip> {

    // ── Lookup par employé + période ────────────────────────────────────
    Optional<PaySlip> findByEmployeeIdAndPayrollPeriodId(Long employeeId, Long periodId);

    // ── Comptage pour le workflow de clôture ────────────────────────────
    long countByPayrollPeriodIdAndStatusNot(Long payrollPeriodId, PayrollStatus status);

    // ── Listes par période ───────────────────────────────────────────────
    List<PaySlip> findByPayrollPeriodId(Long periodId);

    // ── Liste par employé (paginée) ──────────────────────────────────────
    // ✅ Une seule méthode findByEmployeeId avec Pageable (suppression du doublon)
    Page<PaySlip> findByEmployeeId(Long employeeId, Pageable pageable);

    // ── Par entreprise + mois + année (pour export CNSS / virement) ─────
    @Query("SELECT ps FROM PaySlip ps " +
        "WHERE ps.payrollPeriod.company.id = :companyId " +
        "AND ps.month = :month AND ps.year = :year")
    List<PaySlip> findByCompanyIdAndMonthAndYear(
        @Param("companyId") Long companyId,
        @Param("month") int month,
        @Param("year") int year
    );

    // ── Bulletins d'une période triés par matricule ──────────────────────
    @Query("SELECT ps FROM PaySlip ps WHERE ps.payrollPeriod.id = :periodId " +
        "ORDER BY ps.employee.matricule ASC")
    List<PaySlip> findAllByPeriodIdOrdered(@Param("periodId") Long periodId);

    // ── Même requête via dérivation (alternative) ────────────────────────
    @Query("""
        SELECT ps FROM PaySlip ps
        WHERE ps.employee.company.id = :companyId
        AND ps.month = :month
        AND ps.year = :year
        """)
    List<PaySlip> findAllByCompanyAndPeriod(
        @Param("companyId") Long companyId,
        @Param("month") int month,
        @Param("year") int year
    );

    // ── Suppression de tous les bulletins d'une période ─────────────────
    @Modifying
    @Transactional
    @Query("DELETE FROM PaySlip ps WHERE ps.payrollPeriod.id = :periodId")
    void deleteByPayrollPeriodId(@Param("periodId") Long periodId);

    // ── Suppression d'un bulletin individuel (recalcul) ──────────────────
    @Modifying
    @Transactional
    @Query("DELETE FROM PaySlip ps WHERE ps.employee.id = :employeeId AND ps.payrollPeriod.id = :periodId")
    void deleteByEmployeeIdAndPayrollPeriodId(
        @Param("employeeId") Long employeeId,
        @Param("periodId") Long periodId
    );
    List<PaySlip> findByEmployee_Company_IdAndMonthAndYear(Long companyId, int month, int year);
}
