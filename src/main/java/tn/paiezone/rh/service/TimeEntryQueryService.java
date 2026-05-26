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
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.repository.TimeEntryRepository;
import tn.paiezone.rh.service.criteria.TimeEntryCriteria;
import tn.paiezone.rh.service.dto.TimeEntryDTO;
import tn.paiezone.rh.service.mapper.TimeEntryMapper;

/**
 * Service for executing complex queries for {@link TimeEntry} entities in the database.
 * The main input is a {@link TimeEntryCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link TimeEntryDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class TimeEntryQueryService extends QueryService<TimeEntry> {

    private static final Logger LOG = LoggerFactory.getLogger(TimeEntryQueryService.class);

    private final TimeEntryRepository timeEntryRepository;

    private final TimeEntryMapper timeEntryMapper;

    private final TenantContextService tenantContextService;

    public TimeEntryQueryService(
        TimeEntryRepository timeEntryRepository,
        TimeEntryMapper timeEntryMapper,
        TenantContextService tenantContextService
    ) {
        this.timeEntryRepository = timeEntryRepository;
        this.timeEntryMapper = timeEntryMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<TimeEntryDTO> findByCriteria(TimeEntryCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return timeEntryRepository.findAll(secureSpec(createSpecification(criteria)), page).map(timeEntryMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(TimeEntryCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return timeEntryRepository.count(secureSpec(createSpecification(criteria)));
    }

    private Specification<TimeEntry> secureSpec(Specification<TimeEntry> spec) {
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
     * Function to convert {@link TimeEntryCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<TimeEntry> createSpecification(TimeEntryCriteria criteria) {
        Specification<TimeEntry> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), TimeEntry_.id),
                buildRangeSpecification(criteria.getEntryDate(), TimeEntry_.entryDate),
                buildRangeSpecification(criteria.getCheckIn(), TimeEntry_.checkIn),
                buildRangeSpecification(criteria.getCheckOut(), TimeEntry_.checkOut),
                buildRangeSpecification(criteria.getWorkedHours(), TimeEntry_.workedHours),
                buildRangeSpecification(criteria.getOvertimeHours(), TimeEntry_.overtimeHours),
                buildRangeSpecification(criteria.getLateMinutes(), TimeEntry_.lateMinutes),
                buildSpecification(criteria.getSource(), TimeEntry_.source),
                buildSpecification(criteria.getStatus(), TimeEntry_.status),
                buildStringSpecification(criteria.getAnomalyNote(), TimeEntry_.anomalyNote),
                buildStringSpecification(criteria.getValidatedBy(), TimeEntry_.validatedBy),
                buildRangeSpecification(criteria.getValidatedAt(), TimeEntry_.validatedAt),
                buildSpecification(criteria.getEmployeeId(), root -> root.join(TimeEntry_.employee, JoinType.LEFT).get(Employee_.id)),
                buildStringSpecification(criteria.getValidatedBy(), TimeEntry_.validatedBy)
            );
        }
        return specification;
    }
}
