package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.ActivitySector;

@Repository
public interface ActivitySectorRepository extends JpaRepository<ActivitySector, Long> {
    List<ActivitySector> findByActiveTrueOrderByLabelAsc();
}
