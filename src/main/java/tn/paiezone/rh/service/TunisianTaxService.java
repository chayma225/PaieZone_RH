package tn.paiezone.rh.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.domain.TaxBracket;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.repository.TaxBracketRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

/**
 * Service fiscal tunisien — TOUS les taux sont lus depuis regulatory_param.
 * CnssRate n'est plus utilisé : CNSS_TAUX_SALARIAL, CNSS_TAUX_PATRONAL et
 * CNSS_PLAFOND_MENSUEL sont pilotables par le Super Admin.
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class TunisianTaxService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final RoundingMode RM = RoundingMode.HALF_UP;

    // Valeurs de fallback — utilisées UNIQUEMENT si le paramètre est absent
    // (première installation avant que le Super Admin n'ait configuré les taux)
    private static final BigDecimal DEFAULT_CNSS_SALARIAL    = new BigDecimal("0.0918");
    private static final BigDecimal DEFAULT_CNSS_PATRONAL    = new BigDecimal("0.1657");
    private static final BigDecimal DEFAULT_CNSS_PLAFOND     = new BigDecimal("3000");
    private static final BigDecimal DEFAULT_CAVIS_SALARIE    = new BigDecimal("0.0100");
    private static final BigDecimal DEFAULT_CSS_TAUX         = new BigDecimal("0.0050");
    private static final BigDecimal DEFAULT_TFP_TAUX         = new BigDecimal("0.0100");
    private static final BigDecimal DEFAULT_HS_25            = new BigDecimal("1.2500");
    private static final BigDecimal DEFAULT_HS_50            = new BigDecimal("1.5000");
    private static final BigDecimal DEFAULT_HEURES_MENSUEL   = new BigDecimal("173.33");
    private static final BigDecimal DEFAULT_FRAIS_PRO_TAUX   = new BigDecimal("0.10");
    private static final BigDecimal DEFAULT_FRAIS_PRO_PLAFOND= new BigDecimal("2000");
    private static final BigDecimal DEFAULT_CHEF_FAMILLE     = new BigDecimal("300");
    private static final BigDecimal DEFAULT_PAR_ENFANT       = new BigDecimal("100");
    private static final BigDecimal DEFAULT_MAX_ENFANTS      = new BigDecimal("4");

    private final TaxBracketRepository      taxBracketRepository;
    private final RegulatoryParamRepository regulatoryParamRepository;

    // ═══════════════════════════════════════════════════════════════
    //  CNSS — lus depuis regulatory_param
    // ═══════════════════════════════════════════════════════════════

    /**
     * CNSS salarié : CNSS_TAUX_SALARIAL × min(salaire, CNSS_PLAFOND_MENSUEL)
     * Pilotable par le Super Admin via RegulatoryParam.
     */
    public BigDecimal calculateEmployeeCnss(BigDecimal salary, int year) {
        BigDecimal taux    = getParam("CNSS_TAUX_SALARIAL",   year, DEFAULT_CNSS_SALARIAL);
        BigDecimal plafond = getParam("CNSS_PLAFOND_MENSUEL", year, DEFAULT_CNSS_PLAFOND);
        BigDecimal base    = salary.min(plafond);
        BigDecimal result  = base.multiply(taux).setScale(3, RM);
        log.debug("CNSS salarié | salaire={} plafond={} taux={} → {}", salary, plafond, taux, result);
        return result;
    }

    /**
     * CNSS patronal : CNSS_TAUX_PATRONAL × min(salaire, CNSS_PLAFOND_MENSUEL)
     */
    public BigDecimal calculateEmployerCnss(BigDecimal salary, int year) {
        BigDecimal taux    = getParam("CNSS_TAUX_PATRONAL",   year, DEFAULT_CNSS_PATRONAL);
        BigDecimal plafond = getParam("CNSS_PLAFOND_MENSUEL", year, DEFAULT_CNSS_PLAFOND);
        BigDecimal base    = salary.min(plafond);
        BigDecimal result  = base.multiply(taux).setScale(3, RM);
        log.debug("CNSS patronal | salaire={} plafond={} taux={} → {}", salary, plafond, taux, result);
        return result;
    }

    /**
     * CAVIS salarié : CAVIS_TAUX_SALARIE × salaire (sans plafond)
     */
    public BigDecimal calculateCavisEmployee(BigDecimal salary, int year) {
        BigDecimal taux   = getParam("CAVIS_TAUX_SALARIE", year, DEFAULT_CAVIS_SALARIE);
        BigDecimal result = salary.multiply(taux).setScale(3, RM);
        log.debug("CAVIS salarié | salaire={} taux={} → {}", salary, taux, result);
        return result;
    }

    /**
     * CAVIS patronal : même taux que salarié (symétrique en Tunisie)
     */
    public BigDecimal calculateCavisEmployer(BigDecimal salary, int year) {
        BigDecimal taux   = getParam("CAVIS_TAUX_SALARIE", year, DEFAULT_CAVIS_SALARIE);
        BigDecimal result = salary.multiply(taux).setScale(3, RM);
        log.debug("CAVIS patronal | salaire={} taux={} → {}", salary, taux, result);
        return result;
    }

    /**
     * CSS — Contribution Sociale de Solidarité : CSS_TAUX × base
     * Base = brut - CNSS - CAVIS (CSS ne s'applique PAS sur les cotisations)
     */
    public BigDecimal calculateCss(BigDecimal baseNetCotisations, int year) {
        if (baseNetCotisations == null || baseNetCotisations.compareTo(ZERO) <= 0) return ZERO;
        BigDecimal taux   = getParam("CSS_TAUX", year, DEFAULT_CSS_TAUX);
        BigDecimal result = baseNetCotisations.multiply(taux).setScale(3, RM);
        log.debug("CSS | base={} taux={} → {}", baseNetCotisations, taux, result);
        return result;
    }

    /**
     * CSS avec LocalDate (utilisé par les tests)
     */
    public BigDecimal calculateCss(BigDecimal baseNetCotisations, LocalDate date) {
        return calculateCss(baseNetCotisations, date.getYear());
    }

    /**
     * TFP — Taxe Formation Professionnelle : TFP_TAUX × brut (charge patronale uniquement)
     */
    public BigDecimal calculateTfp(BigDecimal grossSalary, int year) {
        if (grossSalary == null || grossSalary.compareTo(ZERO) <= 0) return ZERO;
        BigDecimal taux   = getParam("TFP_TAUX", year, DEFAULT_TFP_TAUX);
        BigDecimal result = grossSalary.multiply(taux).setScale(3, RM);
        log.debug("TFP patronal | brut={} taux={} → {}", grossSalary, taux, result);
        return result;
    }

    /**
     * Coefficient HS jour (×1.25 par défaut) — depuis TAUX_HS_25
     */
    public BigDecimal getTauxHs25(int year) {
        return getParam("TAUX_HS_25", year, DEFAULT_HS_25);
    }

    /**
     * Coefficient HS nuit/férié (×1.50 par défaut) — depuis TAUX_HS_50
     */
    public BigDecimal getTauxHs50(int year) {
        return getParam("TAUX_HS_50", year, DEFAULT_HS_50);
    }

    /**
     * Taux horaire = baseSalary / HEURES_MENSUELLES_BASE
     */
    public BigDecimal calculateHourlyRate(BigDecimal baseSalary, int year) {
        BigDecimal heures = getParam("HEURES_MENSUELLES_BASE", year, DEFAULT_HEURES_MENSUEL);
        return baseSalary.divide(heures, 4, RM);
    }

    // ═══════════════════════════════════════════════════════════════
    //  IRPP — Algorithme officiel tunisien
    // ═══════════════════════════════════════════════════════════════

    /**
     * IRPP mensuel — Ordre de calcul légal :
     * 1. Base = brut déjà net de CNSS+CAVIS (fourni par le moteur)
     * 2. Annualiser × 12
     * 3. Frais professionnels = min(annuel × FRAIS_PRO_TAUX, FRAIS_PRO_PLAFOND)
     * 4. Déductions personnelles (chef famille, enfants)
     * 5. Revenu imposable annuel = annuel - frais pro - déductions perso
     * 6. Appliquer barème TaxBracket
     * 7. Diviser par 12
     *
     * NOTE : La CSS n'est PAS déductible de la base IRPP en droit tunisien.
     */
    public BigDecimal calculateMonthlyIrpp(BigDecimal monthlyNetOfCotisations, int year, Employee employee) {
        if (monthlyNetOfCotisations == null || monthlyNetOfCotisations.compareTo(ZERO) <= 0)
            return ZERO;

        BigDecimal annuelBrut    = monthlyNetOfCotisations.multiply(BigDecimal.valueOf(12));
        BigDecimal fpTaux        = getParam("FRAIS_PRO_TAUX",    year, DEFAULT_FRAIS_PRO_TAUX);
        BigDecimal fpPlafond     = getParam("FRAIS_PRO_PLAFOND", year, DEFAULT_FRAIS_PRO_PLAFOND);
        BigDecimal fraisPro      = annuelBrut.multiply(fpTaux).min(fpPlafond).setScale(3, RM);
        BigDecimal deducPerso    = calculatePersonalDeductions(year, employee);
        BigDecimal imposableAnnuel = annuelBrut.subtract(fraisPro).subtract(deducPerso).max(ZERO);

        log.debug("IRPP | mensuel={} annuel={} fraisPro={} perso={} imposable={}",
            monthlyNetOfCotisations, annuelBrut, fraisPro, deducPerso, imposableAnnuel);

        BigDecimal irppAnnuel = applyTunisianBrackets(imposableAnnuel, year);
        return irppAnnuel.divide(BigDecimal.valueOf(12), 3, RM);
    }

    /**
     * Variante avec LocalDate (pour les tests)
     */
    public BigDecimal calculateIrppMensuel(BigDecimal base, Employee employee, LocalDate date) {
        return calculateMonthlyIrpp(base, date.getYear(), employee);
    }

    // ═══════════════════════════════════════════════════════════════
    //  API LocalDate — compatibilité tests
    // ═══════════════════════════════════════════════════════════════

    public BigDecimal calculateCnssSalariale(BigDecimal salaireBrut, LocalDate date) {
        return calculateEmployeeCnss(salaireBrut, date.getYear());
    }

    public BigDecimal calculateCnssPatronale(BigDecimal salaireBrut, LocalDate date) {
        return calculateEmployerCnss(salaireBrut, date.getYear());
    }

    // ═══════════════════════════════════════════════════════════════
    //  BARÈME IRPP
    // ═══════════════════════════════════════════════════════════════

    /**
     * Formule officielle tunisienne (méthode simplifiée) :
     * Impôt = (Revenu_Total × Taux_tranche_haute) − Déduction_Forfaitaire_tranche
     */
    private BigDecimal applyTunisianBrackets(BigDecimal annualTaxable, int year) {
        if (annualTaxable.compareTo(ZERO) <= 0) return ZERO;

        List<TaxBracket> brackets = taxBracketRepository.findByYearOrderBySortOrderAsc(year);
        if (brackets.isEmpty()) {
            log.error("Aucun barème IRPP en base pour {}. Vérifiez 05_tax_brackets_seed.xml", year);
            throw new IllegalStateException(
                "Aucun barème IRPP en base pour " + year + ". Contactez l'administrateur.");
        }

        TaxBracket applicable = null;
        for (TaxBracket b : brackets) {
            if (annualTaxable.compareTo(b.getMinIncome()) > 0) {
                applicable = b;
            }
        }

        if (applicable == null || applicable.getRate().compareTo(ZERO) == 0) return ZERO;

        BigDecimal impot = annualTaxable
            .multiply(applicable.getRate())
            .subtract(applicable.getFixedDeduction())
            .max(ZERO)
            .setScale(3, RM);

        log.debug("Barème IRPP | tranche min={} taux={} déd={} → impôt annuel={}",
            applicable.getMinIncome(), applicable.getRate(),
            applicable.getFixedDeduction(), impot);

        return impot;
    }

    // ═══════════════════════════════════════════════════════════════
    //  DÉDUCTIONS PERSONNELLES
    // ═══════════════════════════════════════════════════════════════

    private BigDecimal calculatePersonalDeductions(int year, Employee employee) {
        BigDecimal total = ZERO;

        if (Boolean.TRUE.equals(employee.getChefDeFamille())) {
            total = total.add(getParam("DEDUCTION_CHEF_FAMILLE", year, DEFAULT_CHEF_FAMILLE));
        }

        int maxEnfants = getParam("MAX_ENFANTS_DEDUCTIBLES", year, DEFAULT_MAX_ENFANTS).intValue();
        int nbEnfants  = Math.min(
            employee.getNumberOfChildren() != null ? employee.getNumberOfChildren() : 0,
            maxEnfants
        );

        if (nbEnfants > 0) {
            BigDecimal parEnfant = getParam("DEDUCTION_PAR_ENFANT", year, DEFAULT_PAR_ENFANT);
            total = total.add(parEnfant.multiply(BigDecimal.valueOf(nbEnfants)));
        }

        return total;
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS — getParam avec log ERROR sur fallback
    // ═══════════════════════════════════════════════════════════════

    /**
     * Lit un paramètre réglementaire actif à la date du 31/12/year.
     * Si absent → log ERROR et retourne defaultVal.
     * Si defaultVal est null et le paramètre est absent → IllegalStateException.
     */
    public BigDecimal getParam(String key, int year, BigDecimal defaultVal) {
        return regulatoryParamRepository
            .findActiveByKeyAndDate(key, LocalDate.of(year, 12, 31))
            .map(RegulatoryParam::getNumericValue)
            .orElseGet(() -> {
                if (defaultVal == null) {
                    throw new IllegalStateException(
                        "Paramètre réglementaire obligatoire absent : '" + key +
                            "' pour l'année " + year +
                            ". Configurez ce paramètre dans l'interface Super Admin.");
                }
                log.error(
                    "⚠️ PARAMÈTRE MANQUANT : '{}' pour {}. " +
                        "Valeur de secours utilisée : {}. " +
                        "Action requise : configurer ce paramètre via l'interface Super Admin → Paramètres réglementaires.",
                    key, year, defaultVal
                );
                return defaultVal;
            });
    }

    /**
     * Lit un paramètre par date exacte.
     * Retourne defaultVal si absent (peut être null).
     */
    public BigDecimal getParamByDate(String key, LocalDate date, BigDecimal defaultVal) {
        return regulatoryParamRepository
            .findActiveByKeyAndDate(key, date)
            .map(RegulatoryParam::getNumericValue)
            .orElseGet(() -> {
                if (defaultVal != null) {
                    log.error(
                        "⚠️ PARAMÈTRE MANQUANT : '{}' pour la date {}. Valeur de secours : {}.",
                        key, date, defaultVal
                    );
                }
                return defaultVal;
            });
    }
}
