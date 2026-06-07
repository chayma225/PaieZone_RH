package tn.paiezone.rh.repository;

import java.util.List;
import java.util.Optional;
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
    boolean existsByMatriculeAndCompanyId(String matricule, Long companyId);
    boolean existsByNationalId(String nationalId);
    boolean existsByProfessionalEmail(String professionalEmail);
    long countByCompanyId(Long companyId);
    long countByCompanyIdAndActiveTrue(Long companyId);
    long countByDepartmentId(Long departmentId);
    long countByPositionId(Long positionId);
    List<Employee> findByCompanyIdAndActiveTrue(Long companyId);
    List<Employee> findByActiveTrue();
    long countByActiveTrue();
    Optional<Employee> findByUserProfile_JhiUserId(String jhiUserId);
}
