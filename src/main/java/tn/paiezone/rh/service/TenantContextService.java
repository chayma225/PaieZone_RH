package tn.paiezone.rh.service;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.security.SecurityUtils;

/**
 * Service centralisé pour l'isolation multi-tenant.
 * Fournit le companyId du tenant courant à injecter dans toutes les requêtes JPA.
 */
@Service
@Transactional(readOnly = true)
public class TenantContextService {

    private static final Logger log = LoggerFactory.getLogger(TenantContextService.class);

    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;

    public TenantContextService(UserProfileRepository userProfileRepository, CompanyRepository companyRepository) {
        this.userProfileRepository = userProfileRepository;
        this.companyRepository = companyRepository;
    }

    /**
     * Construit le contexte de sécurité complet pour l'utilisateur connecté.
     */
    public UserSecurityContext buildContext() {
        String login = SecurityUtils.getCurrentUserLogin().orElse(null);
        if (login == null) return new UserSecurityContext(null, null, null, null, Set.of());

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Set<String> roles =
            auth == null ? Set.of() : auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());

        Long companyId = null;
        Long userProfileId = null;
        String tenantSchema = null;

        try {
            Optional<UserProfile> profileOpt = userProfileRepository.findByJhiUserId(login);
            if (profileOpt.isPresent()) {
                UserProfile profile = profileOpt.orElseThrow();
                userProfileId = profile.getId();
                if (profile.getCompany() != null) {
                    companyId = profile.getCompany().getId();
                    tenantSchema = profile.getCompany().getTenantSchema();
                }
            }
            // Fallback : admin inscrit via /register-with-company (pas de UserProfile)
            if (companyId == null) {
                Optional<Company> adminCompany = companyRepository.findFirstByAdminLogin(login);
                if (adminCompany.isPresent()) {
                    companyId = adminCompany.get().getId();
                    tenantSchema = adminCompany.get().getTenantSchema();
                }
            }
        } catch (Exception e) {
            log.error("[TenantContext] Erreur chargement profil pour {} : {}", login, e.getMessage());
        }

        return new UserSecurityContext(login, companyId, userProfileId, tenantSchema, roles);
    }

    /**
     * Retourne le company_id du tenant courant, ou null si super admin / non trouvé.
     * Les SUPER_ADMIN n'ont pas de tenant propre : ils voient tout.
     */
    public Long getCurrentCompanyId() {
        if (isSuperAdmin()) return null;
        return buildContext().companyId();
    }

    /**
     * Retourne true si l'utilisateur courant est SUPER_ADMIN (voit toutes les entreprises).
     */
    public boolean isSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (
            auth != null &&
            auth
                .getAuthorities()
                .stream()
                .anyMatch(a -> AuthoritiesConstants.SUPER_ADMIN.equals(a.getAuthority()))
        );
    }

    /**
     * Retourne true si le tenant courant peut gérer les données de l'entreprise donnée.
     * Bloque tout accès croisé entre entreprises.
     */
    public boolean canAccessCompany(Long targetCompanyId) {
        if (isSuperAdmin()) return true;
        Long myCompanyId = getCurrentCompanyId();
        return myCompanyId != null && myCompanyId.equals(targetCompanyId);
    }
}
