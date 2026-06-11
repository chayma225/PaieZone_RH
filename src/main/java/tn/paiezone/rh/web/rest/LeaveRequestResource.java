package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.LeaveRequestRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.LeaveRequestQueryService;
import tn.paiezone.rh.service.LeaveRequestService;
import tn.paiezone.rh.service.criteria.LeaveRequestCriteria;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.LeaveRequestDTO;
import tn.paiezone.rh.service.dto.LeaveTypeDTO;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.LeaveRequest}.
 */
@RestController
@RequestMapping("/api/leave-requests")
public class LeaveRequestResource {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveRequestResource.class);

    private static final String ENTITY_NAME = "leaveRequest";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final LeaveRequestService leaveRequestService;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveRequestQueryService leaveRequestQueryService;
    private final EmployeeRepository employeeRepository;

    public LeaveRequestResource(
        LeaveRequestService leaveRequestService,
        LeaveRequestRepository leaveRequestRepository,
        LeaveRequestQueryService leaveRequestQueryService,
        EmployeeRepository employeeRepository
    ) {
        this.leaveRequestService = leaveRequestService;
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveRequestQueryService = leaveRequestQueryService;
        this.employeeRepository = employeeRepository;
    }

    /**
     * {@code POST /leave-requests/submit} : Simplified endpoint — no @Valid, sets required fields server-side.
     * employeeId optional: omit to use current user's employee profile (self-service).
     */
    @PostMapping("/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestDTO> submitLeaveRequest(@RequestBody Map<String, Object> body) throws URISyntaxException {
        Long empId = body.get("employeeId") != null ? Long.valueOf(body.get("employeeId").toString()) : null;
        if (empId == null) {
            String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
                new BadRequestAlertException("Utilisateur non authentifié", ENTITY_NAME, "notauthenticated")
            );
            empId = employeeRepository
                .findByUserProfile_JhiUserId(login)
                .map(e -> e.getId())
                .orElseThrow(() -> new BadRequestAlertException("Aucun profil employé trouvé", ENTITY_NAME, "noemployee"));
        }

        EmployeeDTO empDto = new EmployeeDTO();
        empDto.setId(empId);

        Object ltIdObj = body.get("leaveTypeId");
        Long ltId = (ltIdObj != null) ? Long.valueOf(ltIdObj.toString()) : 0L;

        // Absence non justifiée : pas de type de congé à sélectionner
        if (ltId == null || ltId == 0L) {
            LocalDate startDate = LocalDate.parse(body.get("startDate").toString());
            LocalDate endDate = body.get("endDate") != null ? LocalDate.parse(body.get("endDate").toString()) : startDate;
            int days = body.get("numberOfDays") != null ? Integer.parseInt(body.get("numberOfDays").toString()) : 1;
            String comment = body.get("comment") != null ? body.get("comment").toString() : null;
            LeaveRequestDTO result = leaveRequestService.submitUnjustified(empId, startDate, endDate, days, comment);
            return ResponseEntity.created(new URI("/api/leave-requests/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                .body(result);
        }

        LeaveTypeDTO ltDto = new LeaveTypeDTO();
        ltDto.setId(ltId);

        LeaveRequestDTO dto = new LeaveRequestDTO();
        dto.setEmployee(empDto);
        dto.setLeaveType(ltDto);
        dto.setStartDate(LocalDate.parse(body.get("startDate").toString()));
        dto.setEndDate(LocalDate.parse(body.get("endDate").toString()));
        dto.setNumberOfDays(body.get("numberOfDays") != null ? Integer.valueOf(body.get("numberOfDays").toString()) : 1);
        dto.setEmployeeComment(body.get("comment") != null ? body.get("comment").toString() : null);
        // RH peut enregistrer directement en APPROVED
        String statusStr = body.get("status") != null ? body.get("status").toString() : null;
        boolean isRhOrAdmin = SecurityUtils.hasCurrentUserAnyOfAuthorities(
            AuthoritiesConstants.ADMIN,
            AuthoritiesConstants.RH_COMPTABLE,
            AuthoritiesConstants.SUPER_ADMIN
        );
        dto.setStatus(isRhOrAdmin && "APPROVED".equals(statusStr) ? LeaveStatus.APPROVED : LeaveStatus.PENDING);
        dto.setRequestedAt(Instant.now());

        LeaveRequestDTO result = leaveRequestService.submit(dto);
        return ResponseEntity.created(new URI("/api/leave-requests/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code POST  /leave-requests} : Create a new leaveRequest.
     *
     * @param leaveRequestDTO the leaveRequestDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new leaveRequestDTO, or with status {@code 400 (Bad Request)} if the leaveRequest has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @Auditable(action = "CREATE", entityType = "LeaveRequest")
    public ResponseEntity<LeaveRequestDTO> createLeaveRequest(@Valid @RequestBody LeaveRequestDTO leaveRequestDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save LeaveRequest : {}", leaveRequestDTO);
        if (leaveRequestDTO.getId() != null) {
            throw new BadRequestAlertException("A new leaveRequest cannot already have an ID", ENTITY_NAME, "idexists");
        }
        leaveRequestDTO = leaveRequestService.save(leaveRequestDTO);
        return ResponseEntity.created(new URI("/api/leave-requests/" + leaveRequestDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, leaveRequestDTO.getId().toString()))
            .body(leaveRequestDTO);
    }

    /**
     * {@code PUT  /leave-requests/:id} : Updates an existing leaveRequest.
     *
     * @param id the id of the leaveRequestDTO to save.
     * @param leaveRequestDTO the leaveRequestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaveRequestDTO,
     * or with status {@code 400 (Bad Request)} if the leaveRequestDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the leaveRequestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @Auditable(action = "UPDATE", entityType = "LeaveRequest")
    public ResponseEntity<LeaveRequestDTO> updateLeaveRequest(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody LeaveRequestDTO leaveRequestDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update LeaveRequest : {}, {}", id, leaveRequestDTO);
        if (leaveRequestDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaveRequestDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaveRequestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        leaveRequestDTO = leaveRequestService.update(leaveRequestDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, leaveRequestDTO.getId().toString()))
            .body(leaveRequestDTO);
    }

    /**
     * {@code PATCH  /leave-requests/:id} : Partial updates given fields of an existing leaveRequest, field will ignore if it is null
     *
     * @param id the id of the leaveRequestDTO to save.
     * @param leaveRequestDTO the leaveRequestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated leaveRequestDTO,
     * or with status {@code 400 (Bad Request)} if the leaveRequestDTO is not valid,
     * or with status {@code 404 (Not Found)} if the leaveRequestDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the leaveRequestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @Auditable(action = "PATCH", entityType = "LeaveRequest")
    public ResponseEntity<LeaveRequestDTO> partialUpdateLeaveRequest(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody LeaveRequestDTO leaveRequestDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update LeaveRequest partially : {}, {}", id, leaveRequestDTO);
        if (leaveRequestDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, leaveRequestDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!leaveRequestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<LeaveRequestDTO> result = leaveRequestService.partialUpdate(leaveRequestDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, leaveRequestDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /leave-requests} : get all the Leave Requests.
     *
     * @param pageable the pagination information.
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Leave Requests in body.
     */
    @GetMapping("")
    public ResponseEntity<List<LeaveRequestDTO>> getAllLeaveRequests(
        LeaveRequestCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get LeaveRequests by criteria: {}", criteria);

        Page<LeaveRequestDTO> page = leaveRequestQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /leave-requests/count} : count all the leaveRequests.
     *
     * @param criteria the criteria which the requested entities should match.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the count in body.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countLeaveRequests(LeaveRequestCriteria criteria) {
        LOG.debug("REST request to count LeaveRequests by criteria: {}", criteria);
        return ResponseEntity.ok().body(leaveRequestQueryService.countByCriteria(criteria));
    }

    /**
     * {@code GET /leave-requests/my} : demandes de congé de l'employé connecté.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveRequestDTO>> getMyLeaveRequests() {
        return tn.paiezone.rh.security.SecurityUtils.getCurrentUserLogin()
            .flatMap(login -> employeeRepository.findByUserProfile_JhiUserId(login))
            .map(emp -> {
                List<LeaveRequestDTO> list = leaveRequestRepository
                    .findByEmployeeIdOrderByRequestedAtDesc(emp.getId())
                    .stream()
                    .map(lr -> leaveRequestService.findOne(lr.getId()).orElseThrow())
                    .collect(java.util.stream.Collectors.toList());
                return ResponseEntity.ok(list);
            })
            .orElseGet(() -> ResponseEntity.ok(List.of()));
    }

    /**
     * {@code GET  /leave-requests/:id} : get the "id" leaveRequest.
     *
     * @param id the id of the leaveRequestDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the leaveRequestDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequestDTO> getLeaveRequest(@PathVariable("id") Long id) {
        LOG.debug("REST request to get LeaveRequest : {}", id);
        Optional<LeaveRequestDTO> leaveRequestDTO = leaveRequestService.findOne(id);
        return ResponseUtil.wrapOrNotFound(leaveRequestDTO);
    }

    /**
     * {@code PUT  /leave-requests/:id/approve} : Approve a leave request.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    @Auditable(action = "APPROVE", entityType = "LeaveRequest")
    public ResponseEntity<LeaveRequestDTO> approveLeaveRequest(@PathVariable("id") Long id) {
        LOG.debug("REST request to approve LeaveRequest : {}", id);
        String login = SecurityUtils.getCurrentUserLogin().orElse("system");
        LeaveRequestDTO result = leaveRequestService.approve(id, null);
        return ResponseEntity.ok(result);
    }

    /**
     * {@code PUT  /leave-requests/:id/reject} : Reject a leave request.
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN')")
    @Auditable(action = "REJECT", entityType = "LeaveRequest")
    public ResponseEntity<LeaveRequestDTO> rejectLeaveRequest(
        @PathVariable("id") Long id,
        @RequestParam(required = false, defaultValue = "") String comment
    ) {
        LOG.debug("REST request to reject LeaveRequest : {}", id);
        LeaveRequestDTO result = leaveRequestService.reject(id, comment);
        return ResponseEntity.ok(result);
    }

    /**
     * {@code DELETE  /leave-requests/:id} : delete the "id" leaveRequest.
     *
     * @param id the id of the leaveRequestDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @Auditable(action = "DELETE", entityType = "LeaveRequest")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete LeaveRequest : {}", id);
        leaveRequestService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
