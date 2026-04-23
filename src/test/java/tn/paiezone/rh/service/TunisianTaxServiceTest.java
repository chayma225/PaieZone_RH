package tn.paiezone.rh.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.domain.TaxBracket;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.repository.TaxBracketRepository;

@ExtendWith(MockitoExtension.class)
// ✅ AJOUT : Permet d'avoir des stubs non utilisés sans faire échouer les tests
@MockitoSettings(strictness = Strictness.LENIENT)
class TunisianTaxServiceTest {

    @Mock
    private RegulatoryParamRepository paramRepository;

    @Mock
    private TaxBracketRepository taxBracketRepository;

    @InjectMocks
    private TunisianTaxService taxService;

    private final LocalDate JAN_2026 = LocalDate.of(2026, 1, 31);

    @BeforeEach
    void setUp() {
        // Paramètres CNSS
        mockParam("CNSS_TAUX_SALARIAL", "0.0968");
        mockParam("CNSS_PLAFOND_MENSUEL", "5000.000");
        mockParam("CNSS_TAUX_PATRONAL", "0.1657");

        // Paramètres CSS
        mockParam("CSS_TAUX", "0.005");

        // Paramètres IRPP & Frais
        mockParam("FRAIS_PRO_TAUX", "0.10");
        mockParam("FRAIS_PRO_PLAFOND", "2000.000");
        mockParam("DEDUCTION_CHEF_FAMILLE", "300.000");
        mockParam("DEDUCTION_PAR_ENFANT", "100.000");
        mockParam("MAX_ENFANTS_DEDUCTIBLES", "4");

        // Barème IRPP
        when(taxBracketRepository.findByYearOrderBySortOrderAsc(2026)).thenReturn(buildBareme2026());
    }

    @Test
    void cnss_salaireSousPlafond_doitUtiliserSalaireComplet() {
        BigDecimal result = taxService.calculateCnssSalariale(new BigDecimal("1500"), JAN_2026);
        assertThat(result).isEqualByComparingTo(new BigDecimal("145.200"));
    }

    @Test
    void cnss_salaireAuDessusPlafond_doitEtrePlafonneA5000() {
        BigDecimal result = taxService.calculateCnssSalariale(new BigDecimal("7000"), JAN_2026);
        assertThat(result).isEqualByComparingTo(new BigDecimal("484.000"));
    }

    @Test
    void css_calculCorrect() {
        BigDecimal result = taxService.calculateCss(new BigDecimal("1806.400"), JAN_2026);
        assertThat(result).isEqualByComparingTo(new BigDecimal("9.032"));
    }

    @Test
    void irpp_revenuAnnuelInferieur5000_doitEtreZero() {
        BigDecimal result = taxService.calculateIrppMensuel(new BigDecimal("300"), employe(false, 0), JAN_2026);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void irpp_revenuDansTranche15Pct() {
        BigDecimal result = taxService.calculateIrppMensuel(new BigDecimal("700"), employe(false, 0), JAN_2026);
        assertThat(result).isEqualByComparingTo(new BigDecimal("32.000"));
    }

    @Test
    void irpp_chefFamilleAvec2Enfants_doitPayerMoinsQueCelibataire() {
        BigDecimal base = new BigDecimal("2500");
        BigDecimal irppCelibataire = taxService.calculateIrppMensuel(base, employe(false, 0), JAN_2026);
        BigDecimal irppChef = taxService.calculateIrppMensuel(base, employe(true, 2), JAN_2026);
        assertThat(irppChef).isLessThan(irppCelibataire);
    }

    @Test
    void calculComplet_employe2000DT_chefFamille2Enfants() {
        Employee emp = employe(true, 2);
        BigDecimal brut = new BigDecimal("2000");

        BigDecimal cnss = taxService.calculateCnssSalariale(brut, JAN_2026);
        BigDecimal revNet = brut.subtract(cnss);
        BigDecimal css = taxService.calculateCss(revNet, JAN_2026);
        BigDecimal irpp = taxService.calculateIrppMensuel(revNet, emp, JAN_2026);
        BigDecimal net = brut.subtract(cnss).subtract(css).subtract(irpp);

        assertThat(cnss).isEqualByComparingTo(new BigDecimal("193.600"));
        assertThat(css).isEqualByComparingTo(new BigDecimal("9.032"));
        assertThat(irpp).isEqualByComparingTo(new BigDecimal("253.683"));
        assertThat(net).isEqualByComparingTo(new BigDecimal("1543.685"));
    }

    private Employee employe(boolean chefFamille, int nbEnfants) {
        Employee e = new Employee();
        e.setChefDeFamille(chefFamille);
        e.setNumberOfChildren(nbEnfants);
        return e;
    }

    private void mockParam(String key, String value) {
        RegulatoryParam param = new RegulatoryParam();
        param.setParamKey(key);
        param.setNumericValue(new BigDecimal(value));

        // ✅ UTILISATION DE lenient() pour éviter les erreurs si un test n'utilise pas ce paramètre
        lenient().when(paramRepository.findActiveByKeyAndDate(eq(key), any(LocalDate.class))).thenReturn(Optional.of(param));
    }

    private List<TaxBracket> buildBareme2026() {
        return List.of(
            tranche(1, "0", "5000", "0.00"),
            tranche(2, "5000.001", "10000", "0.15"),
            tranche(3, "10000.001", "20000", "0.25"),
            tranche(4, "20000.001", "30000", "0.30"),
            tranche(5, "30000.001", "40000", "0.33"),
            tranche(6, "40000.001", "50000", "0.36"),
            tranche(7, "50000.001", "70000", "0.38"),
            tranche(8, "70000.001", null, "0.40")
        );
    }

    private TaxBracket tranche(int order, String min, String max, String rate) {
        TaxBracket t = new TaxBracket();
        t.setSortOrder(order);
        t.setMinIncome(new BigDecimal(min));
        t.setMaxIncome(max != null ? new BigDecimal(max) : null);
        t.setRate(new BigDecimal(rate));
        t.setYear(2026);
        return t;
    }
}
