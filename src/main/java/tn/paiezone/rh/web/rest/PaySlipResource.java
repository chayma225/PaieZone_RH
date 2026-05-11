package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.service.PaySlipQueryService;
import tn.paiezone.rh.service.PaySlipService;
import tn.paiezone.rh.service.PaySlipPdfService;
import tn.paiezone.rh.service.criteria.PaySlipCriteria;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.PaySlip}.
 */
@RestController
@RequestMapping("/api/pay-slips")
public class PaySlipResource {

    private static final Logger LOG = LoggerFactory.getLogger(PaySlipResource.class);

    private static final String ENTITY_NAME = "paySlip";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final PaySlipService paySlipService;
    private final PaySlipRepository paySlipRepository;
    private final PaySlipQueryService paySlipQueryService;
    private final PaySlipPdfService paySlipPdfService;
    private final PayrollPeriodRepository payrollPeriodRepository;

    public PaySlipResource(
        PaySlipService paySlipService,
        PaySlipRepository paySlipRepository,
        PaySlipQueryService paySlipQueryService,
        PaySlipPdfService paySlipPdfService,
        PayrollPeriodRepository payrollPeriodRepository
    ) {
        this.paySlipService = paySlipService;
        this.paySlipRepository = paySlipRepository;
        this.paySlipQueryService = paySlipQueryService;
        this.paySlipPdfService = paySlipPdfService;
        this.payrollPeriodRepository = payrollPeriodRepository;
    }

    /**
     * {@code POST  /pay-slips} : Create a new paySlip.
     */
    @PostMapping("")
    public ResponseEntity<PaySlipDTO> createPaySlip(@Valid @RequestBody PaySlipDTO paySlipDTO) throws URISyntaxException {
        LOG.debug("REST request to save PaySlip : {}", paySlipDTO);
        if (paySlipDTO.getId() != null) {
            throw new BadRequestAlertException("A new paySlip cannot already have an ID", ENTITY_NAME, "idexists");
        }
        paySlipDTO = paySlipService.save(paySlipDTO);
        return ResponseEntity.created(new URI("/api/pay-slips/" + paySlipDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, paySlipDTO.getId().toString()))
            .body(paySlipDTO);
    }

    /**
     * {@code PUT  /pay-slips/:id} : Updates an existing paySlip.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaySlipDTO> updatePaySlip(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PaySlipDTO paySlipDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update PaySlip : {}, {}", id, paySlipDTO);
        if (paySlipDTO.getId() == null || !Objects.equals(id, paySlipDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!paySlipRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        paySlipDTO = paySlipService.update(paySlipDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, paySlipDTO.getId().toString()))
            .body(paySlipDTO);
    }

    /**
     * {@code GET  /pay-slips} : get all the Pay Slips.
     */
    @GetMapping("")
    public ResponseEntity<List<PaySlipDTO>> getAllPaySlips(
        PaySlipCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get PaySlips by criteria: {}", criteria);
        Page<PaySlipDTO> page = paySlipQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /pay-slips/:id} : get the "id" paySlip.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaySlipDTO> getPaySlip(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PaySlip : {}", id);
        Optional<PaySlipDTO> paySlipDTO = paySlipService.findOne(id);
        return ResponseUtil.wrapOrNotFound(paySlipDTO);
    }

    /**
     * {@code DELETE  /pay-slips/:id} : delete the "id" paySlip.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaySlip(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PaySlip : {}", id);
        paySlipService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    /** * GET /api/pay-slips/{id}/pdf : Télécharger un bulletin individuel
     */
    @GetMapping(value = "/{id}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN') or @paySlipSecurity.isOwner(#id, authentication)")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        LOG.debug("REST request to download PDF for PaySlip : {}", id);

        byte[] pdf = paySlipPdfService.generatePdf(id);

        return paySlipRepository.findById(id)
            .map(ps -> {
                String filename = String.format("bulletin_%s_%02d_%d.pdf",
                    ps.getEmployee().getMatricule(), ps.getMonth(), ps.getYear());

                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentLength(pdf.length)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
            })
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
    }

    /** * GET /api/pay-slips/bulk-pdf/{periodId} : Téléchargement groupé par période
     */
    @GetMapping(value = "/bulk-pdf/{periodId}", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN')")
    public ResponseEntity<byte[]> downloadBulkPdf(@PathVariable Long periodId) {
        LOG.debug("REST request to download bulk PDF for Period : {}", periodId);

        byte[] pdf = paySlipPdfService.generateBulkPdf(periodId);

        return payrollPeriodRepository.findById(periodId)
            .map(period -> {
                String filename = String.format("bulletins_%02d_%d.pdf",
                    period.getMonth(), period.getYear());

                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentLength(pdf.length)
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
            })
            .orElseThrow(() -> new BadRequestAlertException("Period not found", "payrollPeriod", "idnotfound"));
    }
}
