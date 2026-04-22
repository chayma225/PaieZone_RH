package tn.paiezone.rh.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.domain.TaxBracket;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.repository.TaxBracketRepository;

@Service // Déclare ce service comme bean Spring — injectable partout
@RequiredArgsConstructor // Lombok génère le constructeur avec les dépendances
@Slf4j // Lombok fournit logger : log.debug(), log.info()...
public class TunisianTaxService {

    // Les deux seules dépendances de ce service
    // Tout passe par ces deux repositories
    private final RegulatoryParamRepository paramRepository;
    private final TaxBracketRepository taxBracketRepository;

    // ════════════════════════════════════════════════════════════
    // MÉTHODE 1 — CNSS SALARIALE
    //
    // Formule légale :
    //   CNSS = MIN(Salaire Brut, CNSS_PLAFOND_MENSUEL) × CNSS_TAUX_SALARIAL
    //
    // Exemple (salaire = 3 000 DT) :
    //   base   = MIN(3000, 5000) = 3 000 DT
    //   CNSS   = 3 000 × 9,68% = 290,400 DT
    //
    // Exemple (salaire = 7 000 DT — dépasse le plafond) :
    //   base   = MIN(7000, 5000) = 5 000 DT  ← plafonné !
    //   CNSS   = 5 000 × 9,68% = 484,000 DT
    // ════════════════════════════════════════════════════════════
    public BigDecimal calculateCnssSalariale(BigDecimal grossSalary, LocalDate payDate) {
        // Lecture du taux et du plafond DEPUIS LA BASE (pas de valeur en dur)
        BigDecimal taux = getParam("CNSS_TAUX_SALARIAL", payDate);
        BigDecimal plafond = getParam("CNSS_PLAFOND_MENSUEL", payDate);

        // Application du plafond avec BigDecimal.min()
        BigDecimal base = grossSalary.min(plafond);

        // Calcul avec arrondi à 3 décimales (millimes)
        BigDecimal result = base.multiply(taux).setScale(3, RoundingMode.HALF_UP);

        // Log de debug : visible uniquement en mode dev (ne pas mettre en prod)
        log.debug("[CNSS_SAL] brut={} | base_après_plafond={} | taux={} | résultat={}", grossSalary, base, taux, result);
        return result;
    }

    // ════════════════════════════════════════════════════════════
    // MÉTHODE 2 — CNSS PATRONALE
    //
    // Formule : même assiette que le salarial (plafonnée)
    //   CNSS Patronale = MIN(Brut, PLAFOND) × CNSS_TAUX_PATRONAL
    //
    // Cette charge est payée PAR L'EMPLOYEUR en plus du salaire.
    // Elle ne touche PAS le salaire net de l'employé.
    // Elle est utilisée pour calculer le coût total d'un employé.
    // ════════════════════════════════════════════════════════════
    public BigDecimal calculateCnssPatronale(BigDecimal grossSalary, LocalDate payDate) {
        BigDecimal taux = getParam("CNSS_TAUX_PATRONAL", payDate);
        BigDecimal plafond = getParam("CNSS_PLAFOND_MENSUEL", payDate);

        BigDecimal base = grossSalary.min(plafond);
        return base.multiply(taux).setScale(3, RoundingMode.HALF_UP);
    }

    // ════════════════════════════════════════════════════════════
    // MÉTHODE 3 — CSS (Contribution Sociale de Solidarité)
    //
    // ATTENTION : l'assiette de la CSS est le REVENU NET,
    // pas le salaire brut !
    //
    // Revenu Net = Salaire Brut - CNSS Salariale
    // CSS = Revenu Net × CSS_TAUX (0,50%)
    //
    // Exemple (Brut = 2000, CNSS = 193,6) :
    //   Revenu Net = 2000 - 193,6 = 1 806,4 DT
    //   CSS = 1 806,4 × 0,5% = 9,032 DT
    //
    // C'est l'appelant (PayrollCalculationService) qui calcule
    // le revenu net et le passe ici en paramètre.
    // ════════════════════════════════════════════════════════════
    public BigDecimal calculateCss(BigDecimal revenuNet, LocalDate payDate) {
        BigDecimal taux = getParam("CSS_TAUX", payDate);

        BigDecimal result = revenuNet.multiply(taux).setScale(3, RoundingMode.HALF_UP);

        log.debug("[CSS] revenu_net={} | taux={} | résultat={}", revenuNet, taux, result);
        return result;
    }

    // ════════════════════════════════════════════════════════════
    // MÉTHODE 4 — IRPP MENSUEL (Point d'entrée)
    //
    // Algorithme en 4 étapes :
    //   4a. Annualiser le revenu net mensuel
    //   4b. Calculer le RANI (Revenu Annuel Net Imposable)
    //       = Revenu annuel - Frais pro - Déductions familiales
    //   4c. Appliquer le barème progressif sur le RANI
    //   4d. Diviser l'IRPP annuel par 12 → IRPP mensuel
    //
    // @param revenuNetMensuel  = Salaire Brut - CNSS Salariale
    //                            (calculé en amont par PayrollCalculationService)
    // @param employee          = pour accéder à chefDeFamille, numberOfChildren
    // @param payDate           = date de référence pour lire les bons paramètres
    // ════════════════════════════════════════════════════════════
    public BigDecimal calculateIrppMensuel(BigDecimal revenuNetMensuel, Employee employee, LocalDate payDate) {
        // ── Étape 4a : Annualiser ──────────────────────────────
        // On travaille en base annuelle pour le barème IRPP
        BigDecimal revenuAnnuelBrut = revenuNetMensuel.multiply(BigDecimal.valueOf(12));

        // ── Étape 4b.1 : Frais professionnels ─────────────────
        // Déduction automatique = 10% du revenu annuel, max 2 000 DT
        // Représente les dépenses liées au travail (transport, vêtements...)
        BigDecimal fpTaux = getParam("FRAIS_PRO_TAUX", payDate); // 0.10
        BigDecimal fpPlafond = getParam("FRAIS_PRO_PLAFOND", payDate); // 2000
        BigDecimal fraisPro = revenuAnnuelBrut.multiply(fpTaux).min(fpPlafond);

        // ── Étape 4b.2 : Déductions familiales ────────────────
        BigDecimal deductionsFamiliales = calculateDeductionsFamiliales(employee, payDate, revenuNetMensuel);

        // ── Étape 4b.3 : RANI final ────────────────────────────
        // Le .max(ZERO) garantit qu'on ne descend jamais en dessous de 0
        BigDecimal rani = revenuAnnuelBrut.subtract(fraisPro).subtract(deductionsFamiliales).max(BigDecimal.ZERO);

        log.debug("[IRPP] revAnnuel={} | fraisPro={} | deducFam={} | RANI={}", revenuAnnuelBrut, fraisPro, deductionsFamiliales, rani);

        // ── Étape 4c : Barème progressif ──────────────────────
        BigDecimal irppAnnuel = applyBaremeProgressif(rani, payDate.getYear());

        // ── Étape 4d : Mensualiser ─────────────────────────────
        BigDecimal irppMensuel = irppAnnuel.divide(BigDecimal.valueOf(12), 3, RoundingMode.HALF_UP);

        log.debug("[IRPP] annuel={} | mensuel={}", irppAnnuel, irppMensuel);
        return irppMensuel;
    }

    // ════════════════════════════════════════════════════════════
    // SOUS-MÉTHODE — Déductions familiales
    //
    // Calcule le total des déductions IRPP liées à la situation
    // personnelle de l'employé. Ces montants réduisent le RANI
    // et donc l'impôt à payer.
    //
    // Déductions actuellement implémentées :
    //   ✅ Chef de famille (Employee.chefDeFamille)
    //   ✅ Enfants à charge standard (Employee.numberOfChildren)
    //   🔜 Sprint 4 : enfants étudiants, infirmes, parents à charge
    // ════════════════════════════════════════════════════════════
    private BigDecimal calculateDeductionsFamiliales(Employee emp, LocalDate payDate, BigDecimal revenuNetMensuel) {
        BigDecimal total = BigDecimal.ZERO;

        // ── Chef de famille : 300 DT/an ────────────────────────
        // Condition : Employee.chefDeFamille = true dans le dossier employé
        if (Boolean.TRUE.equals(emp.getChefDeFamille())) {
            BigDecimal deduction = getParam("DEDUCTION_CHEF_FAMILLE", payDate);
            total = total.add(deduction);
            log.debug("[DEF] Chef de famille : -{} DT", deduction);
        }

        // ── Enfants à charge : 100 DT × nb enfants (max 4) ────
        // Employee.numberOfChildren est saisi dans le dossier employé
        int maxEnfants = getParam("MAX_ENFANTS_DEDUCTIBLES", payDate).intValue(); // 4
        int nbEnfants = Math.min(emp.getNumberOfChildren(), maxEnfants);

        if (nbEnfants > 0) {
            BigDecimal parEnfant = getParam("DEDUCTION_PAR_ENFANT", payDate); // 100
            BigDecimal deductionEnfants = parEnfant.multiply(BigDecimal.valueOf(nbEnfants));
            total = total.add(deductionEnfants);
            log.debug("[DEF] {} enfant(s) × {} DT = -{} DT", nbEnfants, parEnfant, deductionEnfants);
        }

        // ── TODO Sprint 4 : Parents à charge ──────────────────
        // Formule : MIN(5% × revenu annuel net, 450 DT) × nb parents
        // Nécessite un champ numberOfDependentParents sur Employee

        return total;
    }

    // ════════════════════════════════════════════════════════════
    // SOUS-MÉTHODE — Barème progressif
    //
    // Parcourt chaque tranche dans l'ordre croissant.
    // Pour chaque tranche, calcule uniquement la portion du RANI
    // qui tombe dans cette tranche.
    //
    // Trace un log détaillé pour faciliter l'audit.
    // ════════════════════════════════════════════════════════════
    private BigDecimal applyBaremeProgressif(BigDecimal rani, int year) {
        List<TaxBracket> tranches = taxBracketRepository.findByYearOrderBySortOrderAsc(year);

        if (tranches.isEmpty()) {
            // Si les données de base ne sont pas en place → erreur explicite
            throw new IllegalStateException(
                "Aucune tranche IRPP trouvée pour l'année " + year + ". Vérifiez les données dans l'interface Super Admin."
            );
        }

        BigDecimal totalImpot = BigDecimal.ZERO;

        for (TaxBracket tranche : tranches) {
            // Si le RANI est en dessous du seuil minimum de cette tranche
            // → on s'arrête, les tranches suivantes ne s'appliquent pas
            if (rani.compareTo(tranche.getMinIncome()) <= 0) break;

            // Calculer le plafond effectif pour cette tranche
            // Si max_income est NULL (dernière tranche), on prend le RANI directement
            BigDecimal plafondTranche =
                tranche.getMaxIncome() != null
                    ? rani.min(tranche.getMaxIncome()) // limiter au max de la tranche
                    : rani; // pas de plafond → prendre tout

            // Montant imposable dans cette tranche
            BigDecimal montantDansTranche = plafondTranche.subtract(tranche.getMinIncome()).max(BigDecimal.ZERO);

            // Impôt de cette tranche
            BigDecimal impotTranche = montantDansTranche.multiply(tranche.getRate()).setScale(3, RoundingMode.HALF_UP);

            totalImpot = totalImpot.add(impotTranche);

            log.debug(
                "[IRPP tranche {}] {}-{} | dans_tranche={} × {}% = {} DT",
                tranche.getSortOrder(),
                tranche.getMinIncome(),
                tranche.getMaxIncome() != null ? tranche.getMaxIncome() : "∞",
                montantDansTranche,
                tranche.getRate().multiply(BigDecimal.valueOf(100)),
                impotTranche
            );
        }

        return totalImpot.setScale(3, RoundingMode.HALF_UP);
    }

    // ════════════════════════════════════════════════════════════
    // MÉTHODE 5 — TFP (Taxe de Formation Professionnelle)
    //
    // Charge patronale, ne touche pas le salaire de l'employé.
    // Taux différent selon le secteur d'activité de l'entreprise.
    //
    // @param isIndustry  true = secteur industriel (1%)
    //                    false = autres secteurs (2%)
    // ════════════════════════════════════════════════════════════
    public BigDecimal calculateTfp(BigDecimal grossSalary, LocalDate payDate, boolean isIndustry) {
        String key = isIndustry ? "TFP_TAUX_INDUSTRIE" : "TFP_TAUX_AUTRES";
        return grossSalary.multiply(getParam(key, payDate)).setScale(3, RoundingMode.HALF_UP);
    }

    // ════════════════════════════════════════════════════════════
    // MÉTHODE 6 — FOPROLOS
    //
    // Fonds de Promotion du Logement Social : 1% du salaire brut.
    // Charge patronale uniquement.
    // ════════════════════════════════════════════════════════════
    public BigDecimal calculateFoprolos(BigDecimal grossSalary, LocalDate payDate) {
        return grossSalary.multiply(getParam("FOPROLOS_TAUX", payDate)).setScale(3, RoundingMode.HALF_UP);
    }

    // ════════════════════════════════════════════════════════════
    // HELPER CENTRAL — getParam()
    //
    // C'est la méthode la plus importante du service.
    // Elle centralise TOUTES les lectures de paramètres.
    //
    // Si le paramètre n'existe pas en base → exception claire
    // avec le nom de la clé manquante.
    // Cela évite les erreurs silencieuses avec des valeurs null.
    // ════════════════════════════════════════════════════════════
    private BigDecimal getParam(String key, LocalDate date) {
        return paramRepository
            .findActiveByKeyAndDate(key, date)
            .map(RegulatoryParam::getNumericValue)
            .orElseThrow(() ->
                new IllegalStateException(
                    "Paramètre de paie manquant : '" +
                        key +
                        "' à la date " +
                        date +
                        ".\n" +
                        "→ Action requise : insérez ce paramètre via l'interface Super Admin."
                )
            );
    }
}
