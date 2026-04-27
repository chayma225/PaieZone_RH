package tn.paiezone.rh.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.ChatSession;

/**
 * Spring Data JPA repository for the ChatSession entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    @Query("SELECT COUNT(c) FROM ChatSession c WHERE c.status = :status")
    long countByStatus(String status);
}
