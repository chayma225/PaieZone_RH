package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.RegulatoryParam;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RegulatoryParamRepository extends JpaRepository<RegulatoryParam, Long> {

    /**
     * Paramètre actif à une date donnée.
     * Prend le plus récent dont effectiveFrom <= date ET (effectiveTo IS NULL ou effectiveTo >= date)
     */
    @Query("SELECT p FROM RegulatoryParam p " +
        "WHERE p.paramKey = :key " +
        "AND p.effectiveFrom <= :date " +
        "AND (p.effectiveTo IS NULL OR p.effectiveTo >= :date) " +
        "AND p.active = true " +
        "ORDER BY p.effectiveFrom DESC LIMIT 1")
    Optional<RegulatoryParam> findActiveByKeyAndDate(
        @Param("key") String key,
        @Param("date") LocalDate date
    );

    @Query("SELECT p FROM RegulatoryParam p WHERE p.active = true ORDER BY p.paramKey ASC")
    List<RegulatoryParam> findAllActive();

    List<RegulatoryParam> findAllByOrderByParamKeyAscEffectiveFromDesc();

    List<RegulatoryParam> findByParamKeyOrderByEffectiveFromDesc(String paramKey);

    @Modifying
    @Query("UPDATE RegulatoryParam p SET p.active = false, p.effectiveTo = :endDate " +
        "WHERE p.paramKey = :key AND p.active = true AND p.effectiveTo IS NULL")
    int deactivateByKey(@Param("key") String key, @Param("endDate") LocalDate endDate);
    @Query("select distinct rp.category from RegulatoryParam rp")
    List<String> findAllCategories();

    List<RegulatoryParam> findByCategoryAndActiveTrueOrderByParamLabelAsc(String category);
}
