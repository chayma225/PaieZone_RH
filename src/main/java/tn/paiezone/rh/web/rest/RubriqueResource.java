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
import tn.paiezone.rh.repository.RubriqueRepository;
import tn.paiezone.rh.service.RubriqueService;
import tn.paiezone.rh.service.dto.RubriqueDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.Rubrique}.
 */
@RestController
@RequestMapping("/api/rubriques")
public class RubriqueResource {

    private static final Logger LOG = LoggerFactory.getLogger(RubriqueResource.class);

    private static final String ENTITY_NAME = "rubrique";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final RubriqueService rubriqueService;

    private final RubriqueRepository rubriqueRepository;

    public RubriqueResource(RubriqueService rubriqueService, RubriqueRepository rubriqueRepository) {
        this.rubriqueService = rubriqueService;
        this.rubriqueRepository = rubriqueRepository;
    }

    /**
     * {@code POST  /rubriques} : Create a new rubrique.
     *
     * @param rubriqueDTO the rubriqueDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new rubriqueDTO, or with status {@code 400 (Bad Request)} if the rubrique has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<RubriqueDTO> createRubrique(@Valid @RequestBody RubriqueDTO rubriqueDTO) throws URISyntaxException {
        LOG.debug("REST request to save Rubrique : {}", rubriqueDTO);
        if (rubriqueDTO.getId() != null) {
            throw new BadRequestAlertException("A new rubrique cannot already have an ID", ENTITY_NAME, "idexists");
        }
        rubriqueDTO = rubriqueService.save(rubriqueDTO);
        return ResponseEntity.created(new URI("/api/rubriques/" + rubriqueDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, rubriqueDTO.getId().toString()))
            .body(rubriqueDTO);
    }

    /**
     * {@code PUT  /rubriques/:id} : Updates an existing rubrique.
     *
     * @param id the id of the rubriqueDTO to save.
     * @param rubriqueDTO the rubriqueDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated rubriqueDTO,
     * or with status {@code 400 (Bad Request)} if the rubriqueDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the rubriqueDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RubriqueDTO> updateRubrique(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RubriqueDTO rubriqueDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Rubrique : {}, {}", id, rubriqueDTO);
        if (rubriqueDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, rubriqueDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!rubriqueRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        rubriqueDTO = rubriqueService.update(rubriqueDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, rubriqueDTO.getId().toString()))
            .body(rubriqueDTO);
    }

    /**
     * {@code PATCH  /rubriques/:id} : Partial updates given fields of an existing rubrique, field will ignore if it is null
     *
     * @param id the id of the rubriqueDTO to save.
     * @param rubriqueDTO the rubriqueDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated rubriqueDTO,
     * or with status {@code 400 (Bad Request)} if the rubriqueDTO is not valid,
     * or with status {@code 404 (Not Found)} if the rubriqueDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the rubriqueDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<RubriqueDTO> partialUpdateRubrique(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody RubriqueDTO rubriqueDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Rubrique partially : {}, {}", id, rubriqueDTO);
        if (rubriqueDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, rubriqueDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!rubriqueRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<RubriqueDTO> result = rubriqueService.partialUpdate(rubriqueDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, rubriqueDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /rubriques} : get all the Rubriques.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Rubriques in body.
     */
    @GetMapping("")
    public List<RubriqueDTO> getAllRubriques() {
        LOG.debug("REST request to get all Rubriques");
        return rubriqueService.findAll();
    }

    /**
     * {@code GET  /rubriques/:id} : get the "id" rubrique.
     *
     * @param id the id of the rubriqueDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the rubriqueDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RubriqueDTO> getRubrique(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Rubrique : {}", id);
        Optional<RubriqueDTO> rubriqueDTO = rubriqueService.findOne(id);
        return ResponseUtil.wrapOrNotFound(rubriqueDTO);
    }

    /**
     * {@code DELETE  /rubriques/:id} : delete the "id" rubrique.
     *
     * @param id the id of the rubriqueDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRubrique(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Rubrique : {}", id);
        rubriqueService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
