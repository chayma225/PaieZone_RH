package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.ChatMessage;
import tn.paiezone.rh.service.dto.ChatMessageDTO;

/**
 * Mapper pour l'entité {@link ChatMessage} et son DTO {@link ChatMessageDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChatMessageMapper extends EntityMapper<ChatMessageDTO, ChatMessage> {
    @Mapping(target = "sessionId", source = "session.id")
    ChatMessageDTO toDto(ChatMessage s);

    @Mapping(target = "session", ignore = true)
    ChatMessage toEntity(ChatMessageDTO dto);
}
