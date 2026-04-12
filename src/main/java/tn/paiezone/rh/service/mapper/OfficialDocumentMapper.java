package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.OfficialDocument;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.OfficialDocumentDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link OfficialDocument} and its DTO {@link OfficialDocumentDTO}.
 */
@Mapper(componentModel = "spring")
public interface OfficialDocumentMapper extends EntityMapper<OfficialDocumentDTO, OfficialDocument> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "generatedBy", source = "generatedBy", qualifiedByName = "userProfileId")
    OfficialDocumentDTO toDto(OfficialDocument s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);
}
