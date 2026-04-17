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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.EmployeeQueryService;
import tn.paiezone.rh.service.EmployeeService;
import tn.paiezone.rh.service.criteria.EmployeeCriteria;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/employees")
public class EmployeeResource {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeResource.class);
    private static final String ENTITY_NAME = "employee";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final EmployeeService employeeService;
    private final EmployeeRepository employeeRepository;
    private final EmployeeQueryService employeeQueryService;

    public EmployeeResource(
        EmployeeService employeeService,
        EmployeeRepository employeeRepository,
        EmployeeQueryService employeeQueryService
    ) {
        this.employeeService = employeeService;
        this.employeeRepository = employeeRepository;
        this.employeeQueryService = employeeQueryService;
    }

    // ── US-09 : Créer employé ─────────────────────────────────────────────────
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
    @Auditable(action = "CREATE", entityType = "Employee")
    public ResponseEntity<EmployeeDTO> createEmployee(@Valid @RequestBody EmployeeDTO employeeDTO) throws URISyntaxException {
        LOG.debug("REST request to save Employee : {}", employeeDTO);
        if (employeeDTO.getId() != null) {
            throw new BadRequestAlertException("Un nouvel employé ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        employeeDTO = employeeService.save(employeeDTO);
        return ResponseEntity.created(new URI("/api/employees/" + employeeDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, employeeDTO.getId().toString()))
            .body(employeeDTO);
    }

    // ── US-10 : Modifier employé ──────────────────────────────────────────────
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
    @Auditable(action = "UPDATE", entityType = "Employee")
    public ResponseEntity<EmployeeDTO> updateEmployee(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EmployeeDTO employeeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Employee : {}, {}", id, employeeDTO);
        if (employeeDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, employeeDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!employeeRepository.existsById(id)) {
            throw new BadRequestAlertException("Employé introuvable.", ENTITY_NAME, "idnotfound");
        }
        employeeDTO = employeeService.update(employeeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, employeeDTO.getId().toString()))
            .body(employeeDTO);
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
    public ResponseEntity<EmployeeDTO> partialUpdateEmployee(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EmployeeDTO employeeDTO
    ) throws URISyntaxException {
        if (employeeDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, employeeDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!employeeRepository.existsById(id)) {
            throw new BadRequestAlertException("Employé introuvable.", ENTITY_NAME, "idnotfound");
        }
        Optional<EmployeeDTO> result = employeeService.partialUpdate(employeeDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, employeeDTO.getId().toString())
        );
    }

    // ── US-09 : Recherche et filtres ──────────────────────────────────────────
    @GetMapping("")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees(
        EmployeeCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get Employees by criteria: {}", criteria);
        Page<EmployeeDTO> page = employeeQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countEmployees(EmployeeCriteria criteria) {
        LOG.debug("REST request to count Employees by criteria: {}", criteria);
        return ResponseEntity.ok().body(employeeQueryService.countByCriteria(criteria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Employee : {}", id);
        Optional<EmployeeDTO> employeeDTO = employeeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(employeeDTO);
    }

    // ── Désactiver employé (soft delete) ──────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "DELETE", entityType = "Employee")
    public ResponseEntity<Void> deleteEmployee(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Employee : {}", id);
        employeeService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
