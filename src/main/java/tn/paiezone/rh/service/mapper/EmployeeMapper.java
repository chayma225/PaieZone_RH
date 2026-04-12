package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Department;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.DepartmentDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link Employee} and its DTO {@link EmployeeDTO}.
 */
@Mapper(componentModel = "spring")
public interface EmployeeMapper extends EntityMapper<EmployeeDTO, Employee> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    @Mapping(target = "department", source = "department", qualifiedByName = "departmentId")
    @Mapping(target = "position", source = "position", qualifiedByName = "jobPositionId")
    @Mapping(target = "manager", source = "manager", qualifiedByName = "employeeId")
    @Mapping(target = "userProfile", source = "userProfile", qualifiedByName = "userProfileId")
    EmployeeDTO toDto(Employee s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);

    @Named("departmentId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    DepartmentDTO toDtoDepartmentId(Department department);

    @Named("jobPositionId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    JobPositionDTO toDtoJobPositionId(JobPosition jobPosition);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);
}
