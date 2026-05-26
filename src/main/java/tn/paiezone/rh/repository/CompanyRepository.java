package tn.paiezone.rh.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.enumeration.AppRole;

@SuppressWarnings("unused")
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findFirstByAdminLogin(String adminLogin);

    @Query("SELECT c FROM Company c WHERE LOWER(c.adminLogin) = LOWER(:login)")
    Optional<Company> findFirstByAdminLoginIgnoreCase(@Param("login") String login);

    List<Company> findByAdminLogin(String adminLogin);

    boolean existsByTaxId(String taxId);

    /**
     * Finds companies where admin_login matches OR where a UserProfile with ADMIN role
     * and the given jhiUserId exists (covers companies created before admin_login was added).
     */
    @Query(
        """
        SELECT DISTINCT c FROM Company c
        WHERE LOWER(c.adminLogin) = LOWER(:login)
           OR EXISTS (
               SELECT up FROM UserProfile up
               WHERE up.company = c
                 AND up.jhiUserId = :login
                 AND up.role = :adminRole
           )
        """
    )
    List<Company> findByAdminLoginOrAdminProfile(@Param("login") String login, @Param("adminRole") AppRole adminRole);
}
