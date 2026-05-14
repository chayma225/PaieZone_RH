package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.LeaveBalance;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.LeaveBalanceDTO;
import tn.paiezone.rh.service.dto.LeaveTypeDTO;

/**
 * Mapper for the entity {@link LeaveBalance} and its DTO {@link LeaveBalanceDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LeaveBalanceMapper extends EntityMapper<LeaveBalanceDTO, LeaveBalance> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "leaveType", source = "leaveType", qualifiedByName = "leaveTypeId")
    LeaveBalanceDTO toDto(LeaveBalance s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("leaveTypeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    LeaveTypeDTO toDtoLeaveTypeId(LeaveType leaveType);
}
