package tn.paiezone.rh.service;

import java.util.Optional;
import tn.paiezone.rh.service.dto.ContractDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.Contract}.
 */
public interface ContractService {
    /**
     * Save a contract.
     *
     * @param contractDTO the entity to save.
     * @return the persisted entity.
     */
    ContractDTO save(ContractDTO contractDTO);

    /**
     * Updates a contract.
     *
     * @param contractDTO the entity to update.
     * @return the persisted entity.
     */
    ContractDTO update(ContractDTO contractDTO);

    /**
     * Partially updates a contract.
     *
     * @param contractDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ContractDTO> partialUpdate(ContractDTO contractDTO);

    /**
     * Get the "id" contract.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ContractDTO> findOne(Long id);

    /**
     * Delete the "id" contract.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
