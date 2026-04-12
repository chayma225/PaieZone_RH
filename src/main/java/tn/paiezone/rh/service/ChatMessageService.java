package tn.paiezone.rh.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.paiezone.rh.service.dto.ChatMessageDTO;

/**
 * Service Interface for managing {@link tn.paiezone.rh.domain.ChatMessage}.
 */
public interface ChatMessageService {
    /**
     * Save a chatMessage.
     *
     * @param chatMessageDTO the entity to save.
     * @return the persisted entity.
     */
    ChatMessageDTO save(ChatMessageDTO chatMessageDTO);

    /**
     * Updates a chatMessage.
     *
     * @param chatMessageDTO the entity to update.
     * @return the persisted entity.
     */
    ChatMessageDTO update(ChatMessageDTO chatMessageDTO);

    /**
     * Partially updates a chatMessage.
     *
     * @param chatMessageDTO the entity to update partially.
     * @return the persisted entity.
     */
    Optional<ChatMessageDTO> partialUpdate(ChatMessageDTO chatMessageDTO);

    /**
     * Get all the chatMessages.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    Page<ChatMessageDTO> findAll(Pageable pageable);

    /**
     * Get the "id" chatMessage.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Optional<ChatMessageDTO> findOne(Long id);

    /**
     * Delete the "id" chatMessage.
     *
     * @param id the id of the entity.
     */
    void delete(Long id);
}
