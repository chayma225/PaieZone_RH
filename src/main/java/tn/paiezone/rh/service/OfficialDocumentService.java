package tn.paiezone.rh.service;

import java.util.Optional;
import tn.paiezone.rh.service.dto.OfficialDocumentDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.OfficialDocument}.
 */
public interface OfficialDocumentService {
    /**
     * Save a officialDocument.
     *
     * @param officialDocumentDTO the entity to save.
     * @return the persisted entity.
     */
    OfficialDocumentDTO save(OfficialDocumentDTO officialDocumentDTO);

    /**
     * Updates a officialDocument.
     *
     * @param officialDocumentDTO the entity to update.
     * @return the persisted entity.
     */
    OfficialDocumentDTO update(OfficialDocumentDTO officialDocumentDTO);

    /**
     * Partially updates a officialDocument.
     *
     * @param officialDocumentDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<OfficialDocumentDTO> partialUpdate(OfficialDocumentDTO officialDocumentDTO);

    /**
     * Get the "id" officialDocument.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<OfficialDocumentDTO> findOne(Long id);

    /**
     * Delete the "id" officialDocument.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
