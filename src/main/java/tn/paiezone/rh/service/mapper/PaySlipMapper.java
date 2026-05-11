package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.service.dto.PaySlipDTO;

@Mapper(componentModel = "spring", uses = {
    EmployeeMapper.class,
    PayrollPeriodMapper.class,
    ContractMapper.class
})
public interface PaySlipMapper extends EntityMapper<PaySlipDTO, PaySlip> {

    @Mapping(source = "employee.id",      target = "employeeId")
    @Mapping(source = "payrollPeriod.id", target = "payrollPeriodId")
    @Mapping(source = "contract.id",      target = "contractId")
        // Les nouveaux champs (cssAmount, tfpAmount, unpaidLeaveDeduction, overtimeAmount)
        // sont mappés automatiquement par MapStruct (même nom source/target)
    PaySlipDTO toDto(PaySlip s);

    @Mapping(source = "employeeId",      target = "employee")
    @Mapping(source = "payrollPeriodId", target = "payrollPeriod")
    @Mapping(source = "contractId",      target = "contract")
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "createdDate",      ignore = true)
    @Mapping(target = "lastModifiedBy",   ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    PaySlip toEntity(PaySlipDTO dto);

    @Mapping(source = "employeeId",      target = "employee")
    @Mapping(source = "payrollPeriodId", target = "payrollPeriod")
    @Mapping(source = "contractId",      target = "contract")
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "createdDate",      ignore = true)
    @Mapping(target = "lastModifiedBy",   ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void partialUpdate(@MappingTarget PaySlip entity, PaySlipDTO dto);

    default tn.paiezone.rh.domain.Employee employeeFromId(Long id) {
        if (id == null) return null;
        tn.paiezone.rh.domain.Employee e = new tn.paiezone.rh.domain.Employee();
        e.setId(id);
        return e;
    }

    default tn.paiezone.rh.domain.PayrollPeriod payrollPeriodFromId(Long id) {
        if (id == null) return null;
        tn.paiezone.rh.domain.PayrollPeriod p = new tn.paiezone.rh.domain.PayrollPeriod();
        p.setId(id);
        return p;
    }

    default tn.paiezone.rh.domain.Contract contractFromId(Long id) {
        if (id == null) return null;
        tn.paiezone.rh.domain.Contract c = new tn.paiezone.rh.domain.Contract();
        c.setId(id);
        return c;
    }

    default tn.paiezone.rh.domain.PaySlip paySlipFromId(Long id) {
        if (id == null) return null;
        tn.paiezone.rh.domain.PaySlip ps = new tn.paiezone.rh.domain.PaySlip();
        ps.setId(id);
        return ps;
    }
}
