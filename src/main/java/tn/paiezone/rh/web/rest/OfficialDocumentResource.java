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
import tn.paiezone.rh.repository.OfficialDocumentRepository;
import tn.paiezone.rh.service.OfficialDocumentQueryService;
import tn.paiezone.rh.service.OfficialDocumentService;
import tn.paiezone.rh.service.criteria.OfficialDocumentCriteria;
import tn.paiezone.rh.service.dto.OfficialDocumentDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.OfficialDocument}.
 */
@RestController
@RequestMapping("/api/official-documents")
public class OfficialDocumentResource {

    private static final Logger LOG = LoggerFactory.getLogger(OfficialDocumentResource.class);

    private static final String ENTITY_NAME = "officialDocument";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final OfficialDocumentService officialDocumentService;

    private final OfficialDocumentRepository officialDocumentRepository;

    private final OfficialDocumentQueryService officialDocumentQueryService;

    public OfficialDocumentResource(
        OfficialDocumentService officialDocumentService,
        OfficialDocumentRepository officialDocumentRepository,
        OfficialDocumentQueryService officialDocumentQueryService
    ) {
        this.officialDocumentService = officialDocumentService;
        this.officialDocumentRepository = officialDocumentRepository;
        this.officialDocumentQueryService = officialDocumentQueryService;
    }

    /**
     * {@code POST  /official-documents} : Create a new officialDocument.
     *
     * @param officialDocumentDTO the officialDocumentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new officialDocumentDTO, or with status {@code 400 (Bad Request)} if the officialDocument has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<OfficialDocumentDTO> createOfficialDocument(@Valid @RequestBody OfficialDocumentDTO officialDocumentDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save OfficialDocument : {}", officialDocumentDTO);
        if (officialDocumentDTO.getId() != null) {
            throw new BadRequestAlertException("A new officialDocument cannot already have an ID", ENTITY_NAME, "idexists");
        }
        officialDocumentDTO = officialDocumentService.save(officialDocumentDTO);
        return ResponseEntity.created(new URI("/api/official-documents/" + officialDocumentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, officialDocumentDTO.getId().toString()))
            .body(officialDocumentDTO);
    }

    /**
     * {@code PUT  /official-documents/:id} : Updates an existing officialDocument.
     *
     * @param id the id of the officialDocumentDTO to save.
     * @param officialDocumentDTO the officialDocumentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated officialDocumentDTO,
     * or with status {@code 400 (Bad Request)} if the officialDocumentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the officialDocumentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<OfficialDocumentDTO> updateOfficialDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody OfficialDocumentDTO officialDocumentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update OfficialDocument : {}, {}", id, officialDocumentDTO);
        if (officialDocumentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, officialDocumentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!officialDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        officialDocumentDTO = officialDocumentService.update(officialDocumentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, officialDocumentDTO.getId().toString()))
            .body(officialDocumentDTO);
    }

    /**
     * {@code PATCH  /official-documents/:id} : Partial updates given fields of an existing officialDocument, field will ignore if it is null
     *
     * @param id the id of the officialDocumentDTO to save.
     * @param officialDocumentDTO the officialDocumentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated officialDocumentDTO,
     * or with status {@code 400 (Bad Request)} if the officialDocumentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the officialDocumentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the officialDocumentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<OfficialDocumentDTO> partialUpdateOfficialDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody OfficialDocumentDTO officialDocumentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update OfficialDocument partially : {}, {}", id, officialDocumentDTO);
        if (officialDocumentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, officialDocumentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!officialDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<OfficialDocumentDTO> result = officialDocumentService.partialUpdate(officialDocumentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, officialDocumentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /official-documents} : get all the Official Documents.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Official Documents in body.
     */
    @GetMapping("")
    public ResponseEntity<List<OfficialDocumentDTO>> getAllOfficialDocuments(
        OfficialDocumentCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get OfficialDocuments by criteria: {}", criteria);

        Page<OfficialDocumentDTO> page = officialDocumentQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /official-documents/count} : count all the officialDocuments.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countOfficialDocuments(OfficialDocumentCriteria criteria) {
        LOG.debug("REST request to count OfficialDocuments by criteria: {}", criteria);
        return ResponseEntity.ok().body(officialDocumentQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET  /official-documents/:id} : get the "id" officialDocument.
     *
     * @param id the id of the officialDocumentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the officialDocumentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OfficialDocumentDTO> getOfficialDocument(@PathVariable("id") Long id) {
        LOG.debug("REST request to get OfficialDocument : {}", id);
        Optional<OfficialDocumentDTO> officialDocumentDTO = officialDocumentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(officialDocumentDTO);
    }

    /**
     * {@code DELETE  /official-documents/:id} : delete the "id" officialDocument.
     *
     * @param id the id of the officialDocumentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOfficialDocument(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete OfficialDocument : {}", id);
        officialDocumentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
