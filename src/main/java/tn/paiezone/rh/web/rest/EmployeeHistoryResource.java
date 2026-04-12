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
import tn.paiezone.rh.repository.EmployeeHistoryRepository;
import tn.paiezone.rh.service.EmployeeHistoryService;
import tn.paiezone.rh.service.dto.EmployeeHistoryDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.EmployeeHistory}.
 */
@RestController
@RequestMapping("/api/employee-histories")
public class EmployeeHistoryResource {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeHistoryResource.class);

    private static final String ENTITY_NAME = "employeeHistory";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final EmployeeHistoryService employeeHistoryService;

    private final EmployeeHistoryRepository employeeHistoryRepository;

    public EmployeeHistoryResource(EmployeeHistoryService employeeHistoryService, EmployeeHistoryRepository employeeHistoryRepository) {
        this.employeeHistoryService = employeeHistoryService;
        this.employeeHistoryRepository = employeeHistoryRepository;
    }

    /**
     * {@code POST  /employee-histories} : Create a new employeeHistory.
     *
     * @param employeeHistoryDTO the employeeHistoryDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new employeeHistoryDTO, or with status {@code 400 (Bad Request)} if the employeeHistory has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<EmployeeHistoryDTO> createEmployeeHistory(@Valid @RequestBody EmployeeHistoryDTO employeeHistoryDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save EmployeeHistory : {}", employeeHistoryDTO);
        if (employeeHistoryDTO.getId() != null) {
            throw new BadRequestAlertException("A new employeeHistory cannot already have an ID", ENTITY_NAME, "idexists");
        }
        employeeHistoryDTO = employeeHistoryService.save(employeeHistoryDTO);
        return ResponseEntity.created(new URI("/api/employee-histories/" + employeeHistoryDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, employeeHistoryDTO.getId().toString()))
            .body(employeeHistoryDTO);
    }

    /**
     * {@code PUT  /employee-histories/:id} : Updates an existing employeeHistory.
     *
     * @param id the id of the employeeHistoryDTO to save.
     * @param employeeHistoryDTO the employeeHistoryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated employeeHistoryDTO,
     * or with status {@code 400 (Bad Request)} if the employeeHistoryDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the employeeHistoryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeHistoryDTO> updateEmployeeHistory(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EmployeeHistoryDTO employeeHistoryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update EmployeeHistory : {}, {}", id, employeeHistoryDTO);
        if (employeeHistoryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, employeeHistoryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!employeeHistoryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        employeeHistoryDTO = employeeHistoryService.update(employeeHistoryDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, employeeHistoryDTO.getId().toString()))
            .body(employeeHistoryDTO);
    }

    /**
     * {@code PATCH  /employee-histories/:id} : Partial updates given fields of an existing employeeHistory, field will ignore if it is null
     *
     * @param id the id of the employeeHistoryDTO to save.
     * @param employeeHistoryDTO the employeeHistoryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated employeeHistoryDTO,
     * or with status {@code 400 (Bad Request)} if the employeeHistoryDTO is not valid,
     * or with status {@code 404 (Not Found)} if the employeeHistoryDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the employeeHistoryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<EmployeeHistoryDTO> partialUpdateEmployeeHistory(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EmployeeHistoryDTO employeeHistoryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update EmployeeHistory partially : {}, {}", id, employeeHistoryDTO);
        if (employeeHistoryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, employeeHistoryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!employeeHistoryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EmployeeHistoryDTO> result = employeeHistoryService.partialUpdate(employeeHistoryDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, employeeHistoryDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /employee-histories} : get all the Employee Histories.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Employee Histories in body.
     */
    @GetMapping("")
    public List<EmployeeHistoryDTO> getAllEmployeeHistories() {
        LOG.debug("REST request to get all EmployeeHistories");
        return employeeHistoryService.findAll();
    }

    /**
     * {@code GET  /employee-histories/:id} : get the "id" employeeHistory.
     *
     * @param id the id of the employeeHistoryDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the employeeHistoryDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeHistoryDTO> getEmployeeHistory(@PathVariable("id") Long id) {
        LOG.debug("REST request to get EmployeeHistory : {}", id);
        Optional<EmployeeHistoryDTO> employeeHistoryDTO = employeeHistoryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(employeeHistoryDTO);
    }

    /**
     * {@code DELETE  /employee-histories/:id} : delete the "id" employeeHistory.
     *
     * @param id the id of the employeeHistoryDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployeeHistory(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete EmployeeHistory : {}", id);
        employeeHistoryService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
