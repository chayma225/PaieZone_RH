package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Bonus;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.service.dto.BonusDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.PaySlipDTO;

/**
 * Mapper for the entity {@link Bonus} and its DTO {@link BonusDTO}.
 */
@Mapper(componentModel = "spring")
public interface BonusMapper extends EntityMapper<BonusDTO, Bonus> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "paySlip", source = "paySlip", qualifiedByName = "paySlipId")
    BonusDTO toDto(Bonus s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("paySlipId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PaySlipDTO toDtoPaySlipId(PaySlip paySlip);
}
