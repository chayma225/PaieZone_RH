package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.service.dto.RegulatoryParamDTO;

/**
 * Mapper for the entity {@link RegulatoryParam} and its DTO {@link RegulatoryParamDTO}.
 */
@Mapper(componentModel = "spring")
public interface RegulatoryParamMapper extends EntityMapper<RegulatoryParamDTO, RegulatoryParam> {}
