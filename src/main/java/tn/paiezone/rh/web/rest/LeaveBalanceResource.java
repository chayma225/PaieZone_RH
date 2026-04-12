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
import tn.paiezone.rh.repository.LeaveBalanceRepository;
import tn.paiezone.rh.service.LeaveBalanceService;
import tn.paiezone.rh.service.dto.LeaveBalanceDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.LeaveBalance}.
 */
@RestController
@RequestMapping("/api/leave-balances")
public class LeaveBalanceResource {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveBalanceResource.class);

    private static final String ENTITY_NAME = "leaveBalance";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final LeaveBalanceService leaveBalanceService;

    private final LeaveBalanceRepository leaveBalanceRepository;

    public LeaveBalanceResource(LeaveBalanceService leaveBalanceService, LeaveBalanceRepository leaveBalanceRepository) {
        this.leaveBalanceService = leaveBalanceService;
        this.leaveBalanceRepository = leaveBalanceRepository;
    }

    /**
     * {@code POST  /leave-balances} : Create a new leaveBalance.
     *
     * @param leaveBalanceDTO the leaveBalanceDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new leaveBalanceDTO, or with status {@code 400 (Bad Request)} if the leaveBalance has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<LeaveBalanceDTO> createLeaveBalance(@Valid @RequestBody LeaveBalanceDTO leaveBalanceDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save LeaveBalance : {}", leaveBalanceDTO);
        if (leaveBalanceDTO.getId() != null) {
            throw new BadRequestAlertException("A new leaveBalance cannot already have an ID", ENTITY_NAME, "idexists");
        }
        leaveBalanceDTO = leaveBalanceService.save(leaveBalanceDTO);
        return ResponseEntity.created(new URI("/api/leave-balances/" + leaveBalanceDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, leaveBalanceDTO.getId().toString()))
            .body(leaveBalanceDTO);
    }

    /**
     * {@code PUT  /leave-balances/:id} : Updates an existing leaveBalance.
     *
     * @param id the id of the leaveBalanceDTO to save.
     * @param leaveBalanceDTO the leaveBalanceDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaveBalanceDTO,
     * or with status {@code 400 (Bad Request)} if the leaveBalanceDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the leaveBalanceDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<LeaveBalanceDTO> updateLeaveBalance(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LeaveBalanceDTO leaveBalanceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update LeaveBalance : {}, {}", id, leaveBalanceDTO);
        if (leaveBalanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaveBalanceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaveBalanceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        leaveBalanceDTO = leaveBalanceService.update(leaveBalanceDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, leaveBalanceDTO.getId().toString()))
            .body(leaveBalanceDTO);
    }

    /**
     * {@code PATCH  /leave-balances/:id} : Partial updates given fields of an existing leaveBalance, field will ignore if it is null
     *
     * @param id the id of the leaveBalanceDTO to save.
     * @param leaveBalanceDTO the leaveBalanceDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaveBalanceDTO,
     * or with status {@code 400 (Bad Request)} if the leaveBalanceDTO is not valid,
     * or with status {@code 404 (Not Found)} if the leaveBalanceDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the leaveBalanceDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<LeaveBalanceDTO> partialUpdateLeaveBalance(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LeaveBalanceDTO leaveBalanceDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update LeaveBalance partially : {}, {}", id, leaveBalanceDTO);
        if (leaveBalanceDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaveBalanceDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaveBalanceRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LeaveBalanceDTO> result = leaveBalanceService.partialUpdate(leaveBalanceDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, leaveBalanceDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /leave-balances} : get all the Leave Balances.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Leave Balances in body.
     */
    @GetMapping("")
    public List<LeaveBalanceDTO> getAllLeaveBalances() {
        LOG.debug("REST request to get all LeaveBalances");
        return leaveBalanceService.findAll();
    }

    /**
     * {@code GET  /leave-balances/:id} : get the "id" leaveBalance.
     *
     * @param id the id of the leaveBalanceDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the leaveBalanceDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LeaveBalanceDTO> getLeaveBalance(@PathVariable("id") Long id) {
        LOG.debug("REST request to get LeaveBalance : {}", id);
        Optional<LeaveBalanceDTO> leaveBalanceDTO = leaveBalanceService.findOne(id);
        return ResponseUtil.wrapOrNotFound(leaveBalanceDTO);
    }

    /**
     * {@code DELETE  /leave-balances/:id} : delete the "id" leaveBalance.
     *
     * @param id the id of the leaveBalanceDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveBalance(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LeaveBalance : {}", id);
        leaveBalanceService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
