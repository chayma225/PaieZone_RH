package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Department;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.DepartmentDTO;
import tn.paiezone.rh.service.dto.JobPositionDTO;

/**
 * Mapper for the entity {@link JobPosition} and its DTO {@link JobPositionDTO}.
 */
@Mapper(componentModel = "spring")
public interface JobPositionMapper extends EntityMapper<JobPositionDTO, JobPosition> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    @Mapping(target = "department", source = "department", qualifiedByName = "departmentId")
    JobPositionDTO toDto(JobPosition s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);

    @Named("departmentId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DepartmentDTO toDtoDepartmentId(Department department);
}
