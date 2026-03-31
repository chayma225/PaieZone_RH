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
import tn.paiezone.rh.repository.PublicHolidayRepository;
import tn.paiezone.rh.service.PublicHolidayService;
import tn.paiezone.rh.service.dto.PublicHolidayDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.PublicHoliday}.
 */
@RestController
@RequestMapping("/api/public-holidays")
public class PublicHolidayResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicHolidayResource.class);

    private static final String ENTITY_NAME = "publicHoliday";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final PublicHolidayService publicHolidayService;

    private final PublicHolidayRepository publicHolidayRepository;

    public PublicHolidayResource(PublicHolidayService publicHolidayService, PublicHolidayRepository publicHolidayRepository) {
        this.publicHolidayService = publicHolidayService;
        this.publicHolidayRepository = publicHolidayRepository;
    }

    /**
     * {@code POST  /public-holidays} : Create a new publicHoliday.
     *
     * @param publicHolidayDTO the publicHolidayDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new publicHolidayDTO, or with status {@code 400 (Bad Request)} if the publicHoliday has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<PublicHolidayDTO> createPublicHoliday(@Valid @RequestBody PublicHolidayDTO publicHolidayDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save PublicHoliday : {}", publicHolidayDTO);
        if (publicHolidayDTO.getId() != null) {
            throw new BadRequestAlertException("A new publicHoliday cannot already have an ID", ENTITY_NAME, "idexists");
        }
        publicHolidayDTO = publicHolidayService.save(publicHolidayDTO);
        return ResponseEntity.created(new URI("/api/public-holidays/" + publicHolidayDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, publicHolidayDTO.getId().toString()))
            .body(publicHolidayDTO);
    }

    /**
     * {@code PUT  /public-holidays/:id} : Updates an existing publicHoliday.
     *
     * @param id the id of the publicHolidayDTO to save.
     * @param publicHolidayDTO the publicHolidayDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated publicHolidayDTO,
     * or with status {@code 400 (Bad Request)} if the publicHolidayDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the publicHolidayDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<PublicHolidayDTO> updatePublicHoliday(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PublicHolidayDTO publicHolidayDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update PublicHoliday : {}, {}", id, publicHolidayDTO);
        if (publicHolidayDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, publicHolidayDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!publicHolidayRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        publicHolidayDTO = publicHolidayService.update(publicHolidayDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, publicHolidayDTO.getId().toString()))
            .body(publicHolidayDTO);
    }

    /**
     * {@code PATCH  /public-holidays/:id} : Partial updates given fields of an existing publicHoliday, field will ignore if it is null
     *
     * @param id the id of the publicHolidayDTO to save.
     * @param publicHolidayDTO the publicHolidayDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated publicHolidayDTO,
     * or with status {@code 400 (Bad Request)} if the publicHolidayDTO is not valid,
     * or with status {@code 404 (Not Found)} if the publicHolidayDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the publicHolidayDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<PublicHolidayDTO> partialUpdatePublicHoliday(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PublicHolidayDTO publicHolidayDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update PublicHoliday partially : {}, {}", id, publicHolidayDTO);
        if (publicHolidayDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, publicHolidayDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!publicHolidayRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PublicHolidayDTO> result = publicHolidayService.partialUpdate(publicHolidayDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, publicHolidayDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /public-holidays} : get all the publicHolidays.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of publicHolidays in body.
     */
    @GetMapping("")
    public List<PublicHolidayDTO> getAllPublicHolidays() {
        LOG.debug("REST request to get all PublicHolidays");
        return publicHolidayService.findAll();
    }

    /**
     * {@code GET  /public-holidays/:id} : get the "id" publicHoliday.
     *
     * @param id the id of the publicHolidayDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the publicHolidayDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PublicHolidayDTO> getPublicHoliday(@PathVariable("id") Long id) {
        LOG.debug("REST request to get PublicHoliday : {}", id);
        Optional<PublicHolidayDTO> publicHolidayDTO = publicHolidayService.findOne(id);
        return ResponseUtil.wrapOrNotFound(publicHolidayDTO);
    }

    /**
     * {@code DELETE  /public-holidays/:id} : delete the "id" publicHoliday.
     *
     * @param id the id of the publicHolidayDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublicHoliday(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete PublicHoliday : {}", id);
        publicHolidayService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
