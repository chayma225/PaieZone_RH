package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.ChatMessage;
import tn.paiezone.rh.domain.ChatSession;
import tn.paiezone.rh.service.dto.ChatMessageDTO;
import tn.paiezone.rh.service.dto.ChatSessionDTO;

/**
 * Mapper for the entity {@link ChatMessage} and its DTO {@link ChatMessageDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChatMessageMapper extends EntityMapper<ChatMessageDTO, ChatMessage> {
    @Mapping(target = "session", source = "session", qualifiedByName = "chatSessionId")
    ChatMessageDTO toDto(ChatMessage s);

    @Named("chatSessionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ChatSessionDTO toDtoChatSessionId(ChatSession chatSession);
}
