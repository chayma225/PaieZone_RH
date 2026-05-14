package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.service.dto.TimeEntryDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = { EmployeeMapper.class })
public interface TimeEntryMapper extends EntityMapper<TimeEntryDTO, TimeEntry> {
    @Mapping(source = "employee.id", target = "employeeId")
    TimeEntryDTO toDto(TimeEntry s);

    @Mapping(source = "employeeId", target = "employee")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    TimeEntry toEntity(TimeEntryDTO dto);

    @Mapping(source = "employeeId", target = "employee")
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "lastModifiedBy", ignore = true)
    @Mapping(target = "lastModifiedDate", ignore = true)
    void partialUpdate(@MappingTarget TimeEntry entity, TimeEntryDTO dto);

    default tn.paiezone.rh.domain.Employee employeeFromId(Long id) {
        if (id == null) return null;
        tn.paiezone.rh.domain.Employee e = new tn.paiezone.rh.domain.Employee();
        e.setId(id);
        return e;
    }
}
