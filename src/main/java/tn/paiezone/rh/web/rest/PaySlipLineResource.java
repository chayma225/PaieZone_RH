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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.PaySlipLineRepository;
import tn.paiezone.rh.service.PaySlipLineService;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.PaySlipLine}.
 */
@RestController
@RequestMapping("/api/pay-slip-lines")
public class PaySlipLineResource {

    private static final Logger LOG = LoggerFactory.getLogger(PaySlipLineResource.class);

    private static final String ENTITY_NAME = "paySlipLine";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final PaySlipLineService paySlipLineService;

    private final PaySlipLineRepository paySlipLineRepository;

    public PaySlipLineResource(PaySlipLineService paySlipLineService, PaySlipLineRepository paySlipLineRepository) {
        this.paySlipLineService = paySlipLineService;
        this.paySlipLineRepository = paySlipLineRepository;
    }

    /**
     * {@code POST  /pay-slip-lines} : Create a new paySlipLine.
     *
     * @param paySlipLineDTO the paySlipLineDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new paySlipLineDTO, or with status {@code 400 (Bad Request)} if the paySlipLine has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PaySlipLineDTO> createPaySlipLine(@Valid @RequestBody PaySlipLineDTO paySlipLineDTO) throws URISyntaxException {
        LOG.debug("REST request to save PaySlipLine : {}", paySlipLineDTO);
        if (paySlipLineDTO.getId() != null) {
            throw new BadRequestAlertException("A new paySlipLine cannot already have an ID", ENTITY_NAME, "idexists");
        }
        paySlipLineDTO = paySlipLineService.save(paySlipLineDTO);
        return ResponseEntity.created(new URI("/api/pay-slip-lines/" + paySlipLineDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, paySlipLineDTO.getId().toString()))
            .body(paySlipLineDTO);
    }

    /**
     * {@code PUT  /pay-slip-lines/:id} : Updates an existing paySlipLine.
     *
     * @param id the id of the paySlipLineDTO to save.
     * @param paySlipLineDTO the paySlipLineDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated paySlipLineDTO,
     * or with status {@code 400 (Bad Request)} if the paySlipLineDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the paySlipLineDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PaySlipLineDTO> updatePaySlipLine(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PaySlipLineDTO paySlipLineDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update PaySlipLine : {}, {}", id, paySlipLineDTO);
        if (paySlipLineDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, paySlipLineDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!paySlipLineRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        paySlipLineDTO = paySlipLineService.update(paySlipLineDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, paySlipLineDTO.getId().toString()))
            .body(paySlipLineDTO);
    }

    /**
     * {@code PATCH  /pay-slip-lines/:id} : Partial updates given fields of an existing paySlipLine, field will ignore if it is null
     *
     * @param id the id of the paySlipLineDTO to save.
     * @param paySlipLineDTO the paySlipLineDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated paySlipLineDTO,
     * or with status {@code 400 (Bad Request)} if the paySlipLineDTO is not valid,
     * or with status {@code 404 (Not Found)} if the paySlipLineDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the paySlipLineDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PaySlipLineDTO> partialUpdatePaySlipLine(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PaySlipLineDTO paySlipLineDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PaySlipLine partially : {}, {}", id, paySlipLineDTO);
        if (paySlipLineDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, paySlipLineDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!paySlipLineRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PaySlipLineDTO> result = paySlipLineService.partialUpdate(paySlipLineDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, paySlipLineDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /pay-slip-lines} : get all the Pay Slip Lines.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Pay Slip Lines in body.
     */
    @GetMapping("")
    public List<PaySlipLineDTO> getAllPaySlipLines() {
        LOG.debug("REST request to get all PaySlipLines");
        return paySlipLineService.findAll();
    }

    /**
     * {@code GET  /pay-slip-lines/:id} : get the "id" paySlipLine.
     *
     * @param id the id of the paySlipLineDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the paySlipLineDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PaySlipLineDTO> getPaySlipLine(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PaySlipLine : {}", id);
        Optional<PaySlipLineDTO> paySlipLineDTO = paySlipLineService.findOne(id);
        return ResponseUtil.wrapOrNotFound(paySlipLineDTO);
    }

    /**
     * {@code DELETE  /pay-slip-lines/:id} : delete the "id" paySlipLine.
     *
     * @param id the id of the paySlipLineDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaySlipLine(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PaySlipLine : {}", id);
        paySlipLineService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
