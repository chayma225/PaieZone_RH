package tn.paiezone.rh.security;

import tn.paiezone.rh.domain.enumeration.AppRole;

public final class RoleMapper {

    private RoleMapper() {}

    public static String toAuthority(AppRole role) {
        return switch (role) {
            case SUPER_ADMIN -> AuthoritiesConstants.SUPER_ADMIN;
            case ADMIN -> AuthoritiesConstants.ADMIN;
            case RH_COMPTABLE -> AuthoritiesConstants.RH_COMPTABLE;
            case MANAGER -> AuthoritiesConstants.MANAGER;
            case EMPLOYE -> AuthoritiesConstants.EMPLOYE;
        };
    }

    public static AppRole fromAuthority(String authority) {
        return switch (authority) {
            case AuthoritiesConstants.SUPER_ADMIN -> AppRole.SUPER_ADMIN;
            case AuthoritiesConstants.ADMIN -> AppRole.ADMIN;
            case AuthoritiesConstants.RH_COMPTABLE -> AppRole.RH_COMPTABLE;
            case AuthoritiesConstants.MANAGER -> AppRole.MANAGER;
            case AuthoritiesConstants.EMPLOYE -> AppRole.EMPLOYE;
            default -> AppRole.EMPLOYE;
        };
    }
}
