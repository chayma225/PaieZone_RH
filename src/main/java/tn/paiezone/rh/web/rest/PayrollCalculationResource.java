package tn.paiezone.rh.web.rest;

import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;
import tn.paiezone.rh.service.impl.PayrollCalculationServiceImpl;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class PayrollCalculationResource {

    private final PayrollCalculationServiceImpl service;
    private final RegulatoryParamRepository regulatoryParamRepository;

    // ── Calcul d'un seul employé ─────────────────────────────────
    @PostMapping("/payroll-periods/{periodId}/calculate/{employeeId}")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> calculateOne(@PathVariable Long periodId, @PathVariable Long employeeId) {
        service.calculatePaySlip(employeeId, periodId);
        return ResponseEntity.ok().build();
    }

    // ── Recalcul d'un seul bulletin ──────────────────────────────
    @PostMapping("/payslips/{paySlipId}/recalculate")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<Void> recalculate(@PathVariable Long paySlipId) {
        service.recalculatePaySlip(paySlipId);
        return ResponseEntity.ok().build();
    }

    // ── Recalcul forcé de TOUS les bulletins d'une période ───────
    @PostMapping("/payroll-periods/{periodId}/recalculate-all")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<BulkCalculationResultDTO> recalculateAll(@PathVariable Long periodId) {
        BulkCalculationResultDTO result = service.forceRecalculateAll(periodId);
        return ResponseEntity.ok(result);
    }

    // ── Recalcul global : TOUTES les périodes, TOUS les bulletins ─
    @PostMapping("/payroll/recalculate-all-periods")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    public ResponseEntity<List<BulkCalculationResultDTO>> recalculateAllPeriods() {
        List<BulkCalculationResultDTO> results = service.forceRecalculateAllPeriods();
        return ResponseEntity.ok(results);
    }

    // ── Fix paramètres LF 2026 + recalcul total ───────────────────
    // Corrige CAVIS=0, CSS=0, plafond CNSS sans limite, puis recalcule
    @PostMapping("/payroll/fix-and-recalculate")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN','ROLE_SUPER_ADMIN')")
    @Transactional
    public ResponseEntity<List<BulkCalculationResultDTO>> fixAndRecalculate() {
        log.info("▶ Correction paramètres LF 2026 + recalcul global");

        regulatoryParamRepository.updateValueByKey("CAVIS_TAUX_SALARIE", BigDecimal.ZERO);
        regulatoryParamRepository.updateValueByKey("CSS_TAUX", BigDecimal.ZERO);
        regulatoryParamRepository.updateValueByKey("CNSS_PLAFOND_MENSUEL", new BigDecimal("999999"));
        regulatoryParamRepository.flush();

        log.info("✅ Paramètres corrigés — lancement recalcul toutes périodes");
        List<BulkCalculationResultDTO> results = service.forceRecalculateAllPeriods();
        return ResponseEntity.ok(results);
    }
}
