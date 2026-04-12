package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.LeaveTypeDTO;

/**
 * Mapper for the entity {@link LeaveType} and its DTO {@link LeaveTypeDTO}.
 */
@Mapper(componentModel = "spring")
public interface LeaveTypeMapper extends EntityMapper<LeaveTypeDTO, LeaveType> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    LeaveTypeDTO toDto(LeaveType s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
