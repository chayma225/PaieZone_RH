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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.service.PayrollPeriodService;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.PayrollPeriod}.
 */
@RestController
@RequestMapping("/api/payroll-periods")
public class PayrollPeriodResource {

    private static final Logger LOG = LoggerFactory.getLogger(PayrollPeriodResource.class);

    private static final String ENTITY_NAME = "payrollPeriod";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final PayrollPeriodService payrollPeriodService;

    private final PayrollPeriodRepository payrollPeriodRepository;

    public PayrollPeriodResource(PayrollPeriodService payrollPeriodService, PayrollPeriodRepository payrollPeriodRepository) {
        this.payrollPeriodService = payrollPeriodService;
        this.payrollPeriodRepository = payrollPeriodRepository;
    }

    /**
     * {@code POST  /payroll-periods} : Create a new payrollPeriod.
     *
     * @param payrollPeriodDTO the payrollPeriodDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new payrollPeriodDTO, or with status {@code 400 (Bad Request)} if the payrollPeriod has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PayrollPeriodDTO> createPayrollPeriod(@Valid @RequestBody PayrollPeriodDTO payrollPeriodDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save PayrollPeriod : {}", payrollPeriodDTO);
        if (payrollPeriodDTO.getId() != null) {
            throw new BadRequestAlertException("A new payrollPeriod cannot already have an ID", ENTITY_NAME, "idexists");
        }
        payrollPeriodDTO = payrollPeriodService.save(payrollPeriodDTO);
        return ResponseEntity.created(new URI("/api/payroll-periods/" + payrollPeriodDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, payrollPeriodDTO.getId().toString()))
            .body(payrollPeriodDTO);
    }

    /**
     * {@code PUT  /payroll-periods/:id} : Updates an existing payrollPeriod.
     *
     * @param id the id of the payrollPeriodDTO to save.
     * @param payrollPeriodDTO the payrollPeriodDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated payrollPeriodDTO,
     * or with status {@code 400 (Bad Request)} if the payrollPeriodDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the payrollPeriodDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PayrollPeriodDTO> updatePayrollPeriod(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PayrollPeriodDTO payrollPeriodDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update PayrollPeriod : {}, {}", id, payrollPeriodDTO);
        if (payrollPeriodDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, payrollPeriodDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!payrollPeriodRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        payrollPeriodDTO = payrollPeriodService.update(payrollPeriodDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, payrollPeriodDTO.getId().toString()))
            .body(payrollPeriodDTO);
    }

    /**
     * {@code PATCH  /payroll-periods/:id} : Partial updates given fields of an existing payrollPeriod, field will ignore if it is null
     *
     * @param id the id of the payrollPeriodDTO to save.
     * @param payrollPeriodDTO the payrollPeriodDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated payrollPeriodDTO,
     * or with status {@code 400 (Bad Request)} if the payrollPeriodDTO is not valid,
     * or with status {@code 404 (Not Found)} if the payrollPeriodDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the payrollPeriodDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PayrollPeriodDTO> partialUpdatePayrollPeriod(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PayrollPeriodDTO payrollPeriodDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PayrollPeriod partially : {}, {}", id, payrollPeriodDTO);
        if (payrollPeriodDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, payrollPeriodDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!payrollPeriodRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PayrollPeriodDTO> result = payrollPeriodService.partialUpdate(payrollPeriodDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, payrollPeriodDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /payroll-periods} : get all the Payroll Periods.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Payroll Periods in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PayrollPeriodDTO>> getAllPayrollPeriods(@org.springdoc.core.annotations.ParameterObject Pageable pageable) {
        LOG.debug("REST request to get a page of PayrollPeriods");
        Page<PayrollPeriodDTO> page = payrollPeriodService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /payroll-periods/:id} : get the "id" payrollPeriod.
     *
     * @param id the id of the payrollPeriodDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the payrollPeriodDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PayrollPeriodDTO> getPayrollPeriod(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PayrollPeriod : {}", id);
        Optional<PayrollPeriodDTO> payrollPeriodDTO = payrollPeriodService.findOne(id);
        return ResponseUtil.wrapOrNotFound(payrollPeriodDTO);
    }

    /**
     * {@code DELETE  /payroll-periods/:id} : delete the "id" payrollPeriod.
     *
     * @param id the id of the payrollPeriodDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayrollPeriod(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PayrollPeriod : {}", id);
        payrollPeriodService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
