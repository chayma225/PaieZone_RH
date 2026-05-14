package tn.paiezone.rh.service;

import java.util.Set;

/**
 * Contexte de sécurité de l'utilisateur connecté — passé aux services SQL.
 *
 * @param login          Login JHipster
 * @param companyId      ID de l'entreprise du tenant
 * @param userProfileId  ID du profil de l'employé connecté
 * @param tenantSchema   Schéma PostgreSQL du tenant (ex: tn_acme_sa)
 * @param roles          Rôles Spring Security
 */
public record UserSecurityContext(String login, Long companyId, Long userProfileId, String tenantSchema, Set<String> roles) {
    public boolean isAdmin() {
        return roles.contains("ROLE_ADMIN") || roles.contains("ROLE_SUPER_ADMIN") || roles.contains("ROLE_RH_COMPTABLE");
    }

    public boolean isManager() {
        return roles.contains("ROLE_MANAGER");
    }
}
