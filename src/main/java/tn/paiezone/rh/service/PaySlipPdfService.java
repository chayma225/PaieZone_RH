package tn.paiezone.rh.service;

public interface PaySlipPdfService {

    /**
     * Génère le PDF d'un bulletin de paie individuel.
     *
     * @param paySlipId identifiant du bulletin
     * @return tableau d'octets du PDF généré
     */
    byte[] generatePdf(Long paySlipId);

    /**
     * Génère un PDF fusionné de tous les bulletins d'une période.
     *
     * @param periodId identifiant de la période de paie
     * @return tableau d'octets du PDF fusionné
     */
    byte[] generateBulkPdf(Long periodId);
}
