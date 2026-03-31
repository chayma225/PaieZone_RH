package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;

/**
 * Mapper for the entity {@link Company} and its DTO {@link CompanyDTO}.
 */
@Mapper(componentModel = "spring")
public interface CompanyMapper extends EntityMapper<CompanyDTO, Company> {
    @Mapping(target = "subscription", source = "subscription", qualifiedByName = "companySubscriptionId")
    CompanyDTO toDto(Company s);

    @Named("companySubscriptionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanySubscriptionDTO toDtoCompanySubscriptionId(CompanySubscription companySubscription);
}
