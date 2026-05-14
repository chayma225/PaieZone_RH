package tn.paiezone.rh.service;

import jakarta.persistence.criteria.JoinType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.service.QueryService;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.service.criteria.ContractCriteria;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.mapper.ContractMapper;

/**
 * Service for executing complex queries for {@link Contract} entities.
 *
 * FIX CRITIQUE : Les champs enum (contractType, status) doivent utiliser
 * buildSpecification() et NON buildStringSpecification().
 * buildStringSpecification() attend un StringFilter → incompatibilité de type
 * au runtime avec Hibernate 6 : "String is not assignable to ContractStatus"
 */
@Service
@Transactional(readOnly = true)
public class ContractQueryService extends QueryService<Contract> {

    private static final Logger LOG = LoggerFactory.getLogger(ContractQueryService.class);

    private final ContractRepository contractRepository;
    private final ContractMapper contractMapper;
    private final TenantContextService tenantContextService;

    public ContractQueryService(
        ContractRepository contractRepository,
        ContractMapper contractMapper,
        TenantContextService tenantContextService
    ) {
        this.contractRepository = contractRepository;
        this.contractMapper = contractMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<ContractDTO> findByCriteria(ContractCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return contractRepository.findAll(tenantSpec(createSpecification(criteria)), page).map(contractMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(ContractCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return contractRepository.count(tenantSpec(createSpecification(criteria)));
    }

    /** Filtre automatique sur le company_id du tenant courant via l'employé. */
    private Specification<Contract> tenantSpec(Specification<Contract> spec) {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null) return spec;
        return spec.and((root, query, cb) ->
            cb.equal(root.join("employee", jakarta.persistence.criteria.JoinType.LEFT).get("company").get("id"), companyId)
        );
    }

    protected Specification<Contract> createSpecification(ContractCriteria criteria) {
        Specification<Contract> specification = Specification.unrestricted();
        if (criteria == null) return specification;

        specification = Specification.allOf(
            // distinct
            Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
            // Champs scalaires
            buildRangeSpecification(criteria.getId(), Contract_.id),
            buildStringSpecification(criteria.getReference(), Contract_.reference),
            // ── ENUM : buildSpecification (PAS buildStringSpecification) ──
            // ❌ ERREUR PRÉCÉDENTE : buildStringSpecification(criteria.getContractType(), ...)
            // ✅ CORRECT           : buildSpecification(criteria.getContractType(), ...)
            buildSpecification(criteria.getContractType(), Contract_.contractType),
            buildSpecification(criteria.getStatus(), Contract_.status),
            // Dates
            buildRangeSpecification(criteria.getStartDate(), Contract_.startDate),
            buildRangeSpecification(criteria.getEndDate(), Contract_.endDate),
            buildRangeSpecification(criteria.getSignedDate(), Contract_.signedDate),
            // Numériques
            buildRangeSpecification(criteria.getBaseSalary(), Contract_.baseSalary),
            buildRangeSpecification(criteria.getWorkingHoursWeek(), Contract_.workingHoursWeek),
            buildRangeSpecification(criteria.getWorkingDaysWeek(), Contract_.workingDaysWeek),
            buildRangeSpecification(criteria.getTrialPeriodMonths(), Contract_.trialPeriodMonths),
            buildRangeSpecification(criteria.getRenewalCount(), Contract_.renewalCount),
            // Chaînes
            buildStringSpecification(criteria.getConventionCollective(), Contract_.conventionCollective),
            buildStringSpecification(criteria.getDocumentUrl(), Contract_.documentUrl),
            // Timestamp
            buildRangeSpecification(criteria.getCreatedAt(), Contract_.createdAt),
            // Relations (JOIN)
            buildSpecification(criteria.getEmployeeId(), root -> root.join(Contract_.employee, JoinType.LEFT).get(Employee_.id)),
            buildSpecification(criteria.getCreatedById(), root -> root.join(Contract_.createdBy, JoinType.LEFT).get(UserProfile_.id))
        );

        return specification;
    }
}
