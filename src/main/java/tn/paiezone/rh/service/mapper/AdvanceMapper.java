package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link Advance} and its DTO {@link AdvanceDTO}.
 */
@Mapper(componentModel = "spring")
public interface AdvanceMapper extends EntityMapper<AdvanceDTO, Advance> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "paySlip", source = "paySlip", qualifiedByName = "paySlipId")
    @Mapping(target = "approvedByUser", source = "approvedByUser", qualifiedByName = "userProfileId")
    AdvanceDTO toDto(Advance s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("paySlipId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PaySlipDTO toDtoPaySlipId(PaySlip paySlip);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);
}
