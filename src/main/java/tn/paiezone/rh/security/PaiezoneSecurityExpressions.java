package tn.paiezone.rh.security;

/**
 * SpEL fragments for {@link org.springframework.security.access.prepost.PreAuthorize}.
 */
public final class PaiezoneSecurityExpressions {

    /** Plateforme SaaS : création / gestion des tenants et abonnements. */
    public static final String PLATFORM_ADMIN =
        "hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "','" + AuthoritiesConstants.SUPER_ADMIN + "')";

    /**
     * Administrateur de tenant (RH) + plateforme.
     * À combiner plus tard avec un filtrage par {@code companyId} côté service.
     */
    public static final String TENANT_SCOPED_ADMIN =
        "hasAnyAuthority('" +
        AuthoritiesConstants.ADMIN +
        "','" +
        AuthoritiesConstants.SUPER_ADMIN +
        "','" +
        AuthoritiesConstants.TENANT_ADMIN +
        "')";

    /** Journal d'audit : réservé plateforme tant que le filtrage tenant n'est pas en place. */
    public static final String AUDIT_READER = PLATFORM_ADMIN;

    private PaiezoneSecurityExpressions() {}
}
