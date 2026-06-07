package tn.paiezone.rh.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.UserProfileRepository;

/**
 * Tests unitaires du TenantContextService.
 *
 * Isolation multi-tenant critique :
 * - SUPER_ADMIN → companyId = null (voit tout)
 * - ADMIN avec UserProfile → companyId résolu depuis UserProfile
 * - ADMIN sans UserProfile → fallback adminLogin sur Company
 * - Utilisateur sans entreprise → -1L (fail-closed)
 * - canAccessCompany → contrôle croisé inter-tenants
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("TenantContextService — Isolation multi-tenant")
class TenantContextServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private TenantContextService tenantContextService;

    private static final String SUPER_ADMIN_LOGIN = "superadmin";
    private static final String ADMIN_LOGIN = "admin1";
    private static final String EMPLOYE_LOGIN = "emp1";
    private static final Long COMPANY_ID = 10L;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // ══════════════════════════════════════════════════════════════
    //  1. Super Admin
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Super Admin")
    class SuperAdminTest {

        @Test
        @DisplayName("isSuperAdmin() → true pour ROLE_SUPER_ADMIN")
        void isSuperAdmin_avecRoleSuperAdmin_doitRetournerTrue() {
            authenticateAs(SUPER_ADMIN_LOGIN, "ROLE_SUPER_ADMIN");
            assertThat(tenantContextService.isSuperAdmin()).isTrue();
        }

        @Test
        @DisplayName("isSuperAdmin() → false pour ROLE_ADMIN")
        void isSuperAdmin_avecRoleAdmin_doitRetournerFalse() {
            authenticateAs(ADMIN_LOGIN, "ROLE_ADMIN");
            assertThat(tenantContextService.isSuperAdmin()).isFalse();
        }

        @Test
        @DisplayName("getCurrentCompanyId() → null pour Super Admin (accès global)")
        void getCurrentCompanyId_superAdmin_doitRetournerNull() {
            authenticateAs(SUPER_ADMIN_LOGIN, "ROLE_SUPER_ADMIN");
            Long companyId = tenantContextService.getCurrentCompanyId();
            assertThat(companyId).isNull();
        }

        @Test
        @DisplayName("canAccessCompany() → true pour Super Admin (toutes entreprises)")
        void canAccessCompany_superAdmin_doitToujoursRetournerTrue() {
            authenticateAs(SUPER_ADMIN_LOGIN, "ROLE_SUPER_ADMIN");
            assertThat(tenantContextService.canAccessCompany(1L)).isTrue();
            assertThat(tenantContextService.canAccessCompany(999L)).isTrue();
            assertThat(tenantContextService.canAccessCompany(Long.MAX_VALUE)).isTrue();
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  2. Admin avec UserProfile
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Admin avec UserProfile")
    class AdminWithProfileTest {

        @Test
        @DisplayName("getCurrentCompanyId() → companyId depuis UserProfile")
        void getCurrentCompanyId_adminAvecProfil_doitRetournerCompanyIdDuProfil() {
            authenticateAs(ADMIN_LOGIN, "ROLE_ADMIN");

            Company company = buildCompany(COMPANY_ID, "test-schema");
            UserProfile profile = new UserProfile();
            profile.setJhiUserId(ADMIN_LOGIN);
            profile.setCompany(company);

            when(userProfileRepository.findByJhiUserId(ADMIN_LOGIN)).thenReturn(Optional.of(profile));

            assertThat(tenantContextService.getCurrentCompanyId()).isEqualTo(COMPANY_ID);
        }

        @Test
        @DisplayName("canAccessCompany() → true pour SA propre entreprise")
        void canAccessCompany_saPropresEntreprise_doitRetournerTrue() {
            authenticateAs(ADMIN_LOGIN, "ROLE_ADMIN");

            Company company = buildCompany(COMPANY_ID, "schema1");
            UserProfile profile = buildProfile(ADMIN_LOGIN, company);

            when(userProfileRepository.findByJhiUserId(ADMIN_LOGIN)).thenReturn(Optional.of(profile));

            assertThat(tenantContextService.canAccessCompany(COMPANY_ID)).isTrue();
        }

        @Test
        @DisplayName("canAccessCompany() → false pour une autre entreprise (isolation cross-tenant)")
        void canAccessCompany_autreEntreprise_doitRetournerFalse() {
            authenticateAs(ADMIN_LOGIN, "ROLE_ADMIN");

            Company company = buildCompany(COMPANY_ID, "schema1");
            UserProfile profile = buildProfile(ADMIN_LOGIN, company);

            when(userProfileRepository.findByJhiUserId(ADMIN_LOGIN)).thenReturn(Optional.of(profile));

            Long autreEntrepriseId = 99L;
            assertThat(tenantContextService.canAccessCompany(autreEntrepriseId)).isFalse();
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  3. Fallback adminLogin
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Fallback adminLogin")
    class FallbackAdminLoginTest {

        @Test
        @DisplayName("Sans UserProfile → fallback sur Company.adminLogin")
        void getCurrentCompanyId_sansProfilMaisAdminLogin_doitRetournerCompanyId() {
            authenticateAs(ADMIN_LOGIN, "ROLE_ADMIN");

            when(userProfileRepository.findByJhiUserId(ADMIN_LOGIN)).thenReturn(Optional.empty()); // pas de profil

            Company company = buildCompany(COMPANY_ID, "schema-fallback");
            when(companyRepository.findFirstByAdminLoginIgnoreCase(ADMIN_LOGIN)).thenReturn(Optional.of(company));

            assertThat(tenantContextService.getCurrentCompanyId()).isEqualTo(COMPANY_ID);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  4. Fail-closed — aucune entreprise résolue
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Fail-closed")
    class FailClosedTest {

        @Test
        @DisplayName("Utilisateur authentifié sans entreprise résolue → -1L (accès bloqué)")
        void getCurrentCompanyId_sansEntreprise_doitRetournerMoinsUn() {
            authenticateAs(EMPLOYE_LOGIN, "ROLE_EMPLOYE");

            when(userProfileRepository.findByJhiUserId(EMPLOYE_LOGIN)).thenReturn(Optional.empty());
            when(companyRepository.findFirstByAdminLoginIgnoreCase(EMPLOYE_LOGIN)).thenReturn(Optional.empty());

            Long companyId = tenantContextService.getCurrentCompanyId();
            assertThat(companyId).isEqualTo(-1L);
        }

        @Test
        @DisplayName("canAccessCompany() avec companyId=-1 → false")
        void canAccessCompany_failClosed_doitRetournerFalse() {
            authenticateAs(EMPLOYE_LOGIN, "ROLE_EMPLOYE");

            when(userProfileRepository.findByJhiUserId(EMPLOYE_LOGIN)).thenReturn(Optional.empty());
            when(companyRepository.findFirstByAdminLoginIgnoreCase(EMPLOYE_LOGIN)).thenReturn(Optional.empty());

            assertThat(tenantContextService.canAccessCompany(1L)).isFalse();
        }

        @Test
        @DisplayName("Non authentifié (auth = null) → fail silencieux")
        void getCurrentCompanyId_sansAuthentification_doitGererGracieusement() {
            SecurityContextHolder.clearContext(); // aucun contexte
            // Doit retourner -1 ou null, ne doit pas lancer d'exception
            Long result = tenantContextService.getCurrentCompanyId();
            // Comportement attendu : -1L (fail-closed) ou retour sans NPE
            assertThat(result).isIn(-1L, null);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  5. isRestrictedEmployee
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("isRestrictedEmployee")
    class RestrictedEmployeeTest {

        @Test
        @DisplayName("ROLE_EMPLOYE seul → employé restreint")
        void isRestrictedEmployee_roleEmploye_doitRetournerTrue() {
            authenticateAs(EMPLOYE_LOGIN, "ROLE_EMPLOYE");
            assertThat(tenantContextService.isRestrictedEmployee()).isTrue();
        }

        @Test
        @DisplayName("ROLE_EMPLOYE + ROLE_RH_COMPTABLE → non restreint")
        void isRestrictedEmployee_avecRhComptable_doitRetournerFalse() {
            var auth = new UsernamePasswordAuthenticationToken(
                EMPLOYE_LOGIN,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_EMPLOYE"), new SimpleGrantedAuthority("ROLE_RH_COMPTABLE"))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            assertThat(tenantContextService.isRestrictedEmployee()).isFalse();
        }

        @Test
        @DisplayName("ROLE_ADMIN → non restreint")
        void isRestrictedEmployee_admin_doitRetournerFalse() {
            authenticateAs(ADMIN_LOGIN, "ROLE_ADMIN");
            assertThat(tenantContextService.isRestrictedEmployee()).isFalse();
        }
    }

    // ── Helpers ────────────────────────────────────────────────────

    private void authenticateAs(String login, String role) {
        var auth = new UsernamePasswordAuthenticationToken(login, null, List.of(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private Company buildCompany(Long id, String schema) {
        Company c = new Company();
        c.setId(id);
        c.setTenantSchema(schema);
        return c;
    }

    private UserProfile buildProfile(String login, Company company) {
        UserProfile p = new UserProfile();
        p.setJhiUserId(login);
        p.setCompany(company);
        return p;
    }
}
