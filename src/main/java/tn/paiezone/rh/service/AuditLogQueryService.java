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
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.service.criteria.AuditLogCriteria;
import tn.paiezone.rh.service.dto.AuditLogDTO;
import tn.paiezone.rh.service.mapper.AuditLogMapper;

/**
 * Service for executing complex queries for {@link AuditLog} entities in the database.
 * The main input is a {@link AuditLogCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link AuditLogDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class AuditLogQueryService extends QueryService<AuditLog> {

    private static final Logger LOG = LoggerFactory.getLogger(AuditLogQueryService.class);

    private final AuditLogRepository auditLogRepository;

    private final AuditLogMapper auditLogMapper;

    private final TenantContextService tenantContextService;

    public AuditLogQueryService(
        AuditLogRepository auditLogRepository,
        AuditLogMapper auditLogMapper,
        TenantContextService tenantContextService
    ) {
        this.auditLogRepository = auditLogRepository;
        this.auditLogMapper = auditLogMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<AuditLogDTO> findByCriteria(AuditLogCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return auditLogRepository.findAll(tenantSpec(createSpecification(criteria)), page).map(auditLogMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(AuditLogCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return auditLogRepository.count(tenantSpec(createSpecification(criteria)));
    }

    private Specification<AuditLog> tenantSpec(Specification<AuditLog> spec) {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null || companyId < 0) return spec;
        return spec.and((root, query, cb) -> cb.equal(root.get("company").get("id"), companyId));
    }

    /**
     * Function to convert {@link AuditLogCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<AuditLog> createSpecification(AuditLogCriteria criteria) {
        Specification<AuditLog> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), AuditLog_.id),
                buildStringSpecification(criteria.getAction(), AuditLog_.action),
                buildStringSpecification(criteria.getEntityType(), AuditLog_.entityType),
                buildRangeSpecification(criteria.getEntityId(), AuditLog_.entityId),
                buildStringSpecification(criteria.getIpAddress(), AuditLog_.ipAddress),
                buildStringSpecification(criteria.getUserAgent(), AuditLog_.userAgent),
                buildRangeSpecification(criteria.getOccurredAt(), AuditLog_.occurredAt),
                buildSpecification(criteria.getUserId(), root -> root.join(AuditLog_.user, JoinType.LEFT).get(UserProfile_.id)),
                buildSpecification(criteria.getCompanyId(), root -> root.join(AuditLog_.company, JoinType.LEFT).get(Company_.id))
            );
        }
        return specification;
    }
}
