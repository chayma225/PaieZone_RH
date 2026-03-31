package tn.paiezone.rh.service;

import java.util.List;
import java.util.Optional;
import tn.paiezone.rh.service.dto.ChatSessionDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.ChatSession}.
 */
public interface ChatSessionService {
    /**
     * Save a chatSession.
     *
     * @param chatSessionDTO the entity to save.
     * @return the persisted entity.
     */
    ChatSessionDTO save(ChatSessionDTO chatSessionDTO);

    /**
     * Updates a chatSession.
     *
     * @param chatSessionDTO the entity to update.
     * @return the persisted entity.
     */
    ChatSessionDTO update(ChatSessionDTO chatSessionDTO);

    /**
     * Partially updates a chatSession.
     *
     * @param chatSessionDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ChatSessionDTO> partialUpdate(ChatSessionDTO chatSessionDTO);

    /**
     * Get all the chatSessions.
     *
     * @return the list of entities.
     */
    List<ChatSessionDTO> findAll();

    /**
     * Get the "id" chatSession.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ChatSessionDTO> findOne(Long id);

    /**
     * Delete the "id" chatSession.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
