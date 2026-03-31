package tn.paiezone.rh.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.AccountingEntry}.
 */
public interface AccountingEntryService {
    /**
     * Save a accountingEntry.
     *
     * @param accountingEntryDTO the entity to save.
     * @return the persisted entity.
     */
    AccountingEntryDTO save(AccountingEntryDTO accountingEntryDTO);

    /**
     * Updates a accountingEntry.
     *
     * @param accountingEntryDTO the entity to update.
     * @return the persisted entity.
     */
    AccountingEntryDTO update(AccountingEntryDTO accountingEntryDTO);

    /**
     * Partially updates a accountingEntry.
     *
     * @param accountingEntryDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<AccountingEntryDTO> partialUpdate(AccountingEntryDTO accountingEntryDTO);

    /**
     * Get all the accountingEntries.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<AccountingEntryDTO> findAll(Pageable pageable);

    /**
     * Get the "id" accountingEntry.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<AccountingEntryDTO> findOne(Long id);

    /**
     * Delete the "id" accountingEntry.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
