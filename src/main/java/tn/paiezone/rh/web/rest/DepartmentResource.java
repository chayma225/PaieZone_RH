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
import tn.paiezone.rh.repository.DepartmentRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.DepartmentService;
import tn.paiezone.rh.service.TenantContextService;
import tn.paiezone.rh.service.dto.DepartmentDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/departments")
public class DepartmentResource {

    private static final Logger LOG = LoggerFactory.getLogger(DepartmentResource.class);
    private static final String ENTITY_NAME = "department";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final DepartmentService departmentService;
    private final DepartmentRepository departmentRepository;
    private final TenantContextService tenantContextService;

    public DepartmentResource(
        DepartmentService departmentService,
        DepartmentRepository departmentRepository,
        TenantContextService tenantContextService
    ) {
        this.departmentService = departmentService;
        this.departmentRepository = departmentRepository;
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
    @Auditable(action = "CREATE", entityType = "Department")
    public ResponseEntity<DepartmentDTO> createDepartment(@Valid @RequestBody DepartmentDTO departmentDTO) throws URISyntaxException {
        LOG.debug("REST request to save Department : {}", departmentDTO);
        if (departmentDTO.getId() != null) {
            throw new BadRequestAlertException("Un nouveau département ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        departmentDTO = departmentService.save(departmentDTO);
        return ResponseEntity.created(new URI("/api/departments/" + departmentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, departmentDTO.getId().toString()))
            .body(departmentDTO);
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
    @Auditable(action = "UPDATE", entityType = "Department")
    public ResponseEntity<DepartmentDTO> updateDepartment(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DepartmentDTO departmentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Department : {}, {}", id, departmentDTO);
        if (departmentDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, departmentDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!departmentRepository.existsById(id)) {
            throw new BadRequestAlertException("Département introuvable.", ENTITY_NAME, "idnotfound");
        }
        departmentDTO = departmentService.update(departmentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, departmentDTO.getId().toString()))
            .body(departmentDTO);
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
    public ResponseEntity<DepartmentDTO> partialUpdateDepartment(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DepartmentDTO departmentDTO
    ) throws URISyntaxException {
        if (departmentDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, departmentDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!departmentRepository.existsById(id)) {
            throw new BadRequestAlertException("Département introuvable.", ENTITY_NAME, "idnotfound");
        }
        Optional<DepartmentDTO> result = departmentService.partialUpdate(departmentDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, departmentDTO.getId().toString())
        );
    }

    @GetMapping("")
    public List<DepartmentDTO> getAllDepartments(@RequestParam(name = "companyId", required = false) Long companyId) {
        LOG.debug("REST request to get all Departments");
        Long tenantId = tenantContextService.getCurrentCompanyId();
        if (tenantId == null) {
            // SUPER_ADMIN : peut filtrer par companyId client ou voir tout
            return companyId != null ? departmentService.findByCompany(companyId) : departmentService.findAll();
        }
        return departmentService.findByCompany(tenantId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDTO> getDepartment(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Department : {}", id);
        Optional<DepartmentDTO> departmentDTO = departmentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(departmentDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "DELETE", entityType = "Department")
    public ResponseEntity<Void> deleteDepartment(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Department : {}", id);
        departmentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
