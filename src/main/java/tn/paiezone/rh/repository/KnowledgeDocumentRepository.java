package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.KnowledgeDocument;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {
    List<KnowledgeDocument> findByActiveTrue();

    List<KnowledgeDocument> findByCategoryAndActiveTrue(String category);
}
