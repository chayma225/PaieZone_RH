package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Employee;

/**
 * Spring Data JPA repository for the Employee entity.
 */
@SuppressWarnings("unused")
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    boolean existsByMatricule(String matricule);
    boolean existsByNationalId(String nationalId);
    boolean existsByProfessionalEmail(String professionalEmail);
    long countByCompanyIdAndActiveTrue(Long companyId);
    long countByDepartmentId(Long departmentId);
    long countByPositionId(Long positionId);
}
