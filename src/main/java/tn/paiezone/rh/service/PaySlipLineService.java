package tn.paiezone.rh.service;

import java.util.List;
import java.util.Optional;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.PaySlipLine}.
 */
public interface PaySlipLineService {
    /**
     * Save a paySlipLine.
     *
     * @param paySlipLineDTO the entity to save.
     * @return the persisted entity.
     */
    PaySlipLineDTO save(PaySlipLineDTO paySlipLineDTO);

    /**
     * Updates a paySlipLine.
     *
     * @param paySlipLineDTO the entity to update.
     * @return the persisted entity.
     */
    PaySlipLineDTO update(PaySlipLineDTO paySlipLineDTO);

    /**
     * Partially updates a paySlipLine.
     *
     * @param paySlipLineDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<PaySlipLineDTO> partialUpdate(PaySlipLineDTO paySlipLineDTO);

    /**
     * Get all the paySlipLines.
     *
     * @return the list of entities.
     */
    List<PaySlipLineDTO> findAll();

    /**
     * Get the "id" paySlipLine.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<PaySlipLineDTO> findOne(Long id);

    /**
     * Delete the "id" paySlipLine.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
