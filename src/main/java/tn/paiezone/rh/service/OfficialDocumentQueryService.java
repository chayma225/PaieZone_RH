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
import tn.paiezone.rh.domain.OfficialDocument;
import tn.paiezone.rh.repository.OfficialDocumentRepository;
import tn.paiezone.rh.service.criteria.OfficialDocumentCriteria;
import tn.paiezone.rh.service.dto.OfficialDocumentDTO;
import tn.paiezone.rh.service.mapper.OfficialDocumentMapper;

/**
 * Service for executing complex queries for {@link OfficialDocument} entities in the database.
 * The main input is a {@link OfficialDocumentCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link OfficialDocumentDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class OfficialDocumentQueryService extends QueryService<OfficialDocument> {

    private static final Logger LOG = LoggerFactory.getLogger(OfficialDocumentQueryService.class);

    private final OfficialDocumentRepository officialDocumentRepository;

    private final OfficialDocumentMapper officialDocumentMapper;

    private final TenantContextService tenantContextService;

    public OfficialDocumentQueryService(
        OfficialDocumentRepository officialDocumentRepository,
        OfficialDocumentMapper officialDocumentMapper,
        TenantContextService tenantContextService
    ) {
        this.officialDocumentRepository = officialDocumentRepository;
        this.officialDocumentMapper = officialDocumentMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<OfficialDocumentDTO> findByCriteria(OfficialDocumentCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return officialDocumentRepository.findAll(tenantSpec(createSpecification(criteria)), page).map(officialDocumentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(OfficialDocumentCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return officialDocumentRepository.count(tenantSpec(createSpecification(criteria)));
    }

    private Specification<OfficialDocument> tenantSpec(Specification<OfficialDocument> spec) {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null) return spec;
        return spec.and((root, query, cb) -> cb.equal(root.get("company").get("id"), companyId));
    }

    /**
     * Function to convert {@link OfficialDocumentCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<OfficialDocument> createSpecification(OfficialDocumentCriteria criteria) {
        Specification<OfficialDocument> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), OfficialDocument_.id),
                buildSpecification(criteria.getDocType(), OfficialDocument_.docType),
                buildStringSpecification(criteria.getTitle(), OfficialDocument_.title),
                buildRangeSpecification(criteria.getMonth(), OfficialDocument_.month),
                buildRangeSpecification(criteria.getYear(), OfficialDocument_.year),
                buildRangeSpecification(criteria.getGeneratedAt(), OfficialDocument_.generatedAt),
                buildStringSpecification(criteria.getFileUrl(), OfficialDocument_.fileUrl),
                buildStringSpecification(criteria.getSignedBy(), OfficialDocument_.signedBy),
                buildRangeSpecification(criteria.getSentAt(), OfficialDocument_.sentAt),
                buildStringSpecification(criteria.getNotes(), OfficialDocument_.notes),
                buildSpecification(criteria.getCompanyId(), root -> root.join(OfficialDocument_.company, JoinType.LEFT).get(Company_.id)),
                buildSpecification(criteria.getEmployeeId(), root ->
                    root.join(OfficialDocument_.employee, JoinType.LEFT).get(Employee_.id)
                ),
                buildSpecification(criteria.getGeneratedById(), root ->
                    root.join(OfficialDocument_.generatedBy, JoinType.LEFT).get(UserProfile_.id)
                )
            );
        }
        return specification;
    }
}
