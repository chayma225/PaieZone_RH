package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link PayrollPeriod} and its DTO {@link PayrollPeriodDTO}.
 */
@Mapper(componentModel = "spring")
public interface PayrollPeriodMapper extends EntityMapper<PayrollPeriodDTO, PayrollPeriod> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    @Mapping(target = "createdBy", source = "createdBy", qualifiedByName = "userProfileId")
    PayrollPeriodDTO toDto(PayrollPeriod s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);
}
