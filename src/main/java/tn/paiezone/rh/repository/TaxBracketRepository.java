package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.TaxBracket;

/**
 * Spring Data JPA repository for the TaxBracket entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TaxBracketRepository extends JpaRepository<TaxBracket, Long> {}
