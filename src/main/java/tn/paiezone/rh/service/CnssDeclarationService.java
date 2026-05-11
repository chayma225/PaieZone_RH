package tn.paiezone.rh.service;

public interface CnssDeclarationService {

    /**
     * Génère le fichier de déclaration CNSS (format texte/CSV)
     * pour une entreprise sur un mois/année donné.
     *
     * @param companyId identifiant de l'entreprise
     * @param month     mois (1-12)
     * @param year      année
     * @return tableau d'octets du fichier généré
     */
    byte[] generateCnssFile(Long companyId, int month, int year);

    /**
     * Génère le fichier de virement bancaire (format texte/CSV)
     * pour les salaires d'une entreprise sur un mois/année donné.
     *
     * @param companyId identifiant de l'entreprise
     * @param month     mois (1-12)
     * @param year      année
     * @return tableau d'octets du fichier généré
     */
    byte[] generateVirementFile(Long companyId, int month, int year);
}
