package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.AccountingEntry;

/**
 * Spring Data JPA repository for the AccountingEntry entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AccountingEntryRepository extends JpaRepository<AccountingEntry, Long> {}
