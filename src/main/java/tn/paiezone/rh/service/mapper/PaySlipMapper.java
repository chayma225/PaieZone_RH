package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;

/**
 * Mapper for the entity {@link PaySlip} and its DTO {@link PaySlipDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaySlipMapper extends EntityMapper<PaySlipDTO, PaySlip> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "payrollPeriod", source = "payrollPeriod", qualifiedByName = "payrollPeriodId")
    @Mapping(target = "contract", source = "contract", qualifiedByName = "contractId")
    PaySlipDTO toDto(PaySlip s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("payrollPeriodId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PayrollPeriodDTO toDtoPayrollPeriodId(PayrollPeriod payrollPeriod);

    @Named("contractId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    ContractDTO toDtoContractId(Contract contract);
}
