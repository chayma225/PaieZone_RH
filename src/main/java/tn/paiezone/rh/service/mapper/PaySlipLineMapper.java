package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.PaySlipLine;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;

@Mapper(componentModel = "spring", uses = {
    PaySlipMapper.class,
    RubriqueMapper.class
})
public interface PaySlipLineMapper extends EntityMapper<PaySlipLineDTO, PaySlipLine> {

    @Mapping(source = "paySlip.id",  target = "paySlipId")
    @Mapping(source = "rubrique.id", target = "rubriqueId")
    PaySlipLineDTO toDto(PaySlipLine s);

    @Mapping(source = "paySlipId",  target = "paySlip")
    @Mapping(source = "rubriqueId", target = "rubrique")
    PaySlipLine toEntity(PaySlipLineDTO dto);

    @Mapping(source = "paySlipId",  target = "paySlip")
    @Mapping(source = "rubriqueId", target = "rubrique")
    void partialUpdate(@MappingTarget PaySlipLine entity, PaySlipLineDTO dto);

    // Helpers — définis ici car pas dans PaySlipMapper/RubriqueMapper
    default tn.paiezone.rh.domain.Rubrique rubriqueFromId(Long id) {
        if (id == null) return null;
        tn.paiezone.rh.domain.Rubrique r = new tn.paiezone.rh.domain.Rubrique();
        r.setId(id);
        return r;
    }
}
