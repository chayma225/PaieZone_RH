package tn.paiezone.rh.service;

import java.util.List;
import java.util.Optional;
import tn.paiezone.rh.service.dto.LeaveBalanceDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.LeaveBalance}.
 */
public interface LeaveBalanceService {
    /**
     * Save a leaveBalance.
     *
     * @param leaveBalanceDTO the entity to save.
     * @return the persisted entity.
     */
    LeaveBalanceDTO save(LeaveBalanceDTO leaveBalanceDTO);

    /**
     * Updates a leaveBalance.
     *
     * @param leaveBalanceDTO the entity to update.
     * @return the persisted entity.
     */
    LeaveBalanceDTO update(LeaveBalanceDTO leaveBalanceDTO);

    /**
     * Partially updates a leaveBalance.
     *
     * @param leaveBalanceDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<LeaveBalanceDTO> partialUpdate(LeaveBalanceDTO leaveBalanceDTO);

    /**
     * Get all the leaveBalances.
     *
     * @return the list of entities.
     */
    List<LeaveBalanceDTO> findAll();

    /**
     * Get the "id" leaveBalance.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<LeaveBalanceDTO> findOne(Long id);

    /**
     * Delete the "id" leaveBalance.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
