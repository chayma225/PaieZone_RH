package tn.paiezone.rh.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;

import java.util.Optional;

public interface PayrollPeriodService {

    PayrollPeriodDTO save(PayrollPeriodDTO dto);

    PayrollPeriodDTO update(PayrollPeriodDTO dto);

    Optional<PayrollPeriodDTO> partialUpdate(PayrollPeriodDTO dto);

    Page<PayrollPeriodDTO> findAll(Pageable pageable);

    Optional<PayrollPeriodDTO> findOne(Long id);

    void delete(Long id);

    /** Déclenche le calcul batch et retourne le résultat */
    BulkCalculationResultDTO triggerCalculation(Long periodId);

    /** Valide la période (CALCULATED → VALIDATED) */
    void validatePeriod(Long periodId);

    /** Clôture la période (VALIDATED → LOCKED) */
    void lockPeriod(Long periodId);

    // Méthodes de compatibilité (ancien code)
    void calculatePayroll(Long periodId);
}
