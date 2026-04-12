package tn.paiezone.rh.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.UserProfile;

/**
 * Spring Data JPA repository for the UserProfile entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByJhiUserId(String jhiUserId);
    Optional<UserProfile> findByJhiUserId(String jhiUserId);
}
