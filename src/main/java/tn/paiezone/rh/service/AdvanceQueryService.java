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
import tn.paiezone.rh.domain.*; // for static metamodels
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.repository.AdvanceRepository;
import tn.paiezone.rh.service.criteria.AdvanceCriteria;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.service.mapper.AdvanceMapper;

/**
 * Service for executing complex queries for {@link Advance} entities in the database.
 * The main input is a {@link AdvanceCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link AdvanceDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class AdvanceQueryService extends QueryService<Advance> {

    private static final Logger LOG = LoggerFactory.getLogger(AdvanceQueryService.class);

    private final AdvanceRepository advanceRepository;

    private final AdvanceMapper advanceMapper;

    private final TenantContextService tenantContextService;

    public AdvanceQueryService(
        AdvanceRepository advanceRepository,
        AdvanceMapper advanceMapper,
        TenantContextService tenantContextService
    ) {
        this.advanceRepository = advanceRepository;
        this.advanceMapper = advanceMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<AdvanceDTO> findByCriteria(AdvanceCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return advanceRepository.findAll(secureSpec(createSpecification(criteria)), page).map(advanceMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(AdvanceCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return advanceRepository.count(secureSpec(createSpecification(criteria)));
    }

    private Specification<Advance> secureSpec(Specification<Advance> spec) {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employee").get("company").get("id"), companyId));
        }
        Long employeeId = tenantContextService.getCurrentEmployeeId();
        if (employeeId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employee").get("id"), employeeId));
        }
        return spec;
    }

    /**
     * Function to convert {@link AdvanceCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Advance> createSpecification(AdvanceCriteria criteria) {
        Specification<Advance> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Advance_.id),
                buildRangeSpecification(criteria.getRequestDate(), Advance_.requestDate),
                buildRangeSpecification(criteria.getAmount(), Advance_.amount),
                buildRangeSpecification(criteria.getDeductionMonth(), Advance_.deductionMonth),
                buildRangeSpecification(criteria.getDeductionYear(), Advance_.deductionYear),
                buildSpecification(criteria.getStatus(), Advance_.status),
                buildStringSpecification(criteria.getApprovedBy(), Advance_.approvedBy),
                buildStringSpecification(criteria.getNotes(), Advance_.notes),
                buildSpecification(criteria.getEmployeeId(), root -> root.join(Advance_.employee, JoinType.LEFT).get(Employee_.id)),
                buildSpecification(criteria.getPaySlipId(), root -> root.join(Advance_.paySlip, JoinType.LEFT).get(PaySlip_.id)),
                buildStringSpecification(criteria.getApprovedBy(), Advance_.approvedBy)
            );
        }
        return specification;
    }
}
