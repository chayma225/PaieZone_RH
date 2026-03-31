package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.PaySlipLine;
import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;
import tn.paiezone.rh.service.dto.RubriqueDTO;

/**
 * Mapper for the entity {@link PaySlipLine} and its DTO {@link PaySlipLineDTO}.
 */
@Mapper(componentModel = "spring")
public interface PaySlipLineMapper extends EntityMapper<PaySlipLineDTO, PaySlipLine> {
    @Mapping(target = "paySlip", source = "paySlip", qualifiedByName = "paySlipId")
    @Mapping(target = "rubrique", source = "rubrique", qualifiedByName = "rubriqueId")
    PaySlipLineDTO toDto(PaySlipLine s);

    @Named("paySlipId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    PaySlipDTO toDtoPaySlipId(PaySlip paySlip);

    @Named("rubriqueId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    RubriqueDTO toDtoRubriqueId(Rubrique rubrique);
}
