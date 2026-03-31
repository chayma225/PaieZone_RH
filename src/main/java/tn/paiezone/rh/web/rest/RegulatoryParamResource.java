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
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.RegulatoryParamService;
import tn.paiezone.rh.service.dto.RegulatoryParamDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.RegulatoryParam}.
 */
@RestController
@RequestMapping("/api/regulatory-params")
public class RegulatoryParamResource {

    private static final Logger LOG = LoggerFactory.getLogger(RegulatoryParamResource.class);

    private static final String ENTITY_NAME = "regulatoryParam";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RegulatoryParamService regulatoryParamService;

    private final RegulatoryParamRepository regulatoryParamRepository;

    public RegulatoryParamResource(RegulatoryParamService regulatoryParamService, RegulatoryParamRepository regulatoryParamRepository) {
        this.regulatoryParamService = regulatoryParamService;
        this.regulatoryParamRepository = regulatoryParamRepository;
    }

    /**
     * {@code POST  /regulatory-params} : Create a new regulatoryParam.
     *
     * @param regulatoryParamDTO the regulatoryParamDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new regulatoryParamDTO, or with status {@code 400 (Bad Request)} if the regulatoryParam has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<RegulatoryParamDTO> createRegulatoryParam(@Valid @RequestBody RegulatoryParamDTO regulatoryParamDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save RegulatoryParam : {}", regulatoryParamDTO);
        if (regulatoryParamDTO.getId() != null) {
            throw new BadRequestAlertException("A new regulatoryParam cannot already have an ID", ENTITY_NAME, "idexists");
        }
        regulatoryParamDTO = regulatoryParamService.save(regulatoryParamDTO);
        return ResponseEntity.created(new URI("/api/regulatory-params/" + regulatoryParamDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, regulatoryParamDTO.getId().toString()))
            .body(regulatoryParamDTO);
    }

    /**
     * {@code PUT  /regulatory-params/:id} : Updates an existing regulatoryParam.
     *
     * @param id the id of the regulatoryParamDTO to save.
     * @param regulatoryParamDTO the regulatoryParamDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated regulatoryParamDTO,
     * or with status {@code 400 (Bad Request)} if the regulatoryParamDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the regulatoryParamDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RegulatoryParamDTO> updateRegulatoryParam(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RegulatoryParamDTO regulatoryParamDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update RegulatoryParam : {}, {}", id, regulatoryParamDTO);
        if (regulatoryParamDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, regulatoryParamDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!regulatoryParamRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        regulatoryParamDTO = regulatoryParamService.update(regulatoryParamDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, regulatoryParamDTO.getId().toString()))
            .body(regulatoryParamDTO);
    }

    /**
     * {@code PATCH  /regulatory-params/:id} : Partial updates given fields of an existing regulatoryParam, field will ignore if it is null
     *
     * @param id the id of the regulatoryParamDTO to save.
     * @param regulatoryParamDTO the regulatoryParamDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated regulatoryParamDTO,
     * or with status {@code 400 (Bad Request)} if the regulatoryParamDTO is not valid,
     * or with status {@code 404 (Not Found)} if the regulatoryParamDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the regulatoryParamDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<RegulatoryParamDTO> partialUpdateRegulatoryParam(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody RegulatoryParamDTO regulatoryParamDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update RegulatoryParam partially : {}, {}", id, regulatoryParamDTO);
        if (regulatoryParamDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, regulatoryParamDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!regulatoryParamRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RegulatoryParamDTO> result = regulatoryParamService.partialUpdate(regulatoryParamDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, regulatoryParamDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /regulatory-params} : get all the regulatoryParams.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of regulatoryParams in body.
     */
    @GetMapping("")
    public List<RegulatoryParamDTO> getAllRegulatoryParams() {
        LOG.debug("REST request to get all RegulatoryParams");
        return regulatoryParamService.findAll();
    }

    /**
     * {@code GET  /regulatory-params/:id} : get the "id" regulatoryParam.
     *
     * @param id the id of the regulatoryParamDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the regulatoryParamDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RegulatoryParamDTO> getRegulatoryParam(@PathVariable("id") Long id) {
        LOG.debug("REST request to get RegulatoryParam : {}", id);
        Optional<RegulatoryParamDTO> regulatoryParamDTO = regulatoryParamService.findOne(id);
        return ResponseUtil.wrapOrNotFound(regulatoryParamDTO);
    }

    /**
     * {@code DELETE  /regulatory-params/:id} : delete the "id" regulatoryParam.
     *
     * @param id the id of the regulatoryParamDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegulatoryParam(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete RegulatoryParam : {}", id);
        regulatoryParamService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
