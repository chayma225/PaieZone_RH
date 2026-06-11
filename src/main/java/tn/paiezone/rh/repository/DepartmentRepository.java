package tn.paiezone.rh.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Department;

/**
 * Spring Data JPA repository for the Department entity.
 */
@SuppressWarnings("unused")
@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    boolean existsByCodeAndCompanyId(String code, Long companyId);
    boolean existsByIdAndActiveFalse(Long id);
    long countByCompanyId(Long companyId);
    List<Department> findByCompanyId(Long companyId);
    Optional<Department> findByNameIgnoreCaseAndCompanyId(String name, Long companyId);
}
