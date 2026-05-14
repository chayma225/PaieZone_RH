package tn.paiezone.rh.domain.enumeration;

public enum IntentType {
    LEGAL_RAG, // Législation tunisienne → base RAG + phi3
    ADMIN_SQL, // Statistiques entreprise → Text-to-SQL (ROLE_ADMIN / RH)
    PERSONAL_SQL, // Données personnelles employé → Text-to-SQL sécurisé
    GENERAL, // Salutation / hors contexte → phi3 direct
}
