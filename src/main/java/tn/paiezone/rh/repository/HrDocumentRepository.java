package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.HrDocument;

/**
 * Spring Data JPA repository for the HrDocument entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HrDocumentRepository extends JpaRepository<HrDocument, Long> {}
