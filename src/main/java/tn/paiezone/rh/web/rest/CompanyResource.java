package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.repository.UserRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.CompanyService;
import tn.paiezone.rh.service.TenantContextService;
import tn.paiezone.rh.service.dto.AdminUserDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/companies")
public class CompanyResource {

    private static final Logger LOG = LoggerFactory.getLogger(CompanyResource.class);
    private static final String ENTITY_NAME = "company";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final CompanyService companyService;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final TenantContextService tenantContextService;

    public CompanyResource(
        CompanyService companyService,
        CompanyRepository companyRepository,
        UserProfileRepository userProfileRepository,
        UserRepository userRepository,
        TenantContextService tenantContextService
    ) {
        this.companyService = companyService;
        this.companyRepository = companyRepository;
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.tenantContextService = tenantContextService;
    }

    @PostMapping("")
    @Auditable(action = "CREATE", entityType = "Company")
    public ResponseEntity<CompanyDTO> createCompany(@Valid @RequestBody CompanyDTO companyDTO) throws URISyntaxException {
        LOG.debug("REST request to save Company : {}", companyDTO);
        if (companyDTO.getId() != null) {
            throw new BadRequestAlertException("Une nouvelle entreprise ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        companyDTO = companyService.save(companyDTO);
        return ResponseEntity.created(new URI("/api/companies/" + companyDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, companyDTO.getId().toString()))
            .body(companyDTO);
    }

    @PutMapping("/{id}")
    @Auditable(action = "UPDATE", entityType = "Company")
    public ResponseEntity<CompanyDTO> updateCompany(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CompanyDTO companyDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Company : {}, {}", id, companyDTO);
        if (companyDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, companyDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!companyRepository.existsById(id)) {
            throw new BadRequestAlertException("Entreprise introuvable.", ENTITY_NAME, "idnotfound");
        }
        companyDTO = companyService.update(companyDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, companyDTO.getId().toString()))
            .body(companyDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @Auditable(action = "PATCH", entityType = "Company")
    public ResponseEntity<CompanyDTO> partialUpdateCompany(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CompanyDTO companyDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Company : {}, {}", id, companyDTO);
        if (companyDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, companyDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!companyRepository.existsById(id)) {
            throw new BadRequestAlertException("Entreprise introuvable.", ENTITY_NAME, "idnotfound");
        }
        Optional<CompanyDTO> result = companyService.partialUpdate(companyDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, companyDTO.getId().toString())
        );
    }

    @GetMapping("")
    public List<CompanyDTO> getAllCompanies() {
        LOG.debug("REST request to get all Companies");
        return companyService.findAllForCurrentUser();
    }

    /** Retourne les utilisateurs appartenant à l'entreprise de l'admin connecté. */
    @GetMapping("/my-users")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    public List<AdminUserDTO> getMyCompanyUsers() {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null) return List.of();

        Set<String> logins = new HashSet<>();
        companyRepository
            .findById(companyId)
            .ifPresent(c -> {
                if (c.getAdminLogin() != null) logins.add(c.getAdminLogin());
            });
        userProfileRepository
            .findByCompanyId(companyId)
            .forEach(up -> {
                if (up.getJhiUserId() != null) logins.add(up.getJhiUserId());
            });

        return logins
            .stream()
            .flatMap(login -> userRepository.findOneWithAuthoritiesByLogin(login).stream())
            .map(AdminUserDTO::new)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompany(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Company : {}", id);
        Optional<CompanyDTO> companyDTO = companyService.findOne(id);
        return ResponseUtil.wrapOrNotFound(companyDTO);
    }

    @DeleteMapping("/{id}")
    @Auditable(action = "DELETE", entityType = "Company")
    public ResponseEntity<Void> deleteCompany(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Company : {}", id);
        companyService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    @Auditable(action = "TOGGLE_STATUS", entityType = "Company")
    public ResponseEntity<CompanyDTO> toggleStatus(@PathVariable Long id) {
        LOG.debug("REST request to toggle status of Company : {}", id);

        CompanyDTO dto = companyService
            .findOne(id)
            .orElseThrow(() -> new BadRequestAlertException("Entreprise introuvable.", ENTITY_NAME, "idnotfound"));

        dto.setActive(!dto.getActive());
        dto = companyService.update(dto);

        return ResponseEntity.ok().headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString())).body(dto);
    }
}
