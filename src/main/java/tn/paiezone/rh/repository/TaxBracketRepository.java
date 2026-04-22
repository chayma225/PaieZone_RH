package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.TaxBracket;

/**
 * Spring Data JPA repository for the TaxBracket entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TaxBracketRepository extends JpaRepository<TaxBracket, Long> {
    /**
     * Récupère toutes les tranches IRPP d'une année donnée,
     * triées par ordre croissant (tranche 1 d'abord).
     *
     * L'ordre est critique : l'algorithme parcourt les tranches
     * de la plus basse à la plus haute.
     */
    List<TaxBracket> findByYearOrderBySortOrderAsc(int year);
}
