package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.PaySlipLine;
import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaySlipLineMapper extends EntityMapper<PaySlipLineDTO, PaySlipLine> {
    @Mapping(source = "paySlip.id", target = "paySlipId")
    @Mapping(source = "rubrique.id", target = "rubriqueId")
    PaySlipLineDTO toDto(PaySlipLine s);

    @Mapping(source = "paySlipId", target = "paySlip", qualifiedByName = "paySlipFromId")
    @Mapping(source = "rubriqueId", target = "rubrique", qualifiedByName = "rubriqueFromId")
    PaySlipLine toEntity(PaySlipLineDTO dto);

    @Mapping(source = "paySlipId", target = "paySlip", qualifiedByName = "paySlipFromId")
    @Mapping(source = "rubriqueId", target = "rubrique", qualifiedByName = "rubriqueFromId")
    void partialUpdate(@MappingTarget PaySlipLine entity, PaySlipLineDTO dto);

    @Named("paySlipFromId")
    default PaySlip paySlipFromId(Long id) {
        if (id == null) return null;
        PaySlip ps = new PaySlip();
        ps.setId(id);
        return ps;
    }

    @Named("rubriqueFromId")
    default Rubrique rubriqueFromId(Long id) {
        if (id == null) return null;
        Rubrique r = new Rubrique();
        r.setId(id);
        return r;
    }
}
