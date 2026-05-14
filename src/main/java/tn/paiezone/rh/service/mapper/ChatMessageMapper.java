package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.ChatMessage;
import tn.paiezone.rh.domain.ChatSession;
import tn.paiezone.rh.service.dto.ChatMessageDTO;

/**
 * Mapper pour l'entité {@link ChatMessage} et son DTO {@link ChatMessageDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ChatMessageMapper extends EntityMapper<ChatMessageDTO, ChatMessage> {
    @Mapping(target = "sessionId", source = "session.id")
    ChatMessageDTO toDto(ChatMessage s);

    @Mapping(target = "session", source = "sessionId", qualifiedByName = "chatSessionFromId")
    ChatMessage toEntity(ChatMessageDTO dto);

    @Named("chatSessionFromId")
    default ChatSession chatSessionFromId(Long id) {
        if (id == null) return null;
        ChatSession session = new ChatSession();
        session.setId(id);
        return session;
    }
}
