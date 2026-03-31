package tn.paiezone.rh.service;

import java.util.Optional;
import tn.paiezone.rh.service.dto.AdvanceDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.Advance}.
 */
public interface AdvanceService {
    /**
     * Save a advance.
     *
     * @param advanceDTO the entity to save.
     * @return the persisted entity.
     */
    AdvanceDTO save(AdvanceDTO advanceDTO);

    /**
     * Updates a advance.
     *
     * @param advanceDTO the entity to update.
     * @return the persisted entity.
     */
    AdvanceDTO update(AdvanceDTO advanceDTO);

    /**
     * Partially updates a advance.
     *
     * @param advanceDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<AdvanceDTO> partialUpdate(AdvanceDTO advanceDTO);

    /**
     * Get the "id" advance.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<AdvanceDTO> findOne(Long id);

    /**
     * Delete the "id" advance.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
