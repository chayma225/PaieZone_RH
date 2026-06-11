package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.service.PayrollPeriodService;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/payroll-periods")
@RequiredArgsConstructor
@Slf4j
public class PayrollPeriodResource {

    private static final String ENTITY_NAME = "payrollPeriod";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PayrollPeriodService periodService;

    // ── CRUD ──────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "CREATE", entityType = "PayrollPeriod")
    public ResponseEntity<PayrollPeriodDTO> createPeriod(
        @Valid @RequestBody PayrollPeriodDTO dto) {
        log.debug("REST POST /payroll-periods");

        if (dto.getId() != null) {
            return ResponseEntity.badRequest()
                .headers(HeaderUtil.createFailureAlert(
                    applicationName, true, ENTITY_NAME,
                    "idexists", "Un nouvel objet ne peut avoir d'ID"))
                .build();
        }

        PayrollPeriodDTO result = periodService.save(dto);
        return ResponseEntity
            .created(URI.create("/api/payroll-periods/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(
                applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "UPDATE", entityType = "PayrollPeriod")
    public ResponseEntity<PayrollPeriodDTO> updatePeriod(
        @PathVariable Long id,
        @Valid @RequestBody PayrollPeriodDTO dto) {
        log.debug("REST PUT /payroll-periods/{}", id);
        dto.setId(id);
        PayrollPeriodDTO result = periodService.update(dto);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(
                applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "PATCH", entityType = "PayrollPeriod")
    public ResponseEntity<PayrollPeriodDTO> partialUpdatePeriod(
        @PathVariable Long id,
        @RequestBody PayrollPeriodDTO dto) {
        dto.setId(id);
        return ResponseUtil.wrapOrNotFound(
            periodService.partialUpdate(dto),
            HeaderUtil.createEntityUpdateAlert(
                applicationName, true, ENTITY_NAME, id.toString())
        );
    }

    @GetMapping
    public ResponseEntity<List<PayrollPeriodDTO>> getAllPeriods(Pageable pageable) {
        log.debug("REST GET /payroll-periods");
        Page<PayrollPeriodDTO> page = periodService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PayrollPeriodDTO> getPeriod(@PathVariable Long id) {
        log.debug("REST GET /payroll-periods/{}", id);
        return ResponseUtil.wrapOrNotFound(periodService.findOne(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "DELETE", entityType = "PayrollPeriod")
    public ResponseEntity<Void> deletePeriod(@PathVariable Long id) {
        log.debug("REST DELETE /payroll-periods/{}", id);
        periodService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(
                applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    // ── ACTIONS MÉTIER ────────────────────────────────────────────

    @PostMapping("/{id}/calculate-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "CALCULATE_PAYROLL", entityType = "PayrollPeriod")
    public ResponseEntity<BulkCalculationResultDTO> calculateAll(@PathVariable Long id) {
        log.debug("REST POST /payroll-periods/{}/calculate-all", id);
        BulkCalculationResultDTO result = periodService.triggerCalculation(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "VALIDATE", entityType = "PayrollPeriod")
    public ResponseEntity<Void> validatePeriod(@PathVariable Long id) {
        log.debug("REST POST /payroll-periods/{}/validate", id);
        periodService.validatePeriod(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN', 'RH_MANAGER', 'USER')")
    @Auditable(action = "LOCK", entityType = "PayrollPeriod")
    public ResponseEntity<Void> lockPeriod(@PathVariable Long id) {
        log.debug("REST POST /payroll-periods/{}/lock", id);
        periodService.lockPeriod(id);
        return ResponseEntity.ok().build();
    }
}
