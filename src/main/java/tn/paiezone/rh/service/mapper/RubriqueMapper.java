package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.RubriqueDTO;

/**
 * Mapper for the entity {@link Rubrique} and its DTO {@link RubriqueDTO}.
 */
@Mapper(componentModel = "spring")
public interface RubriqueMapper extends EntityMapper<RubriqueDTO, Rubrique> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    RubriqueDTO toDto(Rubrique s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
