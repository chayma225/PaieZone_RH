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
import tn.paiezone.rh.repository.AdvanceRepository;
import tn.paiezone.rh.service.AdvanceQueryService;
import tn.paiezone.rh.service.AdvanceService;
import tn.paiezone.rh.service.criteria.AdvanceCriteria;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.Advance}.
 */
@RestController
@RequestMapping("/api/advances")
public class AdvanceResource {

    private static final Logger LOG = LoggerFactory.getLogger(AdvanceResource.class);

    private static final String ENTITY_NAME = "advance";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AdvanceService advanceService;

    private final AdvanceRepository advanceRepository;

    private final AdvanceQueryService advanceQueryService;

    public AdvanceResource(AdvanceService advanceService, AdvanceRepository advanceRepository, AdvanceQueryService advanceQueryService) {
        this.advanceService = advanceService;
        this.advanceRepository = advanceRepository;
        this.advanceQueryService = advanceQueryService;
    }

    /**
     * {@code POST  /advances} : Create a new advance.
     *
     * @param advanceDTO the advanceDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new advanceDTO, or with status {@code 400 (Bad Request)} if the advance has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<AdvanceDTO> createAdvance(@Valid @RequestBody AdvanceDTO advanceDTO) throws URISyntaxException {
        LOG.debug("REST request to save Advance : {}", advanceDTO);
        if (advanceDTO.getId() != null) {
            throw new BadRequestAlertException("A new advance cannot already have an ID", ENTITY_NAME, "idexists");
        }
        advanceDTO = advanceService.save(advanceDTO);
        return ResponseEntity.created(new URI("/api/advances/" + advanceDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, advanceDTO.getId().toString()))
            .body(advanceDTO);
    }

    /**
     * {@code PUT  /advances/:id} : Updates an existing advance.
     *
     * @param id the id of the advanceDTO to save.
     * @param advanceDTO the advanceDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated advanceDTO,
     * or with status {@code 400 (Bad Request)} if the advanceDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the advanceDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AdvanceDTO> updateAdvance(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AdvanceDTO advanceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Advance : {}, {}", id, advanceDTO);
        if (advanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, advanceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!advanceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        advanceDTO = advanceService.update(advanceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, advanceDTO.getId().toString()))
            .body(advanceDTO);
    }

    /**
     * {@code PATCH  /advances/:id} : Partial updates given fields of an existing advance, field will ignore if it is null
     *
     * @param id the id of the advanceDTO to save.
     * @param advanceDTO the advanceDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated advanceDTO,
     * or with status {@code 400 (Bad Request)} if the advanceDTO is not valid,
     * or with status {@code 404 (Not Found)} if the advanceDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the advanceDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AdvanceDTO> partialUpdateAdvance(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AdvanceDTO advanceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Advance partially : {}, {}", id, advanceDTO);
        if (advanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, advanceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!advanceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AdvanceDTO> result = advanceService.partialUpdate(advanceDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, advanceDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /advances} : get all the advances.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of advances in body.
     */
    @GetMapping("")
    public ResponseEntity<List<AdvanceDTO>> getAllAdvances(
        AdvanceCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Advances by criteria: {}", criteria);

        Page<AdvanceDTO> page = advanceQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /advances/count} : count all the advances.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countAdvances(AdvanceCriteria criteria) {
        LOG.debug("REST request to count Advances by criteria: {}", criteria);
        return ResponseEntity.ok().body(advanceQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /advances/:id} : get the "id" advance.
     *
     * @param id the id of the advanceDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the advanceDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AdvanceDTO> getAdvance(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Advance : {}", id);
        Optional<AdvanceDTO> advanceDTO = advanceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(advanceDTO);
    }

    /**
     * {@code DELETE  /advances/:id} : delete the "id" advance.
     *
     * @param id the id of the advanceDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdvance(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Advance : {}", id);
        advanceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
