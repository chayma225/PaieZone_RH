package tn.paiezone.rh.service;

import java.util.Optional;
import tn.paiezone.rh.service.dto.PaySlipDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.PaySlip}.
 */
public interface PaySlipService {
    /**
     * Save a paySlip.
     *
     * @param paySlipDTO the entity to save.
     * @return the persisted entity.
     */
    PaySlipDTO save(PaySlipDTO paySlipDTO);

    /**
     * Updates a paySlip.
     *
     * @param paySlipDTO the entity to update.
     * @return the persisted entity.
     */
    PaySlipDTO update(PaySlipDTO paySlipDTO);

    /**
     * Partially updates a paySlip.
     *
     * @param paySlipDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PaySlipDTO> partialUpdate(PaySlipDTO paySlipDTO);

    /**
     * Get the "id" paySlip.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PaySlipDTO> findOne(Long id);

    /**
     * Delete the "id" paySlip.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
