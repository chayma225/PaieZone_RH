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
import tn.paiezone.rh.repository.KnowledgeDocumentRepository;
import tn.paiezone.rh.service.KnowledgeDocumentService;
import tn.paiezone.rh.service.dto.KnowledgeDocumentDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.KnowledgeDocument}.
 */
@RestController
@RequestMapping("/api/knowledge-documents")
public class KnowledgeDocumentResource {

    private static final Logger LOG = LoggerFactory.getLogger(KnowledgeDocumentResource.class);

    private static final String ENTITY_NAME = "knowledgeDocument";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final KnowledgeDocumentService knowledgeDocumentService;

    private final KnowledgeDocumentRepository knowledgeDocumentRepository;

    public KnowledgeDocumentResource(
        KnowledgeDocumentService knowledgeDocumentService,
        KnowledgeDocumentRepository knowledgeDocumentRepository
    ) {
        this.knowledgeDocumentService = knowledgeDocumentService;
        this.knowledgeDocumentRepository = knowledgeDocumentRepository;
    }

    /**
     * {@code POST  /knowledge-documents} : Create a new knowledgeDocument.
     *
     * @param knowledgeDocumentDTO the knowledgeDocumentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new knowledgeDocumentDTO, or with status {@code 400 (Bad Request)} if the knowledgeDocument has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<KnowledgeDocumentDTO> createKnowledgeDocument(@Valid @RequestBody KnowledgeDocumentDTO knowledgeDocumentDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save KnowledgeDocument : {}", knowledgeDocumentDTO);
        if (knowledgeDocumentDTO.getId() != null) {
            throw new BadRequestAlertException("A new knowledgeDocument cannot already have an ID", ENTITY_NAME, "idexists");
        }
        knowledgeDocumentDTO = knowledgeDocumentService.save(knowledgeDocumentDTO);
        return ResponseEntity.created(new URI("/api/knowledge-documents/" + knowledgeDocumentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, knowledgeDocumentDTO.getId().toString()))
            .body(knowledgeDocumentDTO);
    }

    /**
     * {@code PUT  /knowledge-documents/:id} : Updates an existing knowledgeDocument.
     *
     * @param id the id of the knowledgeDocumentDTO to save.
     * @param knowledgeDocumentDTO the knowledgeDocumentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated knowledgeDocumentDTO,
     * or with status {@code 400 (Bad Request)} if the knowledgeDocumentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the knowledgeDocumentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeDocumentDTO> updateKnowledgeDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody KnowledgeDocumentDTO knowledgeDocumentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update KnowledgeDocument : {}, {}", id, knowledgeDocumentDTO);
        if (knowledgeDocumentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, knowledgeDocumentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!knowledgeDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        knowledgeDocumentDTO = knowledgeDocumentService.update(knowledgeDocumentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, knowledgeDocumentDTO.getId().toString()))
            .body(knowledgeDocumentDTO);
    }

    /**
     * {@code PATCH  /knowledge-documents/:id} : Partial updates given fields of an existing knowledgeDocument, field will ignore if it is null
     *
     * @param id the id of the knowledgeDocumentDTO to save.
     * @param knowledgeDocumentDTO the knowledgeDocumentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated knowledgeDocumentDTO,
     * or with status {@code 400 (Bad Request)} if the knowledgeDocumentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the knowledgeDocumentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the knowledgeDocumentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<KnowledgeDocumentDTO> partialUpdateKnowledgeDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody KnowledgeDocumentDTO knowledgeDocumentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update KnowledgeDocument partially : {}, {}", id, knowledgeDocumentDTO);
        if (knowledgeDocumentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, knowledgeDocumentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!knowledgeDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<KnowledgeDocumentDTO> result = knowledgeDocumentService.partialUpdate(knowledgeDocumentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, knowledgeDocumentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /knowledge-documents} : get all the knowledgeDocuments.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of knowledgeDocuments in body.
     */
    @GetMapping("")
    public List<KnowledgeDocumentDTO> getAllKnowledgeDocuments() {
        LOG.debug("REST request to get all KnowledgeDocuments");
        return knowledgeDocumentService.findAll();
    }

    /**
     * {@code GET  /knowledge-documents/:id} : get the "id" knowledgeDocument.
     *
     * @param id the id of the knowledgeDocumentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the knowledgeDocumentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeDocumentDTO> getKnowledgeDocument(@PathVariable("id") Long id) {
        LOG.debug("REST request to get KnowledgeDocument : {}", id);
        Optional<KnowledgeDocumentDTO> knowledgeDocumentDTO = knowledgeDocumentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(knowledgeDocumentDTO);
    }

    /**
     * {@code DELETE  /knowledge-documents/:id} : delete the "id" knowledgeDocument.
     *
     * @param id the id of the knowledgeDocumentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKnowledgeDocument(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete KnowledgeDocument : {}", id);
        knowledgeDocumentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
