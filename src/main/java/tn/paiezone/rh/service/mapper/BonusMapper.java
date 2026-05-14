package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Bonus;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.service.dto.BonusDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface BonusMapper extends EntityMapper<BonusDTO, Bonus> {
    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "paySlip.id", target = "paySlipId")
    BonusDTO toDto(Bonus s);

    @Mapping(source = "employeeId", target = "employee", qualifiedByName = "employeeFromId")
    @Mapping(source = "paySlipId", target = "paySlip", qualifiedByName = "paySlipFromId")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    Bonus toEntity(BonusDTO dto);

    @Mapping(source = "employeeId", target = "employee", qualifiedByName = "employeeFromId")
    @Mapping(source = "paySlipId", target = "paySlip", qualifiedByName = "paySlipFromId")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void partialUpdate(@MappingTarget Bonus entity, BonusDTO dto);

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
