package tn.paiezone.rh.domain.enumeration;

public enum ConventionRuleType {
    HOLIDAY, // jour férié sectoriel (value = date ISO "2026-05-27")
    OVERTIME_25, // taux HS jour (value = "1.35" pour ×1.35)
    OVERTIME_50, // taux HS nuit/férié (value = "1.65" pour ×1.65)
    PREMIUM, // prime fixe obligatoire (value = montant TND "500")
    PREMIUM_PCT, // prime % du brut (value = pourcentage "5")
}
