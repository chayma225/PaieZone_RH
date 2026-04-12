package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.HrDocument;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.HrDocumentDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link HrDocument} and its DTO {@link HrDocumentDTO}.
 */
@Mapper(componentModel = "spring")
public interface HrDocumentMapper extends EntityMapper<HrDocumentDTO, HrDocument> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "uploadedBy", source = "uploadedBy", qualifiedByName = "userProfileId")
    HrDocumentDTO toDto(HrDocument s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);
}
