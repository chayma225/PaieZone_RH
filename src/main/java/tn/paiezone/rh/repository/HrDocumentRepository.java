package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.HrDocument;
import tn.paiezone.rh.domain.enumeration.DocumentType;

/**
 * Spring Data JPA repository for the HrDocument entity.
 */
@SuppressWarnings("unused")
@Repository
public interface HrDocumentRepository extends JpaRepository<HrDocument, Long> {
    List<HrDocument> findByEmployeeIdAndActiveTrue(Long employeeId);
    List<HrDocument> findByEmployeeIdAndDocumentType(Long employeeId, DocumentType documentType);
    long countByEmployeeIdAndActiveTrue(Long employeeId);
}
