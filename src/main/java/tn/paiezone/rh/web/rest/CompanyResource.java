package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.domain.enumeration.CompanySubscriptionStatus;
import tn.paiezone.rh.domain.enumeration.PlanType;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.CompanySubscriptionRepository;
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

    private static final Map<PlanType, int[]> PLAN_LIMITS = Map.of(
        PlanType.STARTER,
        new int[] { 10, 0 },
        PlanType.PME,
        new int[] { 30, 290 },
        PlanType.BUSINESS,
        new int[] { 100, 720 },
        PlanType.ENTERPRISE,
        new int[] { 500, 1480 },
        PlanType.CUSTOM,
        new int[] { 9999, 0 }
    );

    private final CompanyService companyService;
    private final CompanyRepository companyRepository;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final TenantContextService tenantContextService;

    public CompanyResource(
        CompanyService companyService,
        CompanyRepository companyRepository,
        CompanySubscriptionRepository subscriptionRepository,
        UserProfileRepository userProfileRepository,
        UserRepository userRepository,
        TenantContextService tenantContextService
    ) {
        this.companyService = companyService;
        this.companyRepository = companyRepository;
        this.subscriptionRepository = subscriptionRepository;
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

        // 1. Admin principal inscrit via /register-with-company
        companyRepository
            .findById(companyId)
            .ifPresent(c -> {
                if (c.getAdminLogin() != null) logins.add(c.getAdminLogin());
            });

        // 2. Tous les utilisateurs ayant un UserProfile lié à cette entreprise
        userProfileRepository
            .findByCompanyId(companyId)
            .forEach(up -> {
                if (up.getJhiUserId() != null) logins.add(up.getJhiUserId());
            });

        // 3. Utilisateurs créés par l'un des admins de cette entreprise mais sans UserProfile
        //    (cas des invitations faites avant le fix de création automatique du UserProfile)
        new HashSet<>(logins).forEach(adminLogin -> userRepository.findAllByCreatedBy(adminLogin).forEach(u -> logins.add(u.getLogin())));

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

    /** Change le plan d'abonnement de l'entreprise. */
    @PostMapping("/{id}/change-plan")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Transactional
    public ResponseEntity<CompanyDTO> changePlan(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Long currentCompanyId = tenantContextService.getCurrentCompanyId();
        if (currentCompanyId != null && !currentCompanyId.equals(id)) {
            return ResponseEntity.status(403).build();
        }

        String planName = body.get("plan");
        PlanType plan;
        try {
            plan = PlanType.valueOf(planName);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException("Plan invalide : " + planName, ENTITY_NAME, "invalidPlan");
        }

        var company = companyRepository
            .findById(id)
            .orElseThrow(() -> new BadRequestAlertException("Entreprise introuvable", ENTITY_NAME, "idnotfound"));

        var sub = company.getCompanySubscription();
        boolean isNew = (sub == null);
        if (isNew) {
            sub = new tn.paiezone.rh.domain.CompanySubscription();
            sub.setStartDate(LocalDate.now());
            sub.setBillingDay(LocalDate.now().getDayOfMonth());
        }

        int[] limits = PLAN_LIMITS.getOrDefault(plan, new int[] { 10, 0 });
        sub.setPlan(plan);
        sub.setMaxEmployees(limits[0]);
        sub.setPriceHT(BigDecimal.valueOf(limits[1]));
        sub.setStatus(CompanySubscriptionStatus.ACTIVE);
        sub.setRenewalDate(LocalDate.now().plusMonths(1));
        sub = subscriptionRepository.save(sub);

        if (isNew) {
            company.setCompanySubscription(sub);
            companyRepository.save(company);
        }

        CompanyDTO dto = companyService.findOne(id).orElseThrow();
        return ResponseEntity.ok().body(dto);
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
