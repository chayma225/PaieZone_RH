package tn.paiezone.rh.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.paiezone.rh.service.dto.PaySlipDTO;

import java.util.Optional;

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
     * Get all the paySlips.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<PaySlipDTO> findAll(Pageable pageable);

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

    /**
     * Recalcule un bulletin de paie existant (Phase 1)
     */
    PaySlipDTO recalculate(Long paySlipId);

    /**
     * Calcule le bulletin d'un employé pour une période donnée
     */
    PaySlipDTO calculateOne(Long periodId, Long employeeId);
}
