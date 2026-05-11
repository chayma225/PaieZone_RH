package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.CnssRate;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the CnssRate entity.
 */
@SuppressWarnings("unused")
@Repository
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_RH_COMPTABLE')")
public interface CnssRateRepository extends JpaRepository<CnssRate, Long> {
    // Un seul taux par année (contrainte UNIQUE sur year)
    Optional<CnssRate> findByYear(int year);

    List<CnssRate> findAllByOrderByYearDesc();
}
