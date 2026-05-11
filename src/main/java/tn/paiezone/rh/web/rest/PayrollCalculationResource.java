package tn.paiezone.rh.web.rest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.service.impl.PayrollCalculationServiceImpl;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PayrollCalculationResource {

    private final PayrollCalculationServiceImpl service;

    // ── Calcul d'un seul employé ──────────────────────────────────
    // Unique à ce controller — absent de PayrollPeriodResource
    @PostMapping("/payroll-periods/{periodId}/calculate/{employeeId}")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> calculateOne(
        @PathVariable Long periodId,
        @PathVariable Long employeeId) {
        service.calculatePaySlip(employeeId, periodId);
        return ResponseEntity.ok().build();
    }

    // ── Recalcul d'un bulletin existant ───────────────────────────
    // Unique à ce controller — absent de PayrollPeriodResource
    @PostMapping("/payslips/{paySlipId}/recalculate")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> recalculate(@PathVariable Long paySlipId) {
        service.recalculatePaySlip(paySlipId);
        return ResponseEntity.ok().build();
    }

}
