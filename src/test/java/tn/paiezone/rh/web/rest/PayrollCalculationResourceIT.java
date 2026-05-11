package tn.paiezone.rh.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.service.PayrollCalculationService;
import tn.paiezone.rh.service.PayrollPeriodService;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;

@RestController
@RequestMapping("/api/payroll-periods")
public class PayrollCalculationResourceIT {

    private final Logger log = LoggerFactory.getLogger(PayrollCalculationResource.class);

    private final PayrollCalculationService payrollCalculationService;
    private final PayrollPeriodService payrollPeriodService;

    public PayrollCalculationResourceIT(
        PayrollCalculationService payrollCalculationService,
        PayrollPeriodService payrollPeriodService
    ) {
        this.payrollCalculationService = payrollCalculationService;
        this.payrollPeriodService = payrollPeriodService;
    }

    /**
     * POST  /{id}/calculate-all : Lance le calcul de la paie pour tous les employés d'une période.
     */
    @PostMapping("/{id}/calculate-all")
    public ResponseEntity<BulkCalculationResultDTO> calculateAll(@PathVariable Long id) {
        log.debug("REST request to calculate all PaySlips for period : {}", id);
        BulkCalculationResultDTO result = payrollCalculationService.calculateAllPaySlips(id);
        return ResponseEntity.ok().body(result);
    }

    /**
     * POST  /{id}/lock : Verrouille la période de paie.
     */

    @PostMapping("/{id}/lock")
    public ResponseEntity<Void> lockPeriod(@PathVariable Long id) {
        log.debug("REST request to lock period : {}", id);
        payrollPeriodService.lockPeriod(id);
        return ResponseEntity.ok().build();
    }
    /**
     * POST  /{id}/calculate/{employeeId} : Calcule la paie pour un employé spécifique.
     */
    @PostMapping("/{id}/calculate/{employeeId}")
    public ResponseEntity<Void> calculateOne(@PathVariable Long id, @PathVariable Long employeeId) {
        log.debug("REST request to calculate PaySlip for employee {} in period {}", employeeId, id);
        payrollCalculationService.calculatePaySlip(employeeId, id);
        return ResponseEntity.ok().build();
    }
}
