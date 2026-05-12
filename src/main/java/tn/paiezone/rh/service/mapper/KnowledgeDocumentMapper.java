package tn.paiezone.rh.service.mapper;

import org.mapstruct.*;
import tn.paiezone.rh.domain.KnowledgeDocument;
import tn.paiezone.rh.service.dto.KnowledgeDocumentDTO;

/**
 * Mapper for the entity {@link KnowledgeDocument} and its DTO {@link KnowledgeDocumentDTO}.
 */
@Mapper(componentModel = "spring")
public interface KnowledgeDocumentMapper extends EntityMapper<KnowledgeDocumentDTO, KnowledgeDocument> {
    /**
     * Mappe directement les champs title, content, category, keywords et active.
     */
    KnowledgeDocumentDTO toDto(KnowledgeDocument s);
}
