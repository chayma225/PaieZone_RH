package tn.paiezone.rh.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.ChatSession;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserLoginAndActiveTrueOrderByLastActivityDesc(String userLogin);

    Optional<ChatSession> findByIdAndUserLogin(Long id, String userLogin);
}
