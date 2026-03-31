package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.CnssRate;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.service.dto.CnssRateDTO;
import tn.paiezone.rh.service.dto.CompanyDTO;

/**
 * Mapper for the entity {@link CnssRate} and its DTO {@link CnssRateDTO}.
 */
@Mapper(componentModel = "spring")
public interface CnssRateMapper extends EntityMapper<CnssRateDTO, CnssRate> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    CnssRateDTO toDto(CnssRate s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
