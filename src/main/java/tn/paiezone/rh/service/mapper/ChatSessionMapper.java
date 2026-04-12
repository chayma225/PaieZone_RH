package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.ChatSession;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.service.dto.ChatSessionDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;

/**
 * Mapper for the entity {@link ChatSession} and its DTO {@link ChatSessionDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChatSessionMapper extends EntityMapper<ChatSessionDTO, ChatSession> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    ChatSessionDTO toDto(ChatSession s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);
}
