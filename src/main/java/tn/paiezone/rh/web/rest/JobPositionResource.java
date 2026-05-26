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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.repository.JobPositionRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.JobPositionService;
import tn.paiezone.rh.service.TenantContextService;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/job-positions")
public class JobPositionResource {

    private static final Logger LOG = LoggerFactory.getLogger(JobPositionResource.class);
    private static final String ENTITY_NAME = "jobPosition";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final JobPositionService jobPositionService;
    private final JobPositionRepository jobPositionRepository;
    private final TenantContextService tenantContextService;

    public JobPositionResource(
        JobPositionService jobPositionService,
        JobPositionRepository jobPositionRepository,
        TenantContextService tenantContextService
    ) {
        this.jobPositionService = jobPositionService;
        this.jobPositionRepository = jobPositionRepository;
        this.tenantContextService = tenantContextService;
    }

    @PostMapping("")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "CREATE", entityType = "JobPosition")
    public ResponseEntity<JobPositionDTO> createJobPosition(@Valid @RequestBody JobPositionDTO jobPositionDTO) throws URISyntaxException {
        LOG.debug("REST request to save JobPosition : {}", jobPositionDTO);
        if (jobPositionDTO.getId() != null) {
            throw new BadRequestAlertException("Un nouveau poste ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        jobPositionDTO = jobPositionService.save(jobPositionDTO);
        return ResponseEntity.created(new URI("/api/job-positions/" + jobPositionDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, jobPositionDTO.getId().toString()))
            .body(jobPositionDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "UPDATE", entityType = "JobPosition")
    public ResponseEntity<JobPositionDTO> updateJobPosition(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody JobPositionDTO jobPositionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update JobPosition : {}, {}", id, jobPositionDTO);
        if (jobPositionDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, jobPositionDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!jobPositionRepository.existsById(id)) {
            throw new BadRequestAlertException("Poste introuvable.", ENTITY_NAME, "idnotfound");
        }
        jobPositionDTO = jobPositionService.update(jobPositionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, jobPositionDTO.getId().toString()))
            .body(jobPositionDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    public ResponseEntity<JobPositionDTO> partialUpdateJobPosition(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody JobPositionDTO jobPositionDTO
    ) throws URISyntaxException {
        if (jobPositionDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, jobPositionDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!jobPositionRepository.existsById(id)) {
            throw new BadRequestAlertException("Poste introuvable.", ENTITY_NAME, "idnotfound");
        }
        Optional<JobPositionDTO> result = jobPositionService.partialUpdate(jobPositionDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, jobPositionDTO.getId().toString())
        );
    }

    @GetMapping("")
    public List<JobPositionDTO> getAllJobPositions(@RequestParam(name = "companyId", required = false) Long companyId) {
        LOG.debug("REST request to get all JobPositions");
        Long tenantId = tenantContextService.getCurrentCompanyId();
        if (tenantId == null) {
            // SUPER_ADMIN : peut filtrer par companyId client ou voir tout
            return companyId != null ? jobPositionService.findByCompany(companyId) : jobPositionService.findAll();
        }
        return jobPositionService.findByCompany(tenantId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPositionDTO> getJobPosition(@PathVariable("id") Long id) {
        LOG.debug("REST request to get JobPosition : {}", id);
        Optional<JobPositionDTO> jobPositionDTO = jobPositionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(jobPositionDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "DELETE", entityType = "JobPosition")
    public ResponseEntity<Void> deleteJobPosition(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete JobPosition : {}", id);
        jobPositionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
