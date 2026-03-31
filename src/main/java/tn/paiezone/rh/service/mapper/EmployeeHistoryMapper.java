package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.EmployeeHistory;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.EmployeeHistoryDTO;

/**
 * Mapper for the entity {@link EmployeeHistory} and its DTO {@link EmployeeHistoryDTO}.
 */
@Mapper(componentModel = "spring")
public interface EmployeeHistoryMapper extends EntityMapper<EmployeeHistoryDTO, EmployeeHistory> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    EmployeeHistoryDTO toDto(EmployeeHistory s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);
}
