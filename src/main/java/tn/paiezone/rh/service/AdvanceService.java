package tn.paiezone.rh.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.paiezone.rh.service.dto.AdvanceDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.Advance}.
 */
public interface AdvanceService {
    /**
     * Save a advance.
     */
    AdvanceDTO save(AdvanceDTO advanceDTO);

    /**
     * Updates a advance.
     */
    AdvanceDTO update(AdvanceDTO advanceDTO);

    /**
     * Partially updates a advance.
     */
    Optional<AdvanceDTO> partialUpdate(AdvanceDTO advanceDTO);

    /**
     * Get the "id" advance.
     */
    Optional<AdvanceDTO> findOne(Long id);

    /**
     * Delete the "id" advance.
     */
    void delete(Long id);

    // ─── AJOUTER LES MÉTHODES CI-DESSOUS POUR VOTRE PFE ───

    /**
     * Soumission d'une demande d'avance par l'employé.
     */
    AdvanceDTO requestAdvance(AdvanceDTO dto);

    /**
     * Approbation par le RH.
     */
    AdvanceDTO approveAdvance(Long id, String approvedBy);

    /**
     * Rejet par le RH.
     */
    AdvanceDTO rejectAdvance(Long id, String reason);

    /**
     * Marquer une avance comme déduite après calcul du bulletin.
     */
    void markAsDeducted(Long employeeId, int month, int year, Long paySlipId);
}
