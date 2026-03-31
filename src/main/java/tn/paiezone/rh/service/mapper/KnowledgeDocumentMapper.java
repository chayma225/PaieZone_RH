package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.KnowledgeDocument;
import tn.paiezone.rh.service.dto.CompanyDTO;
import tn.paiezone.rh.service.dto.KnowledgeDocumentDTO;

/**
 * Mapper for the entity {@link KnowledgeDocument} and its DTO {@link KnowledgeDocumentDTO}.
 */
@Mapper(componentModel = "spring")
public interface KnowledgeDocumentMapper extends EntityMapper<KnowledgeDocumentDTO, KnowledgeDocument> {
    @Mapping(target = "company", source = "company", qualifiedByName = "companyId")
    KnowledgeDocumentDTO toDto(KnowledgeDocument s);

    @Named("companyId")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    CompanyDTO toDtoCompanyId(Company company);
}
