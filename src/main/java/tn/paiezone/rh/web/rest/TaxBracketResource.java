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
import tn.paiezone.rh.repository.TaxBracketRepository;
import tn.paiezone.rh.service.TaxBracketService;
import tn.paiezone.rh.service.dto.TaxBracketDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.TaxBracket}.
 */
@RestController
@RequestMapping("/api/tax-brackets")
public class TaxBracketResource {

    private static final Logger LOG = LoggerFactory.getLogger(TaxBracketResource.class);

    private static final String ENTITY_NAME = "taxBracket";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final TaxBracketService taxBracketService;

    private final TaxBracketRepository taxBracketRepository;

    public TaxBracketResource(TaxBracketService taxBracketService, TaxBracketRepository taxBracketRepository) {
        this.taxBracketService = taxBracketService;
        this.taxBracketRepository = taxBracketRepository;
    }

    /**
     * {@code POST  /tax-brackets} : Create a new taxBracket.
     *
     * @param taxBracketDTO the taxBracketDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new taxBracketDTO, or with status {@code 400 (Bad Request)} if the taxBracket has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<TaxBracketDTO> createTaxBracket(@Valid @RequestBody TaxBracketDTO taxBracketDTO) throws URISyntaxException {
        LOG.debug("REST request to save TaxBracket : {}", taxBracketDTO);
        if (taxBracketDTO.getId() != null) {
            throw new BadRequestAlertException("A new taxBracket cannot already have an ID", ENTITY_NAME, "idexists");
        }
        taxBracketDTO = taxBracketService.save(taxBracketDTO);
        return ResponseEntity.created(new URI("/api/tax-brackets/" + taxBracketDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, taxBracketDTO.getId().toString()))
            .body(taxBracketDTO);
    }

    /**
     * {@code PUT  /tax-brackets/:id} : Updates an existing taxBracket.
     *
     * @param id the id of the taxBracketDTO to save.
     * @param taxBracketDTO the taxBracketDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated taxBracketDTO,
     * or with status {@code 400 (Bad Request)} if the taxBracketDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the taxBracketDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TaxBracketDTO> updateTaxBracket(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody TaxBracketDTO taxBracketDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update TaxBracket : {}, {}", id, taxBracketDTO);
        if (taxBracketDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, taxBracketDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!taxBracketRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        taxBracketDTO = taxBracketService.update(taxBracketDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, taxBracketDTO.getId().toString()))
            .body(taxBracketDTO);
    }

    /**
     * {@code PATCH  /tax-brackets/:id} : Partial updates given fields of an existing taxBracket, field will ignore if it is null
     *
     * @param id the id of the taxBracketDTO to save.
     * @param taxBracketDTO the taxBracketDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated taxBracketDTO,
     * or with status {@code 400 (Bad Request)} if the taxBracketDTO is not valid,
     * or with status {@code 404 (Not Found)} if the taxBracketDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the taxBracketDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<TaxBracketDTO> partialUpdateTaxBracket(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody TaxBracketDTO taxBracketDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update TaxBracket partially : {}, {}", id, taxBracketDTO);
        if (taxBracketDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, taxBracketDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!taxBracketRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<TaxBracketDTO> result = taxBracketService.partialUpdate(taxBracketDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, taxBracketDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /tax-brackets} : get all the taxBrackets.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of taxBrackets in body.
     */
    @GetMapping("")
    public List<TaxBracketDTO> getAllTaxBrackets() {
        LOG.debug("REST request to get all TaxBrackets");
        return taxBracketService.findAll();
    }

    /**
     * {@code GET  /tax-brackets/:id} : get the "id" taxBracket.
     *
     * @param id the id of the taxBracketDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the taxBracketDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaxBracketDTO> getTaxBracket(@PathVariable("id") Long id) {
        LOG.debug("REST request to get TaxBracket : {}", id);
        Optional<TaxBracketDTO> taxBracketDTO = taxBracketService.findOne(id);
        return ResponseUtil.wrapOrNotFound(taxBracketDTO);
    }

    /**
     * {@code DELETE  /tax-brackets/:id} : delete the "id" taxBracket.
     *
     * @param id the id of the taxBracketDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaxBracket(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete TaxBracket : {}", id);
        taxBracketService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
