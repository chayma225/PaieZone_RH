package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.JobPosition;

/**
 * Spring Data JPA repository for the JobPosition entity.
 */
@SuppressWarnings("unused")
@Repository
public interface JobPositionRepository extends JpaRepository<JobPosition, Long> {
    List<JobPosition> findByCompanyId(Long companyId);
}
