package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.TaxBracket;

import java.util.List;

/**
 * Spring Data JPA repository for the TaxBracket entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TaxBracketRepository extends JpaRepository<TaxBracket, Long> {

    List<TaxBracket> findByYearOrderBySortOrderAsc(int year);

    @Query("SELECT DISTINCT b.year FROM TaxBracket b ORDER BY b.year DESC")
    List<Integer> findDistinctYears();
}
