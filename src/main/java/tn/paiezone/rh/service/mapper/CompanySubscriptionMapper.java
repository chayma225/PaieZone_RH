package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;

/**
 * Mapper for the entity {@link CompanySubscription} and its DTO {@link CompanySubscriptionDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CompanySubscriptionMapper extends EntityMapper<CompanySubscriptionDTO, CompanySubscription> {}
