package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.OfficialDocument;

/**
 * Spring Data JPA repository for the OfficialDocument entity.
 */
@SuppressWarnings("unused")
@Repository
public interface OfficialDocumentRepository extends JpaRepository<OfficialDocument, Long>, JpaSpecificationExecutor<OfficialDocument> {}
