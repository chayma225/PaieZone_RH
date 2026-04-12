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
import tn.paiezone.rh.repository.JobPositionRepository;
import tn.paiezone.rh.service.JobPositionService;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.JobPosition}.
 */
@RestController
@RequestMapping("/api/job-positions")
public class JobPositionResource {

    private static final Logger LOG = LoggerFactory.getLogger(JobPositionResource.class);

    private static final String ENTITY_NAME = "jobPosition";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final JobPositionService jobPositionService;

    private final JobPositionRepository jobPositionRepository;

    public JobPositionResource(JobPositionService jobPositionService, JobPositionRepository jobPositionRepository) {
        this.jobPositionService = jobPositionService;
        this.jobPositionRepository = jobPositionRepository;
    }

    /**
     * {@code POST  /job-positions} : Create a new jobPosition.
     *
     * @param jobPositionDTO the jobPositionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new jobPositionDTO, or with status {@code 400 (Bad Request)} if the jobPosition has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<JobPositionDTO> createJobPosition(@Valid @RequestBody JobPositionDTO jobPositionDTO) throws URISyntaxException {
        LOG.debug("REST request to save JobPosition : {}", jobPositionDTO);
        if (jobPositionDTO.getId() != null) {
            throw new BadRequestAlertException("A new jobPosition cannot already have an ID", ENTITY_NAME, "idexists");
        }
        jobPositionDTO = jobPositionService.save(jobPositionDTO);
        return ResponseEntity.created(new URI("/api/job-positions/" + jobPositionDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, jobPositionDTO.getId().toString()))
            .body(jobPositionDTO);
    }

    /**
     * {@code PUT  /job-positions/:id} : Updates an existing jobPosition.
     *
     * @param id the id of the jobPositionDTO to save.
     * @param jobPositionDTO the jobPositionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated jobPositionDTO,
     * or with status {@code 400 (Bad Request)} if the jobPositionDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the jobPositionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobPositionDTO> updateJobPosition(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody JobPositionDTO jobPositionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update JobPosition : {}, {}", id, jobPositionDTO);
        if (jobPositionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, jobPositionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!jobPositionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        jobPositionDTO = jobPositionService.update(jobPositionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, jobPositionDTO.getId().toString()))
            .body(jobPositionDTO);
    }

    /**
     * {@code PATCH  /job-positions/:id} : Partial updates given fields of an existing jobPosition, field will ignore if it is null
     *
     * @param id the id of the jobPositionDTO to save.
     * @param jobPositionDTO the jobPositionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated jobPositionDTO,
     * or with status {@code 400 (Bad Request)} if the jobPositionDTO is not valid,
     * or with status {@code 404 (Not Found)} if the jobPositionDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the jobPositionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<JobPositionDTO> partialUpdateJobPosition(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody JobPositionDTO jobPositionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update JobPosition partially : {}, {}", id, jobPositionDTO);
        if (jobPositionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, jobPositionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!jobPositionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<JobPositionDTO> result = jobPositionService.partialUpdate(jobPositionDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, jobPositionDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /job-positions} : get all the Job Positions.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Job Positions in body.
     */
    @GetMapping("")
    public List<JobPositionDTO> getAllJobPositions() {
        LOG.debug("REST request to get all JobPositions");
        return jobPositionService.findAll();
    }

    /**
     * {@code GET  /job-positions/:id} : get the "id" jobPosition.
     *
     * @param id the id of the jobPositionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the jobPositionDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobPositionDTO> getJobPosition(@PathVariable("id") Long id) {
        LOG.debug("REST request to get JobPosition : {}", id);
        Optional<JobPositionDTO> jobPositionDTO = jobPositionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(jobPositionDTO);
    }

    /**
     * {@code DELETE  /job-positions/:id} : delete the "id" jobPosition.
     *
     * @param id the id of the jobPositionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPosition(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete JobPosition : {}", id);
        jobPositionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
