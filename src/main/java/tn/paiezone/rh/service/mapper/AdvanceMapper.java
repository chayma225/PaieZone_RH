package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.service.dto.AdvanceDTO;

@Mapper(componentModel = "spring", uses = {
    EmployeeMapper.class,
    PaySlipMapper.class      // fournit employeeFromId et paySlipFromId
})
public interface AdvanceMapper extends EntityMapper<AdvanceDTO, Advance> {

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "paySlip.id",  target = "paySlipId")
    AdvanceDTO toDto(Advance s);

    @Mapping(source = "employeeId", target = "employee")
    @Mapping(source = "paySlipId",  target = "paySlip")
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "createdDate",      ignore = true)
    @Mapping(target = "lastModifiedBy",   ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    Advance toEntity(AdvanceDTO dto);

    @Mapping(source = "employeeId", target = "employee")
    @Mapping(source = "paySlipId",  target = "paySlip")
    @Mapping(target = "createdBy",        ignore = true)
    @Mapping(target = "createdDate",      ignore = true)
    @Mapping(target = "lastModifiedBy",   ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void partialUpdate(@MappingTarget Advance entity, AdvanceDTO dto);
    // Pas de helpers ici — EmployeeMapper et PaySlipMapper les fournissent
}
