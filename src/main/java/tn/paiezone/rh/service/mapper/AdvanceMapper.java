package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.service.dto.AdvanceDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdvanceMapper extends EntityMapper<AdvanceDTO, Advance> {
    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "paySlip.id", target = "paySlipId")
    AdvanceDTO toDto(Advance s);

    @Mapping(source = "employeeId", target = "employee", qualifiedByName = "employeeFromId")
    @Mapping(source = "paySlipId", target = "paySlip", qualifiedByName = "paySlipFromId")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    Advance toEntity(AdvanceDTO dto);

    @Mapping(source = "employeeId", target = "employee", qualifiedByName = "employeeFromId")
    @Mapping(source = "paySlipId", target = "paySlip", qualifiedByName = "paySlipFromId")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void partialUpdate(@MappingTarget Advance entity, AdvanceDTO dto);

    @Named("employeeFromId")
    default Employee employeeFromId(Long id) {
        if (id == null) return null;
        Employee e = new Employee();
        e.setId(id);
        return e;
    }

    @Named("paySlipFromId")
    default PaySlip paySlipFromId(Long id) {
        if (id == null) return null;
        PaySlip ps = new PaySlip();
        ps.setId(id);
        return ps;
    }
}
