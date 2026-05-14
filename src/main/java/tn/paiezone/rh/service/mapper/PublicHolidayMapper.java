package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.PublicHoliday;
import tn.paiezone.rh.service.dto.PublicHolidayDTO;

/**
 * Mapper for the entity {@link PublicHoliday} and its DTO {@link PublicHolidayDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PublicHolidayMapper extends EntityMapper<PublicHolidayDTO, PublicHoliday> {}
