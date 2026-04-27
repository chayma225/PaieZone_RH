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
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeFullDetails")
    EmployeeHistoryDTO toDto(EmployeeHistory s);

    @Named("employeeFullDetails")
    @BeanMapping(ignoreByDefault = false) // On n'ignore plus rien
    @Mapping(target = "id", source = "id")
    @Mapping(target = "firstName", source = "firstName")
    @Mapping(target = "lastName", source = "lastName")
    @Mapping(target = "matricule", source = "matricule")
    @Mapping(target = "department", source = "department") // Pour les badges dans le tableau
    @Mapping(target = "position", source = "position") // Pour les badges dans le tableau
    EmployeeDTO toDtoEmployeeFull(Employee employee);
}
