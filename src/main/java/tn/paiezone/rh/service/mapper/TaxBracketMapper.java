package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.TaxBracket;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.TaxBracketDTO;

/**
 * Mapper for the entity {@link TaxBracket} and its DTO {@link TaxBracketDTO}.
 */
@Mapper(componentModel = "spring")
public interface TaxBracketMapper extends EntityMapper<TaxBracketDTO, TaxBracket> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    TaxBracketDTO toDto(TaxBracket s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
