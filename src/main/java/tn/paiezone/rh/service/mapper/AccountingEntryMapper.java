package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.AccountingEntry;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;

/**
 * Mapper for the entity {@link AccountingEntry} and its DTO {@link AccountingEntryDTO}.
 */
@Mapper(componentModel = "spring")
public interface AccountingEntryMapper extends EntityMapper<AccountingEntryDTO, AccountingEntry> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    @Mapping(target = "payrollPeriod", source = "payrollPeriod", qualifiedByName = "payrollPeriodId")
    AccountingEntryDTO toDto(AccountingEntry s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);

    @Named("payrollPeriodId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PayrollPeriodDTO toDtoPayrollPeriodId(PayrollPeriod payrollPeriod);
}
