package tn.paiezone.rh.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.RegulatoryParam;

/**
 * Spring Data JPA repository for the RegulatoryParam entity.
 */
@SuppressWarnings("unused")
@Repository
public interface RegulatoryParamRepository extends JpaRepository<RegulatoryParam, Long> {
    /**
     * MÉTHODE PRINCIPALE — utilisée par TunisianTaxService à chaque calcul.
     *
     * Trouve le paramètre actif le plus récent pour une clé donnée,
     * dont la date d'effet est <= à la date de paie.
     *
     * Exemple : On calcule la paie de janvier 2026.
     * - Il existe un paramètre CNSS_TAUX_SALARIAL avec effective_from = 2026-01-01 → retourné
     * - Si le Super Admin a déjà créé un paramètre effective_from = 2027-01-01 → ignoré
     *
     * Le "ORDER BY effective_from DESC LIMIT 1" garantit de prendre
     * toujours la version la plus récente applicable.
     */
    @Query(
        "SELECT p FROM RegulatoryParam p " +
            "WHERE p.paramKey = :key " +
            "AND p.effectiveFrom <= :date " +
            "AND p.active = true " +
            "ORDER BY p.effectiveFrom DESC LIMIT 1"
    )
    Optional<RegulatoryParam> findActiveByKeyAndDate(@Param("key") String key, @Param("date") LocalDate date);

    /** Pour l'écran Super Admin — liste tous les paramètres actifs */
    List<RegulatoryParam> findByActiveTrueOrderByParamKeyAsc();

    /** Pour afficher l'historique des modifications d'un paramètre */
    List<RegulatoryParam> findByParamKeyOrderByEffectiveFromDesc(String paramKey);
}
