package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Bonus;
import tn.paiezone.rh.service.dto.BonusDTO;

@Mapper(componentModel = "spring", uses = {
    EmployeeMapper.class,
    PaySlipMapper.class      // fournit employeeFromId et paySlipFromId
})
public interface BonusMapper extends EntityMapper<BonusDTO, Bonus> {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "paySlip.id",  target = "paySlipId")
    BonusDTO toDto(Bonus s);

    @Mapping(source = "employeeId", target = "employee")
    @Mapping(source = "paySlipId",  target = "paySlip")
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "createdDate",      ignore = true)
    @Mapping(target = "lastModifiedBy",   ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    Bonus toEntity(BonusDTO dto);

    @Mapping(source = "employeeId", target = "employee")
    @Mapping(source = "paySlipId",  target = "paySlip")
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "createdDate",      ignore = true)
    @Mapping(target = "lastModifiedBy",   ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void partialUpdate(@MappingTarget Bonus entity, BonusDTO dto);
    // Pas de helpers ici — EmployeeMapper et PaySlipMapper les fournissent
}
