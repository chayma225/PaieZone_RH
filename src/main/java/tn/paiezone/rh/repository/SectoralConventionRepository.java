package tn.paiezone.rh.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.SectoralConvention;

@Repository
public interface SectoralConventionRepository extends JpaRepository<SectoralConvention, Long> {
    List<SectoralConvention> findBySector_IdOrderByYearDesc(Long sectorId);
    List<SectoralConvention> findByActiveTrueOrderBySector_LabelAscYearDesc();
    Optional<SectoralConvention> findBySector_IdAndYearAndActiveTrue(Long sectorId, int year);
}
