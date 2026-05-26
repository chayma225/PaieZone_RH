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
import tn.paiezone.rh.domain.Bonus;
import tn.paiezone.rh.repository.BonusRepository;
import tn.paiezone.rh.service.criteria.BonusCriteria;
import tn.paiezone.rh.service.dto.BonusDTO;
import tn.paiezone.rh.service.mapper.BonusMapper;

/**
 * Service for executing complex queries for {@link Bonus} entities in the database.
 * The main input is a {@link BonusCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link BonusDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class BonusQueryService extends QueryService<Bonus> {

    private static final Logger LOG = LoggerFactory.getLogger(BonusQueryService.class);

    private final BonusRepository bonusRepository;

    private final BonusMapper bonusMapper;

    private final TenantContextService tenantContextService;

    public BonusQueryService(BonusRepository bonusRepository, BonusMapper bonusMapper, TenantContextService tenantContextService) {
        this.bonusRepository = bonusRepository;
        this.bonusMapper = bonusMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<BonusDTO> findByCriteria(BonusCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return bonusRepository.findAll(secureSpec(createSpecification(criteria)), page).map(bonusMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(BonusCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return bonusRepository.count(secureSpec(createSpecification(criteria)));
    }

    private Specification<Bonus> secureSpec(Specification<Bonus> spec) {
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
     * Function to convert {@link BonusCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Bonus> createSpecification(BonusCriteria criteria) {
        Specification<Bonus> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Bonus_.id),
                buildSpecification(criteria.getBonusType(), Bonus_.bonusType),
                buildStringSpecification(criteria.getLabel(), Bonus_.label),
                buildRangeSpecification(criteria.getAmount(), Bonus_.amount),
                buildSpecification(criteria.getTaxable(), Bonus_.taxable),
                buildRangeSpecification(criteria.getMonth(), Bonus_.month),
                buildRangeSpecification(criteria.getYear(), Bonus_.year),
                buildStringSpecification(criteria.getNotes(), Bonus_.notes),
                buildSpecification(criteria.getEmployeeId(), root -> root.join(Bonus_.employee, JoinType.LEFT).get(Employee_.id)),
                buildSpecification(criteria.getPaySlipId(), root -> root.join(Bonus_.paySlip, JoinType.LEFT).get(PaySlip_.id))
            );
        }
        return specification;
    }
}
