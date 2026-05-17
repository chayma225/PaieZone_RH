package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.AuditLogDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link AuditLog} and its DTO {@link AuditLogDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditLogMapper extends EntityMapper<AuditLogDTO, AuditLog> {
    @Mapping(target = "user", source = "user", qualifiedByName = "userProfileId")
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    AuditLogDTO toDto(AuditLog s);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "jhiUserId", source = "jhiUserId")
    @Mapping(target = "role", source = "role")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
