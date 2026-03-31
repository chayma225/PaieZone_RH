package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.dto.TimeEntryDTO;
import tn.paiezone.rh.service.dto.UserProfileDTO;

/**
 * Mapper for the entity {@link TimeEntry} and its DTO {@link TimeEntryDTO}.
 */
@Mapper(componentModel = "spring")
public interface TimeEntryMapper extends EntityMapper<TimeEntryDTO, TimeEntry> {
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeId")
    @Mapping(target = "validatedByUser", source = "validatedByUser", qualifiedByName = "userProfileId")
    TimeEntryDTO toDto(TimeEntry s);

    @Named("employeeId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    EmployeeDTO toDtoEmployeeId(Employee employee);

    @Named("userProfileId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    UserProfileDTO toDtoUserProfileId(UserProfile userProfile);
}
