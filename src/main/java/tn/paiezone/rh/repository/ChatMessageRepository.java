package tn.paiezone.rh.repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.ChatMessage;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // FIX : on compare sur session.id (Long) au lieu de l'entité session
    // → évite les erreurs Hibernate sur la comparaison d'instances détachées
    @Query("SELECT m FROM ChatMessage m WHERE m.session.id = :sessionId ORDER BY m.sentAt ASC")
    List<ChatMessage> findBySessionIdOrderBySentAtAsc(@Param("sessionId") Long sessionId);

    @Query("SELECT m FROM ChatMessage m WHERE m.session.id = :sessionId ORDER BY m.sentAt DESC")
    List<ChatMessage> findLastNMessagesBySessionId(@Param("sessionId") Long sessionId, Pageable pageable);
}
