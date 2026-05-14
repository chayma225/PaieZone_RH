package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.ChatSession;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.service.dto.ChatSessionDTO;

/**
 * Mapper for the entity {@link ChatSession} and its DTO {@link ChatSessionDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ChatSessionMapper extends EntityMapper<ChatSessionDTO, ChatSession> {
    @Mapping(target = "employeeId", source = "employee.id")
    @Mapping(target = "messages", ignore = true)
    ChatSessionDTO toDto(ChatSession s);

    @Mapping(target = "company", ignore = true)
    @Mapping(target = "messages", ignore = true)
    @Mapping(target = "employee", source = "employeeId", qualifiedByName = "employeeFromId")
    ChatSession toEntity(ChatSessionDTO dto);

    @Named("employeeFromId")
    default Employee employeeFromId(Long id) {
        if (id == null) return null;
        Employee e = new Employee();
        e.setId(id);
        return e;
    }
}
