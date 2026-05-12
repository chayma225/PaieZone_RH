package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.ChatSession;
import tn.paiezone.rh.service.dto.ChatSessionDTO;

/**
 * Mapper for the entity {@link ChatSession} and its DTO {@link ChatSessionDTO}.
 */
@Mapper(componentModel = "spring", uses = { ChatMessageMapper.class })
public interface ChatSessionMapper extends EntityMapper<ChatSessionDTO, ChatSession> {
    ChatSessionDTO toDto(ChatSession s);

    @Mapping(target = "company", ignore = true)
    ChatSession toEntity(ChatSessionDTO dto);
}
