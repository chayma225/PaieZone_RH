package tn.paiezone.rh.service;

import java.util.Optional;
import tn.paiezone.rh.service.dto.BonusDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.Bonus}.
 */
public interface BonusService {
    /**
     * Save a bonus.
     *
     * @param bonusDTO the entity to save.
     * @return the persisted entity.
     */
    BonusDTO save(BonusDTO bonusDTO);

    /**
     * Updates a bonus.
     *
     * @param bonusDTO the entity to update.
     * @return the persisted entity.
     */
    BonusDTO update(BonusDTO bonusDTO);

    /**
     * Partially updates a bonus.
     *
     * @param bonusDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<BonusDTO> partialUpdate(BonusDTO bonusDTO);

    /**
     * Get the "id" bonus.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<BonusDTO> findOne(Long id);

    /**
     * Delete the "id" bonus.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
