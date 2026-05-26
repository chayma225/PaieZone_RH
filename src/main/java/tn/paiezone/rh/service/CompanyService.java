package tn.paiezone.rh.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.domain.enumeration.CompanySubscriptionStatus;
import tn.paiezone.rh.domain.enumeration.PlanType;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.CompanySubscriptionRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.mapper.CompanyMapper;

@Service
@Transactional
public class CompanyService {

    private static final Logger LOG = LoggerFactory.getLogger(CompanyService.class);
    private static final String ENTITY_NAME = "company";

    private final CompanyRepository companyRepository;
    private final CompanyMapper companyMapper;
    private final CompanySubscriptionRepository subscriptionRepository;
    private final EmployeeRepository employeeRepository;

    public CompanyService(
        CompanyRepository companyRepository,
        CompanyMapper companyMapper,
        CompanySubscriptionRepository subscriptionRepository,
        EmployeeRepository employeeRepository
    ) {
        this.companyRepository = companyRepository;
        this.companyMapper = companyMapper;
        this.subscriptionRepository = subscriptionRepository;
        this.employeeRepository = employeeRepository;
    }

    private CompanyDTO withEmployeeCount(CompanyDTO dto) {
        if (dto.getId() != null) {
            dto.setEmployeeCount(employeeRepository.countByCompanyId(dto.getId()));
        }
        return dto;
    }

    private static final java.util.Map<PlanType, int[]> PLAN_LIMITS = java.util.Map.of(
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

    /**
     * ✅ CREATE — génération automatique des champs techniques
     */
    public CompanyDTO save(CompanyDTO companyDTO) {
        return save(companyDTO, null);
    }

    /**
     * ✅ CREATE with explicit plan — honore le plan choisi à l'inscription.
     */
    public CompanyDTO save(CompanyDTO companyDTO, PlanType chosenPlan) {
        LOG.debug("Request to save Company : {}", companyDTO);

        companyDTO.setTenantSchema("tenant_" + UUID.randomUUID().toString().replace("-", ""));
        companyDTO.setCreatedAt(Instant.now());
        companyDTO.setActive(true);
        companyDTO.setTrialEnd(LocalDate.now().plusDays(14));

        Company company = companyMapper.toEntity(companyDTO);
        company = companyRepository.save(company);

        // Crée l'abonnement en respectant le plan choisi (STARTER par défaut)
        if (company.getCompanySubscription() == null) {
            PlanType plan = (chosenPlan != null) ? chosenPlan : PlanType.STARTER;
            int[] limits = PLAN_LIMITS.getOrDefault(plan, new int[] { 10, 0 });
            CompanySubscription sub = new CompanySubscription();
            sub.setPlan(plan);
            sub.setStatus(CompanySubscriptionStatus.TRIAL);
            sub.setMaxEmployees(limits[0]);
            sub.setPriceHT(BigDecimal.valueOf(limits[1]));
            sub.setBillingDay(1);
            sub.setStartDate(LocalDate.now());
            sub.setRenewalDate(LocalDate.now().plusDays(14));
            sub = subscriptionRepository.save(sub);
            company.setCompanySubscription(sub);
            company = companyRepository.save(company);
        }

        return companyMapper.toDto(company);
    }

    /**
     * ✅ UPDATE — protège les champs immuables MAIS respecte active
     *    (permet au toggleStatus de fonctionner)
     */
    public CompanyDTO update(CompanyDTO companyDTO) {
        LOG.debug("Request to update Company : {}", companyDTO);

        Company existing = companyRepository
            .findById(companyDTO.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entreprise introuvable."));

        // Update mutable fields directly on the managed entity — never create a new detached object
        if (companyDTO.getName() != null) existing.setName(companyDTO.getName());
        if (companyDTO.getTradeName() != null) existing.setTradeName(companyDTO.getTradeName());
        if (companyDTO.getTaxId() != null) existing.setTaxId(companyDTO.getTaxId());
        if (companyDTO.getCnssId() != null) existing.setCnssId(companyDTO.getCnssId());
        if (companyDTO.getAddress() != null) existing.setAddress(companyDTO.getAddress());
        if (companyDTO.getCity() != null) existing.setCity(companyDTO.getCity());
        if (companyDTO.getPostalCode() != null) existing.setPostalCode(companyDTO.getPostalCode());
        if (companyDTO.getGouvernorat() != null) existing.setGouvernorat(companyDTO.getGouvernorat());
        if (companyDTO.getPhone() != null) existing.setPhone(companyDTO.getPhone());
        if (companyDTO.getEmail() != null) existing.setEmail(companyDTO.getEmail());
        if (companyDTO.getLogoUrl() != null) existing.setLogoUrl(companyDTO.getLogoUrl());
        if (companyDTO.getLegalForm() != null) existing.setLegalForm(companyDTO.getLegalForm());
        if (companyDTO.getCapitalSocial() != null) existing.setCapitalSocial(companyDTO.getCapitalSocial());
        if (companyDTO.getMainActivity() != null) existing.setMainActivity(companyDTO.getMainActivity());
        if (companyDTO.getWebsite() != null) existing.setWebsite(companyDTO.getWebsite());
        if (companyDTO.getActive() != null) existing.setActive(companyDTO.getActive());

        // Immutable fields (tenantSchema, createdAt, trialEnd, adminLogin, companySubscription) are never touched

        Company saved = companyRepository.save(existing);
        return companyMapper.toDto(saved);
    }

    /**
     * ✅ PARTIAL UPDATE — protège tous les champs techniques
     */
    public Optional<CompanyDTO> partialUpdate(CompanyDTO companyDTO) {
        LOG.debug("Request to partially update Company : {}", companyDTO);

        return companyRepository
            .findById(companyDTO.getId())
            .map(existingCompany -> {
                companyDTO.setTenantSchema(existingCompany.getTenantSchema());
                companyDTO.setCreatedAt(existingCompany.getCreatedAt());
                companyDTO.setTrialEnd(existingCompany.getTrialEnd());
                companyDTO.setAdminLogin(existingCompany.getAdminLogin());
                if (companyDTO.getActive() == null) {
                    companyDTO.setActive(existingCompany.getActive());
                }
                companyMapper.partialUpdate(existingCompany, companyDTO);
                return existingCompany;
            })
            .map(companyRepository::save)
            .map(companyMapper::toDto);
    }

    /**
     * Get all companies — SUPER_ADMIN sees all, ADMIN sees only their own.
     */
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAll() {
        LOG.debug("Request to get all Companies");
        return companyRepository
            .findAll()
            .stream()
            .map(companyMapper::toDto)
            .map(this::withEmployeeCount)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Role-aware company list: SUPER_ADMIN → all; ADMIN → own company only.
     * Uses a combined query: admin_login match OR UserProfile with ADMIN role.
     */
    @Transactional(readOnly = true)
    public List<CompanyDTO> findAllForCurrentUser() {
        if (SecurityUtils.hasCurrentUserAnyOfAuthorities(AuthoritiesConstants.SUPER_ADMIN)) {
            return findAll();
        }
        return SecurityUtils.getCurrentUserLogin()
            .map(login ->
                companyRepository
                    .findByAdminLoginOrAdminProfile(login, tn.paiezone.rh.domain.enumeration.AppRole.ADMIN)
                    .stream()
                    .map(companyMapper::toDto)
                    .map(this::withEmployeeCount)
                    .collect(Collectors.toCollection(LinkedList::new))
            )
            .orElseGet(LinkedList::new);
    }

    /**
     * Get one company by id.
     */
    @Transactional(readOnly = true)
    public Optional<CompanyDTO> findOne(Long id) {
        LOG.debug("Request to get Company : {}", id);
        return companyRepository.findById(id).map(companyMapper::toDto).map(this::withEmployeeCount);
    }

    /**
     * Delete the company by id.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Company : {}", id);
        companyRepository.deleteById(id);
    }
}
