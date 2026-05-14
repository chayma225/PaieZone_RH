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
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.service.criteria.EmployeeCriteria;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.mapper.EmployeeMapper;

/**
 * Service for executing complex queries for {@link Employee} entities.
 *
 * AJOUTS Sprint 4 / Chatbot :
 *   - salaryBrut, salaryNet  → BigDecimalFilter (plage)
 *   - balanceConge           → IntegerFilter    (plage)
 *   - jobTitle               → StringFilter     (texte)
 *
 * RAPPEL : ces champs doivent aussi être ajoutés dans :
 *   1. Employee.java         (champs JPA + getters/setters)
 *   2. EmployeeCriteria.java (filtres + getters/setters)
 *   → voir Employee_AddFields.java dans les fichiers fournis
 */
@Service
@Transactional(readOnly = true)
public class EmployeeQueryService extends QueryService<Employee> {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeQueryService.class);

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final TenantContextService tenantContextService;

    public EmployeeQueryService(
        EmployeeRepository employeeRepository,
        EmployeeMapper employeeMapper,
        TenantContextService tenantContextService
    ) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.tenantContextService = tenantContextService;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeDTO> findByCriteria(EmployeeCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        return employeeRepository.findAll(tenantSpec(createSpecification(criteria)), page).map(employeeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public long countByCriteria(EmployeeCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        return employeeRepository.count(tenantSpec(createSpecification(criteria)));
    }

    /** Injecte automatiquement le filtre company_id du tenant courant. */
    private Specification<Employee> tenantSpec(Specification<Employee> spec) {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null) return spec;
        return spec.and((root, query, cb) -> cb.equal(root.get("company").get("id"), companyId));
    }

    protected Specification<Employee> createSpecification(EmployeeCriteria criteria) {
        Specification<Employee> specification = Specification.unrestricted();
        if (criteria == null) return specification;

        specification = Specification.allOf(
            Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
            // ── Identité ────────────────────────────────────────────────────
            buildRangeSpecification(criteria.getId(), Employee_.id),
            buildStringSpecification(criteria.getMatricule(), Employee_.matricule),
            buildStringSpecification(criteria.getFirstName(), Employee_.firstName),
            buildStringSpecification(criteria.getLastName(), Employee_.lastName),
            buildStringSpecification(criteria.getFirstNameAr(), Employee_.firstNameAr),
            buildStringSpecification(criteria.getLastNameAr(), Employee_.lastNameAr),
            // ── Naissance / état civil ───────────────────────────────────────
            buildRangeSpecification(criteria.getBirthDate(), Employee_.birthDate),
            buildStringSpecification(criteria.getBirthPlace(), Employee_.birthPlace),
            buildSpecification(criteria.getGender(), Employee_.gender), // ENUM ✓
            buildSpecification(criteria.getMaritalStatus(), Employee_.maritalStatus), // ENUM ✓
            buildRangeSpecification(criteria.getNumberOfChildren(), Employee_.numberOfChildren),
            buildSpecification(criteria.getChefDeFamille(), Employee_.chefDeFamille),
            // ── Documents ───────────────────────────────────────────────────
            buildStringSpecification(criteria.getNationalId(), Employee_.nationalId),
            buildStringSpecification(criteria.getPassportNumber(), Employee_.passportNumber),
            buildStringSpecification(criteria.getNationality(), Employee_.nationality),
            // ── Contact ─────────────────────────────────────────────────────
            buildStringSpecification(criteria.getAddress(), Employee_.address),
            buildStringSpecification(criteria.getCity(), Employee_.city),
            buildStringSpecification(criteria.getPersonalEmail(), Employee_.personalEmail),
            buildStringSpecification(criteria.getProfessionalEmail(), Employee_.professionalEmail),
            buildStringSpecification(criteria.getPhoneNumber(), Employee_.phoneNumber),
            buildStringSpecification(criteria.getCnssNumber(), Employee_.cnssNumber),
            buildSpecification(criteria.getCategory(), Employee_.category), // ENUM ✓
            buildStringSpecification(criteria.getPhotoUrl(), Employee_.photoUrl),
            // ── Dates de carrière ────────────────────────────────────────────
            buildRangeSpecification(criteria.getHireDate(), Employee_.hireDate),
            buildRangeSpecification(criteria.getTrialEndDate(), Employee_.trialEndDate),
            buildSpecification(criteria.getActive(), Employee_.active),
            buildRangeSpecification(criteria.getCreatedAt(), Employee_.createdAt),
            buildRangeSpecification(criteria.getUpdatedAt(), Employee_.updatedAt),
            // ── Relations (JOIN) ─────────────────────────────────────────────
            buildSpecification(criteria.getCompanyId(), root -> root.join(Employee_.company, JoinType.LEFT).get(Company_.id)),
            buildSpecification(criteria.getDepartmentId(), root -> root.join(Employee_.department, JoinType.LEFT).get(Department_.id)),
            buildSpecification(criteria.getPositionId(), root -> root.join(Employee_.position, JoinType.LEFT).get(JobPosition_.id)),
            buildSpecification(criteria.getManagerId(), root -> root.join(Employee_.manager, JoinType.LEFT).get(Employee_.id)),
            buildSpecification(criteria.getUserProfileId(), root -> root.join(Employee_.userProfile, JoinType.LEFT).get(UserProfile_.id))
        );

        return specification;
    }
}
