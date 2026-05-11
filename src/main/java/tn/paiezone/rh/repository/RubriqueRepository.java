package tn.paiezone.rh.repository;

import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.domain.enumeration.RubriqueType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RubriqueRepository extends JpaRepository<Rubrique, Long> {

        // Toutes les rubriques actives d'une entreprise, triées pour l'affichage
        List<Rubrique> findByCompanyIdAndActiveTrueOrderBySortOrderAsc(Long companyId);

        // Vérifier l'unicité du code rubrique dans une entreprise
        boolean existsByCodeAndCompanyId(String code, Long companyId);

        // Pour la liste filtrée (UI : GAIN ou DEDUCTION)
        List<Rubrique> findByCompanyIdAndRubriqueTypeAndActiveTrue(
            Long companyId, RubriqueType type);

}
