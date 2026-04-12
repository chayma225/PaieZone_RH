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
import tn.paiezone.rh.repository.CnssRateRepository;
import tn.paiezone.rh.service.CnssRateService;
import tn.paiezone.rh.service.dto.CnssRateDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.CnssRate}.
 */
@RestController
@RequestMapping("/api/cnss-rates")
public class CnssRateResource {

    private static final Logger LOG = LoggerFactory.getLogger(CnssRateResource.class);

    private static final String ENTITY_NAME = "cnssRate";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final CnssRateService cnssRateService;

    private final CnssRateRepository cnssRateRepository;

    public CnssRateResource(CnssRateService cnssRateService, CnssRateRepository cnssRateRepository) {
        this.cnssRateService = cnssRateService;
        this.cnssRateRepository = cnssRateRepository;
    }

    /**
     * {@code POST  /cnss-rates} : Create a new cnssRate.
     *
     * @param cnssRateDTO the cnssRateDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new cnssRateDTO, or with status {@code 400 (Bad Request)} if the cnssRate has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CnssRateDTO> createCnssRate(@Valid @RequestBody CnssRateDTO cnssRateDTO) throws URISyntaxException {
        LOG.debug("REST request to save CnssRate : {}", cnssRateDTO);
        if (cnssRateDTO.getId() != null) {
            throw new BadRequestAlertException("A new cnssRate cannot already have an ID", ENTITY_NAME, "idexists");
        }
        cnssRateDTO = cnssRateService.save(cnssRateDTO);
        return ResponseEntity.created(new URI("/api/cnss-rates/" + cnssRateDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, cnssRateDTO.getId().toString()))
            .body(cnssRateDTO);
    }

    /**
     * {@code PUT  /cnss-rates/:id} : Updates an existing cnssRate.
     *
     * @param id the id of the cnssRateDTO to save.
     * @param cnssRateDTO the cnssRateDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cnssRateDTO,
     * or with status {@code 400 (Bad Request)} if the cnssRateDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the cnssRateDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CnssRateDTO> updateCnssRate(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CnssRateDTO cnssRateDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CnssRate : {}, {}", id, cnssRateDTO);
        if (cnssRateDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cnssRateDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cnssRateRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        cnssRateDTO = cnssRateService.update(cnssRateDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, cnssRateDTO.getId().toString()))
            .body(cnssRateDTO);
    }

    /**
     * {@code PATCH  /cnss-rates/:id} : Partial updates given fields of an existing cnssRate, field will ignore if it is null
     *
     * @param id the id of the cnssRateDTO to save.
     * @param cnssRateDTO the cnssRateDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cnssRateDTO,
     * or with status {@code 400 (Bad Request)} if the cnssRateDTO is not valid,
     * or with status {@code 404 (Not Found)} if the cnssRateDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the cnssRateDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CnssRateDTO> partialUpdateCnssRate(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CnssRateDTO cnssRateDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CnssRate partially : {}, {}", id, cnssRateDTO);
        if (cnssRateDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cnssRateDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cnssRateRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CnssRateDTO> result = cnssRateService.partialUpdate(cnssRateDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, cnssRateDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /cnss-rates} : get all the Cnss Rates.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Cnss Rates in body.
     */
    @GetMapping("")
    public List<CnssRateDTO> getAllCnssRates() {
        LOG.debug("REST request to get all CnssRates");
        return cnssRateService.findAll();
    }

    /**
     * {@code GET  /cnss-rates/:id} : get the "id" cnssRate.
     *
     * @param id the id of the cnssRateDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the cnssRateDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CnssRateDTO> getCnssRate(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CnssRate : {}", id);
        Optional<CnssRateDTO> cnssRateDTO = cnssRateService.findOne(id);
        return ResponseUtil.wrapOrNotFound(cnssRateDTO);
    }

    /**
     * {@code DELETE  /cnss-rates/:id} : delete the "id" cnssRate.
     *
     * @param id the id of the cnssRateDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCnssRate(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CnssRate : {}", id);
        cnssRateService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
