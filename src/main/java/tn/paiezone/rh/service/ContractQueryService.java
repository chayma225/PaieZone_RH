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
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.service.criteria.ContractCriteria;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.mapper.ContractMapper;

/**
 * Service for executing complex queries for {@link Contract} entities in the database.
 * The main input is a {@link ContractCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link ContractDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class ContractQueryService extends QueryService<Contract> {

    private static final Logger LOG = LoggerFactory.getLogger(ContractQueryService.class);

    private final ContractRepository contractRepository;

    private final ContractMapper contractMapper;

    public ContractQueryService(ContractRepository contractRepository, ContractMapper contractMapper) {
        this.contractRepository = contractRepository;
        this.contractMapper = contractMapper;
    }

    /**
     * Return a {@link Page} of {@link ContractDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<ContractDTO> findByCriteria(ContractCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Contract> specification = createSpecification(criteria);
        return contractRepository.findAll(specification, page).map(contractMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(ContractCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Contract> specification = createSpecification(criteria);
        return contractRepository.count(specification);
    }

    /**
     * Function to convert {@link ContractCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Contract> createSpecification(ContractCriteria criteria) {
        Specification<Contract> specification = Specification.where(null);
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : null,
                buildRangeSpecification(criteria.getId(), Contract_.id),
                buildStringSpecification(criteria.getReference(), Contract_.reference),
                buildSpecification(criteria.getContractType(), Contract_.contractType),
                buildSpecification(criteria.getStatus(), Contract_.status),
                buildRangeSpecification(criteria.getStartDate(), Contract_.startDate),
                buildRangeSpecification(criteria.getEndDate(), Contract_.endDate),
                buildRangeSpecification(criteria.getSignedDate(), Contract_.signedDate),
                buildRangeSpecification(criteria.getBaseSalary(), Contract_.baseSalary),
                buildRangeSpecification(criteria.getWorkingHoursWeek(), Contract_.workingHoursWeek),
                buildRangeSpecification(criteria.getWorkingDaysWeek(), Contract_.workingDaysWeek),
                buildStringSpecification(criteria.getConventionCollective(), Contract_.conventionCollective),
                buildRangeSpecification(criteria.getTrialPeriodMonths(), Contract_.trialPeriodMonths),
                buildRangeSpecification(criteria.getRenewalCount(), Contract_.renewalCount),
                buildStringSpecification(criteria.getDocumentUrl(), Contract_.documentUrl),
                buildRangeSpecification(criteria.getCreatedAt(), Contract_.createdAt),
                buildSpecification(criteria.getEmployeeId(), root -> root.join(Contract_.employee, JoinType.LEFT).get(Employee_.id)),
                buildSpecification(criteria.getCreatedById(), root -> root.join(Contract_.createdBy, JoinType.LEFT).get(UserProfile_.id))
            );
        }
        return specification;
    }
}
