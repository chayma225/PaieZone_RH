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
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.service.criteria.EmployeeCriteria;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.mapper.EmployeeMapper;

/**
 * Service for executing complex queries for {@link Employee} entities in the database.
 * The main input is a {@link EmployeeCriteria} which gets converted to {@link Specification},
 * in a way that all the filters must apply.
 * It returns a {@link Page} of {@link EmployeeDTO} which fulfills the criteria.
 */
@Service
@Transactional(readOnly = true)
public class EmployeeQueryService extends QueryService<Employee> {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeQueryService.class);

    private final EmployeeRepository employeeRepository;

    private final EmployeeMapper employeeMapper;

    public EmployeeQueryService(EmployeeRepository employeeRepository, EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
    }

    /**
     * Return a {@link Page} of {@link EmployeeDTO} which matches the criteria from the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<EmployeeDTO> findByCriteria(EmployeeCriteria criteria, Pageable page) {
        LOG.debug("find by criteria : {}, page: {}", criteria, page);
        final Specification<Employee> specification = createSpecification(criteria);
        return employeeRepository.findAll(specification, page).map(employeeMapper::toDto);
    }

    /**
     * Return the number of matching entities in the database.
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the number of matching entities.
     */
    @Transactional(readOnly = true)
    public long countByCriteria(EmployeeCriteria criteria) {
        LOG.debug("count by criteria : {}", criteria);
        final Specification<Employee> specification = createSpecification(criteria);
        return employeeRepository.count(specification);
    }

    /**
     * Function to convert {@link EmployeeCriteria} to a {@link Specification}
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching {@link Specification} of the entity.
     */
    protected Specification<Employee> createSpecification(EmployeeCriteria criteria) {
        Specification<Employee> specification = Specification.unrestricted();
        if (criteria != null) {
            // This has to be called first, because the distinct method returns null
            specification = Specification.allOf(
                Boolean.TRUE.equals(criteria.getDistinct()) ? distinct(criteria.getDistinct()) : Specification.unrestricted(),
                buildRangeSpecification(criteria.getId(), Employee_.id),
                buildStringSpecification(criteria.getMatricule(), Employee_.matricule),
                buildStringSpecification(criteria.getFirstName(), Employee_.firstName),
                buildStringSpecification(criteria.getLastName(), Employee_.lastName),
                buildStringSpecification(criteria.getFirstNameAr(), Employee_.firstNameAr),
                buildStringSpecification(criteria.getLastNameAr(), Employee_.lastNameAr),
                buildRangeSpecification(criteria.getBirthDate(), Employee_.birthDate),
                buildStringSpecification(criteria.getBirthPlace(), Employee_.birthPlace),
                buildSpecification(criteria.getGender(), Employee_.gender),
                buildSpecification(criteria.getMaritalStatus(), Employee_.maritalStatus),
                buildRangeSpecification(criteria.getNumberOfChildren(), Employee_.numberOfChildren),
                buildSpecification(criteria.getChefDeFamille(), Employee_.chefDeFamille),
                buildStringSpecification(criteria.getNationalId(), Employee_.nationalId),
                buildStringSpecification(criteria.getPassportNumber(), Employee_.passportNumber),
                buildStringSpecification(criteria.getNationality(), Employee_.nationality),
                buildStringSpecification(criteria.getAddress(), Employee_.address),
                buildStringSpecification(criteria.getCity(), Employee_.city),
                buildStringSpecification(criteria.getPersonalEmail(), Employee_.personalEmail),
                buildStringSpecification(criteria.getProfessionalEmail(), Employee_.professionalEmail),
                buildStringSpecification(criteria.getPhoneNumber(), Employee_.phoneNumber),
                buildStringSpecification(criteria.getCnssNumber(), Employee_.cnssNumber),
                buildSpecification(criteria.getCategory(), Employee_.category),
                buildStringSpecification(criteria.getPhotoUrl(), Employee_.photoUrl),
                buildRangeSpecification(criteria.getHireDate(), Employee_.hireDate),
                buildRangeSpecification(criteria.getTrialEndDate(), Employee_.trialEndDate),
                buildSpecification(criteria.getActive(), Employee_.active),
                buildRangeSpecification(criteria.getCreatedAt(), Employee_.createdAt),
                buildRangeSpecification(criteria.getUpdatedAt(), Employee_.updatedAt),
                buildSpecification(criteria.getCompanyId(), root -> root.join(Employee_.company, JoinType.LEFT).get(Company_.id)),
                buildSpecification(criteria.getDepartmentId(), root -> root.join(Employee_.department, JoinType.LEFT).get(Department_.id)),
                buildSpecification(criteria.getPositionId(), root -> root.join(Employee_.position, JoinType.LEFT).get(JobPosition_.id)),
                buildSpecification(criteria.getManagerId(), root -> root.join(Employee_.manager, JoinType.LEFT).get(Employee_.id)),
                buildSpecification(criteria.getUserProfileId(), root ->
                    root.join(Employee_.userProfile, JoinType.LEFT).get(UserProfile_.id)
                )
            );
        }
        return specification;
    }
}
