package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.AccountingEntry;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;

@Mapper(componentModel = "spring", uses = {
    PayrollPeriodMapper.class,
    CompanyMapper.class
})
public interface AccountingEntryMapper extends EntityMapper<AccountingEntryDTO, AccountingEntry> {

    @Override
    @Mapping(target = "payrollPeriod", source = "payrollPeriod")
    AccountingEntryDTO toDto(AccountingEntry s);

    @Override
    @Mapping(target = "payrollPeriod", source = "payrollPeriod")
    AccountingEntry toEntity(AccountingEntryDTO dto);

    @Override
    @Mapping(target = "payrollPeriod", source = "payrollPeriod")
    void partialUpdate(@MappingTarget AccountingEntry entity, AccountingEntryDTO dto);
}
