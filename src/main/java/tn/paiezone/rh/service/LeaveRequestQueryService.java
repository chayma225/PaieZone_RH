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
import tn.paiezone.rh.domain.LeaveRequest;
import tn.paiezone.rh.repository.LeaveRequestRepository;
import tn.paiezone.rh.service.criteria.LeaveRequestCriteria;
import tn.paiezone.rh.service.dto.LeaveRequestDTO;
import tn.paiezone.rh.service.mapper.LeaveRequestMapper;

/**
 * Service for executing complex queries for {@link LeaveRequest} entities in the database.
 * The main input is a {@link LeaveRequestCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link LeaveRequestDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class LeaveRequestQueryService extends QueryService<LeaveRequest> {

    private static final Logger LOG = LoggerFactory.getLogger(LeaveRequestQueryService.class);

    private final LeaveRequestRepository leaveRequestRepository;

    private final LeaveRequestMapper leaveRequestMapper;

    public LeaveRequestQueryService(LeaveRequestRepository leaveRequestRepository, LeaveRequestMapper leaveRequestMapper) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveRequestMapper = leaveRequestMapper;
    }

    /**
     * Return a {@link Page} of {@link LeaveRequestDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<LeaveRequestDTO> findByCriteria(LeaveRequestCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<LeaveRequest> specification = createSpecification(criteria);
        return leaveRequestRepository.findAll(specification, page).map(leaveRequestMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(LeaveRequestCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<LeaveRequest> specification = createSpecification(criteria);
        return leaveRequestRepository.count(specification);
    }

    /**
     * Function to convert {@link LeaveRequestCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<LeaveRequest> createSpecification(LeaveRequestCriteria criteria) {
        Specification<LeaveRequest> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), LeaveRequest_.id),
                buildRangeSpecification(criteria.getStartDate(), LeaveRequest_.startDate),
                buildRangeSpecification(criteria.getEndDate(), LeaveRequest_.endDate),
                buildRangeSpecification(criteria.getNumberOfDays(), LeaveRequest_.numberOfDays),
                buildSpecification(criteria.getStatus(), LeaveRequest_.status),
                buildRangeSpecification(criteria.getRequestedAt(), LeaveRequest_.requestedAt),
                buildRangeSpecification(criteria.getProcessedAt(), LeaveRequest_.processedAt),
                buildStringSpecification(criteria.getManagerComment(), LeaveRequest_.managerComment),
                buildStringSpecification(criteria.getEmployeeComment(), LeaveRequest_.employeeComment),
                buildStringSpecification(criteria.getDocumentUrl(), LeaveRequest_.documentUrl),
                buildSpecification(criteria.getEmployeeId(), root -> root.join(LeaveRequest_.employee, JoinType.LEFT).get(Employee_.id)),
                buildSpecification(criteria.getLeaveTypeId(), root -> root.join(LeaveRequest_.leaveType, JoinType.LEFT).get(LeaveType_.id)),
                buildSpecification(criteria.getApprovedById(), root ->
                    root.join(LeaveRequest_.approvedBy, JoinType.LEFT).get(UserProfile_.id)
                )
            );
        }
        return specification;
    }
}
