package tn.paiezone.rh.service;

import java.util.Optional;
import tn.paiezone.rh.service.dto.LeaveRequestDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.LeaveRequest}.
 */
public interface LeaveRequestService {
    /**
     * Save a leaveRequest.
     *
     * @param leaveRequestDTO the entity to save.
     * @return the persisted entity.
     */
    LeaveRequestDTO save(LeaveRequestDTO leaveRequestDTO);

    /**
     * Updates a leaveRequest.
     *
     * @param leaveRequestDTO the entity to update.
     * @return the persisted entity.
     */
    LeaveRequestDTO update(LeaveRequestDTO leaveRequestDTO);

    /**
     * Partially updates a leaveRequest.
     *
     * @param leaveRequestDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<LeaveRequestDTO> partialUpdate(LeaveRequestDTO leaveRequestDTO);

    /**
     * Get the "id" leaveRequest.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<LeaveRequestDTO> findOne(Long id);

    /**
     * Delete the "id" leaveRequest.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
