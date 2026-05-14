package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.AccountingEntry;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AccountingEntryMapper extends EntityMapper<AccountingEntryDTO, AccountingEntry> {
    @Override
    @Mapping(target = "company", source = "company", qualifiedByName = "companyToDto")
    @Mapping(target = "payrollPeriod", source = "payrollPeriod", qualifiedByName = "payrollPeriodToDto")
    AccountingEntryDTO toDto(AccountingEntry s);

    @Override
    @Mapping(target = "company", source = "company", qualifiedByName = "companyToEntity")
    @Mapping(target = "payrollPeriod", source = "payrollPeriod", qualifiedByName = "payrollPeriodToEntity")
    AccountingEntry toEntity(AccountingEntryDTO dto);

    @Override
    @Mapping(target = "company", source = "company", qualifiedByName = "companyToEntity")
    @Mapping(target = "payrollPeriod", source = "payrollPeriod", qualifiedByName = "payrollPeriodToEntity")
    void partialUpdate(@MappingTarget AccountingEntry entity, AccountingEntryDTO dto);

    @Named("companyToDto")
    default CompanyDTO companyToDto(Company company) {
        if (company == null) return null;
        CompanyDTO dto = new CompanyDTO();
        dto.setId(company.getId());
        return dto;
    }

    @Named("companyToEntity")
    default Company companyToEntity(CompanyDTO dto) {
        if (dto == null || dto.getId() == null) return null;
        Company c = new Company();
        c.setId(dto.getId());
        return c;
    }

    @Named("payrollPeriodToDto")
    default PayrollPeriodDTO payrollPeriodToDto(PayrollPeriod period) {
        if (period == null) return null;
        PayrollPeriodDTO dto = new PayrollPeriodDTO();
        dto.setId(period.getId());
        dto.setMonth(period.getMonth());
        dto.setYear(period.getYear());
        dto.setStatus(period.getStatus());
        return dto;
    }

    @Named("payrollPeriodToEntity")
    default PayrollPeriod payrollPeriodToEntity(PayrollPeriodDTO dto) {
        if (dto == null || dto.getId() == null) return null;
        PayrollPeriod p = new PayrollPeriod();
        p.setId(dto.getId());
        return p;
    }
}
