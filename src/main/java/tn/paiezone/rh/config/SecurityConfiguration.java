package tn.paiezone.rh.config;

import static org.springframework.security.config.Customizer.withDefaults;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import tech.jhipster.config.JHipsterProperties;
import tn.paiezone.rh.security.*;
import tn.paiezone.rh.web.filter.SpaWebFilter;

@Configuration
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfiguration {

    private final JHipsterProperties jHipsterProperties;

    public SecurityConfiguration(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class)
            .headers(headers ->
                headers
                    .contentSecurityPolicy(csp -> csp.policyDirectives(jHipsterProperties.getSecurity().getContentSecurityPolicy()))
                    .frameOptions(FrameOptionsConfig::sameOrigin)
                    .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                    .permissionsPolicyHeader(permissions ->
                        permissions.policy(
                            "camera=(), fullscreen=(self), geolocation=(), gyroscope=(), " +
                                "magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()"
                        )
                    )
            )
            .authorizeHttpRequests(authz ->
                authz
                    // ═══════════════════════════════════════════════════════════════════
                    // RESSOURCES STATIQUES — PUBLIQUES
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(
                        "/index.html",
                        "/*.js",
                        "/*.txt",
                        "/*.json",
                        "/*.map",
                        "/*.css",
                        "/*.ico",
                        "/*.png",
                        "/*.svg",
                        "/*.webapp",
                        "/content/**",
                        "/resources/**",
                        "/swagger-ui/**"
                    )
                    .permitAll()
                    // ═══════════════════════════════════════════════════════════════════
                    // AUTHENTIFICATION — PUBLIQUE
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.POST, "/api/authenticate")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/authenticate")
                    .permitAll()
                    .requestMatchers("/api/register")
                    .permitAll()
                    .requestMatchers("/api/activate")
                    .permitAll()
                    .requestMatchers("/api/account/reset-password/init")
                    .permitAll()
                    .requestMatchers("/api/account/reset-password/finish")
                    .permitAll()
                    .requestMatchers("/api/2fa/**")
                    .authenticated()
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — PAIE : PÉRIODES
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/payroll-periods/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — PAIE : BULLETINS
                    // Contrôle fin (employé voit les siens) via @PreAuthorize dans Resource
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/payslips/**")
                    .hasAnyAuthority(
                        AuthoritiesConstants.RH_COMPTABLE,
                        AuthoritiesConstants.ADMIN,
                        AuthoritiesConstants.SUPER_ADMIN,
                        AuthoritiesConstants.EMPLOYE
                    )
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — PAIE : RUBRIQUES
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/rubriques/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — PAIE : PRIMES
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/bonuses/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — PAIE : AVANCES
                    // POST ouvert à tous les authentifiés (employé peut demander)
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.POST, "/api/advances")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/advances/employee/**")
                    .authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/advances/*/approve")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers(HttpMethod.PUT, "/api/advances/*/reject")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers("/api/advances/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — DÉCLARATIONS : CNSS + VIREMENT
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/declarations/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — CONGÉS : TYPES DE CONGÉ
                    // GET ouvert à tous (formulaire demande), écriture réservée ADMIN
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/api/leave-types/**")
                    .authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/leave-types/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers(HttpMethod.PUT, "/api/leave-types/**")
                    .hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers(HttpMethod.DELETE, "/api/leave-types/**")
                    .hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — CONGÉS : DEMANDES
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.POST, "/api/leave-requests")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/leave-requests/my")
                    .authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/leave-requests/*/cancel")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/leave-requests/pending")
                    .hasAnyAuthority(AuthoritiesConstants.MANAGER, AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers(HttpMethod.PUT, "/api/leave-requests/*/approve")
                    .hasAnyAuthority(AuthoritiesConstants.MANAGER, AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers(HttpMethod.PUT, "/api/leave-requests/*/reject")
                    .hasAnyAuthority(AuthoritiesConstants.MANAGER, AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers(HttpMethod.GET, "/api/leave-requests/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — CONGÉS : SOLDES
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/api/leave-balances/my/**")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/leave-balances/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — JOURS FÉRIÉS
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.GET, "/api/public-holidays/**")
                    .authenticated()
                    .requestMatchers(HttpMethod.POST, "/api/public-holidays/**")
                    .hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers(HttpMethod.PUT, "/api/public-holidays/**")
                    .hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers(HttpMethod.DELETE, "/api/public-holidays/**")
                    .hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers("/api/working-days/**")
                    .authenticated()
                    // ═══════════════════════════════════════════════════════════════════
                    // SPRINT 3 — POINTAGE
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers(HttpMethod.POST, "/api/time-entries")
                    .authenticated()
                    .requestMatchers(HttpMethod.GET, "/api/time-entries/my/**")
                    .authenticated()
                    .requestMatchers(HttpMethod.PUT, "/api/time-entries/*/validate")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers(HttpMethod.GET, "/api/time-entries/*/anomalies")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN)
                    .requestMatchers(HttpMethod.GET, "/api/time-entries/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // PARAMÉTRAGE RÉGLEMENTAIRE — SUPER_ADMIN UNIQUEMENT
                    // Taux CNSS, barème IRPP, paramètres légaux
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/regulatory-params/**")
                    .hasAuthority(AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers("/api/cnss-rates/**")
                    .hasAuthority(AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers("/api/tax-brackets/**")
                    .hasAuthority(AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // GESTION RH — SPRINTS 1 & 2
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/companies/**")
                    .hasAnyAuthority(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN)
                    .requestMatchers("/api/company-subscriptions/**")
                    .hasAnyAuthority(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN)
                    .requestMatchers("/api/user-profiles/**")
                    .hasAnyAuthority(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN)
                    .requestMatchers("/api/audit-logs/**")
                    .hasAnyAuthority(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN)
                    .requestMatchers("/api/departments/**")
                    .hasAnyAuthority(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN, AuthoritiesConstants.RH_COMPTABLE)
                    .requestMatchers("/api/job-positions/**")
                    .hasAnyAuthority(AuthoritiesConstants.SUPER_ADMIN, AuthoritiesConstants.ADMIN, AuthoritiesConstants.RH_COMPTABLE)
                    // Employés — GET ouvert à plus de rôles, écriture RH
                    .requestMatchers(HttpMethod.GET, "/api/employees/**")
                    .hasAnyAuthority(
                        AuthoritiesConstants.RH_COMPTABLE,
                        AuthoritiesConstants.ADMIN,
                        AuthoritiesConstants.SUPER_ADMIN,
                        AuthoritiesConstants.MANAGER,
                        AuthoritiesConstants.EMPLOYE
                    )
                    .requestMatchers(HttpMethod.POST, "/api/employees/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers(HttpMethod.PUT, "/api/employees/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers(HttpMethod.DELETE, "/api/employees/**")
                    .hasAnyAuthority(AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    .requestMatchers("/api/contracts/**")
                    .hasAnyAuthority(AuthoritiesConstants.RH_COMPTABLE, AuthoritiesConstants.ADMIN, AuthoritiesConstants.SUPER_ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // ADMINISTRATION JHIPSTER / OPENAPI / ACTUATOR
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/admin/**")
                    .hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers("/v3/api-docs/**")
                    .hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers("/management/health", "/management/health/**", "/management/info", "/management/prometheus")
                    .permitAll()
                    .requestMatchers("/management/**")
                    .hasAuthority(AuthoritiesConstants.ADMIN)
                    // ═══════════════════════════════════════════════════════════════════
                    // RÈGLE PAR DÉFAUT — authentification obligatoire
                    // ═══════════════════════════════════════════════════════════════════
                    .requestMatchers("/api/**")
                    .authenticated()
                    // ═══════════════════════════════════════════════════════════════════
                    // chatbot
                    // ═══════════════════════════════════════════════=================══
                    .requestMatchers("/api/chatbot/**")
                    .authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions ->
                exceptions
                    .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                    .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
            )
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(withDefaults()));

        return http.build();
    }
}
