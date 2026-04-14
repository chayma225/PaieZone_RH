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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.service.AuditLogQueryService;
import tn.paiezone.rh.service.AuditLogService;
import tn.paiezone.rh.service.criteria.AuditLogCriteria;
import tn.paiezone.rh.service.dto.AuditLogDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogResource {

    private static final Logger LOG = LoggerFactory.getLogger(AuditLogResource.class);
    private static final String ENTITY_NAME = "auditLog";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final AuditLogService auditLogService;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogQueryService auditLogQueryService;

    public AuditLogResource(
        AuditLogService auditLogService,
        AuditLogRepository auditLogRepository,
        AuditLogQueryService auditLogQueryService
    ) {
        this.auditLogService = auditLogService;
        this.auditLogRepository = auditLogRepository;
        this.auditLogQueryService = auditLogQueryService;
    }

    // ← Ignorer le header HTTP User-Agent qui cause le conflit
    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.setDisallowedFields("userAgent");
    }

    @PostMapping("")
    public ResponseEntity<AuditLogDTO> createAuditLog(@Valid @RequestBody AuditLogDTO auditLogDTO) throws URISyntaxException {
        LOG.debug("REST request to save AuditLog : {}", auditLogDTO);
        if (auditLogDTO.getId() != null) {
            throw new BadRequestAlertException("A new auditLog cannot already have an ID", ENTITY_NAME, "idexists");
        }
        auditLogDTO = auditLogService.save(auditLogDTO);
        return ResponseEntity.created(new URI("/api/audit-logs/" + auditLogDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, auditLogDTO.getId().toString()))
            .body(auditLogDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuditLogDTO> updateAuditLog(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AuditLogDTO auditLogDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update AuditLog : {}, {}", id, auditLogDTO);
        if (auditLogDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, auditLogDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!auditLogRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        auditLogDTO = auditLogService.update(auditLogDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, auditLogDTO.getId().toString()))
            .body(auditLogDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AuditLogDTO> partialUpdateAuditLog(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AuditLogDTO auditLogDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update AuditLog partially : {}, {}", id, auditLogDTO);
        if (auditLogDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, auditLogDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!auditLogRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        Optional<AuditLogDTO> result = auditLogService.partialUpdate(auditLogDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, auditLogDTO.getId().toString())
        );
    }

    @GetMapping("")
    public ResponseEntity<List<AuditLogDTO>> getAllAuditLogs(
        AuditLogCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get AuditLogs by criteria: {}", criteria);
        Page<AuditLogDTO> page = auditLogQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countAuditLogs(AuditLogCriteria criteria) {
        LOG.debug("REST request to count AuditLogs by criteria: {}", criteria);
        return ResponseEntity.ok().body(auditLogQueryService.countByCriteria(criteria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogDTO> getAuditLog(@PathVariable("id") Long id) {
        LOG.debug("REST request to get AuditLog : {}", id);
        Optional<AuditLogDTO> auditLogDTO = auditLogService.findOne(id);
        return ResponseUtil.wrapOrNotFound(auditLogDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditLog(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete AuditLog : {}", id);
        auditLogService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
