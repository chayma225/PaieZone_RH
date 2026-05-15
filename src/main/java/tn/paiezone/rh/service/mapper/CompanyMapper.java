package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;

/**
 * Mapper for the entity {@link Company} and its DTO {@link CompanyDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CompanyMapper extends EntityMapper<CompanyDTO, Company> {
    @Mapping(target = "companySubscription", source = "companySubscription", qualifiedByName = "companySubscriptionSummary")
    CompanyDTO toDto(Company s);

    @Named("companySubscriptionSummary")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "plan", source = "plan")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "priceHT", source = "priceHT")
    @Mapping(target = "maxEmployees", source = "maxEmployees")
    @Mapping(target = "renewalDate", source = "renewalDate")
    CompanySubscriptionDTO toDtoCompanySubscriptionSummary(CompanySubscription companySubscription);

    @Named("companySubscriptionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanySubscriptionDTO toDtoCompanySubscriptionId(CompanySubscription companySubscription);
}
