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
import tn.paiezone.rh.repository.LeaveTypeRepository;
import tn.paiezone.rh.service.LeaveTypeService;
import tn.paiezone.rh.service.dto.LeaveTypeDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.LeaveType}.
 */
@RestController
@RequestMapping("/api/leave-types")
public class LeaveTypeResource {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveTypeResource.class);

    private static final String ENTITY_NAME = "leaveType";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final LeaveTypeService leaveTypeService;

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeResource(LeaveTypeService leaveTypeService, LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeService = leaveTypeService;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    /**
     * {@code POST  /leave-types} : Create a new leaveType.
     *
     * @param leaveTypeDTO the leaveTypeDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new leaveTypeDTO, or with status {@code 400 (Bad Request)} if the leaveType has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<LeaveTypeDTO> createLeaveType(@Valid @RequestBody LeaveTypeDTO leaveTypeDTO) throws URISyntaxException {
        LOG.debug("REST request to save LeaveType : {}", leaveTypeDTO);
        if (leaveTypeDTO.getId() != null) {
            throw new BadRequestAlertException("A new leaveType cannot already have an ID", ENTITY_NAME, "idexists");
        }
        leaveTypeDTO = leaveTypeService.save(leaveTypeDTO);
        return ResponseEntity.created(new URI("/api/leave-types/" + leaveTypeDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, leaveTypeDTO.getId().toString()))
            .body(leaveTypeDTO);
    }

    /**
     * {@code PUT  /leave-types/:id} : Updates an existing leaveType.
     *
     * @param id the id of the leaveTypeDTO to save.
     * @param leaveTypeDTO the leaveTypeDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaveTypeDTO,
     * or with status {@code 400 (Bad Request)} if the leaveTypeDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the leaveTypeDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LeaveTypeDTO> updateLeaveType(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LeaveTypeDTO leaveTypeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update LeaveType : {}, {}", id, leaveTypeDTO);
        if (leaveTypeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaveTypeDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaveTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        leaveTypeDTO = leaveTypeService.update(leaveTypeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, leaveTypeDTO.getId().toString()))
            .body(leaveTypeDTO);
    }

    /**
     * {@code PATCH  /leave-types/:id} : Partial updates given fields of an existing leaveType, field will ignore if it is null
     *
     * @param id the id of the leaveTypeDTO to save.
     * @param leaveTypeDTO the leaveTypeDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaveTypeDTO,
     * or with status {@code 400 (Bad Request)} if the leaveTypeDTO is not valid,
     * or with status {@code 404 (Not Found)} if the leaveTypeDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the leaveTypeDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LeaveTypeDTO> partialUpdateLeaveType(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LeaveTypeDTO leaveTypeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update LeaveType partially : {}, {}", id, leaveTypeDTO);
        if (leaveTypeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaveTypeDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaveTypeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LeaveTypeDTO> result = leaveTypeService.partialUpdate(leaveTypeDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, leaveTypeDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /leave-types} : get all the Leave Types.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Leave Types in body.
     */
    @GetMapping("")
    public List<LeaveTypeDTO> getAllLeaveTypes() {
        LOG.debug("REST request to get all LeaveTypes");
        return leaveTypeService.findAll();
    }

    /**
     * {@code GET  /leave-types/:id} : get the "id" leaveType.
     *
     * @param id the id of the leaveTypeDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the leaveTypeDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LeaveTypeDTO> getLeaveType(@PathVariable("id") Long id) {
        LOG.debug("REST request to get LeaveType : {}", id);
        Optional<LeaveTypeDTO> leaveTypeDTO = leaveTypeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(leaveTypeDTO);
    }

    /**
     * {@code DELETE  /leave-types/:id} : delete the "id" leaveType.
     *
     * @param id the id of the leaveTypeDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveType(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LeaveType : {}", id);
        leaveTypeService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
