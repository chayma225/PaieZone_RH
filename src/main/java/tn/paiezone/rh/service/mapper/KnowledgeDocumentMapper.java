package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.KnowledgeDocument;
import tn.paiezone.rh.service.dto.KnowledgeDocumentDTO;

/**
 * Mapper for the entity {@link KnowledgeDocument} and its DTO {@link KnowledgeDocumentDTO}.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface KnowledgeDocumentMapper extends EntityMapper<KnowledgeDocumentDTO, KnowledgeDocument> {
    @Mapping(target = "companyId", source = "company.id")
    KnowledgeDocumentDTO toDto(KnowledgeDocument s);

    @Mapping(target = "company", source = "companyId", qualifiedByName = "companyFromId")
    KnowledgeDocument toEntity(KnowledgeDocumentDTO dto);

    @Named("companyFromId")
    default Company companyFromId(Long id) {
        if (id == null) return null;
        Company c = new Company();
        c.setId(id);
        return c;
    }
}
