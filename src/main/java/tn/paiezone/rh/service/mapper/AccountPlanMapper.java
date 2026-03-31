package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.AccountPlan;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.service.dto.AccountPlanDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;

/**
 * Mapper for the entity {@link AccountPlan} and its DTO {@link AccountPlanDTO}.
 */
@Mapper(componentModel = "spring")
public interface AccountPlanMapper extends EntityMapper<AccountPlanDTO, AccountPlan> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    AccountPlanDTO toDto(AccountPlan s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
