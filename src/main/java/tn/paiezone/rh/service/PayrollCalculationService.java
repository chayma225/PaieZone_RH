package tn.paiezone.rh.service;

import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;

public interface PayrollCalculationService {

    /**
     * Calcule le bulletin de paie pour UN employé sur une période.
     * Peut être appelé plusieurs fois (recalcul) tant que la période n'est pas LOCKED.
     */
    PaySlip calculatePaySlip(Long employeeId, Long periodId);

    /**
     * Calcule TOUS les bulletins d'une période en mode batch.
     * Les erreurs par employé sont capturées et retournées — elles n'arrêtent pas le traitement.
     */
    BulkCalculationResultDTO calculateAllPaySlips(Long periodId);

    void calculate(Long id);

    PaySlip recalculatePaySlip(Long paySlipId);
}
