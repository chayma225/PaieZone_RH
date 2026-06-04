package tn.paiezone.rh.service;

import tn.paiezone.rh.domain.PayrollPeriod;

public interface AccountingGenerationService {
    /**
     * Génère les écritures comptables agrégées pour la période clôturée.
     * Idempotent : supprime les écritures existantes avant de recréer.
     */
    void generateForPeriod(PayrollPeriod period);
}
