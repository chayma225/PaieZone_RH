package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.KnowledgeDocument;

/**
 * Spring Data JPA repository for the KnowledgeDocument entity.
 */
@SuppressWarnings("unused")
@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {}
