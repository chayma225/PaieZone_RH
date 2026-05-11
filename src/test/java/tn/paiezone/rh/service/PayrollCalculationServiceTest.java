package tn.paiezone.rh.service;

import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.*;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;
import tn.paiezone.rh.service.impl.PayrollCalculationServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollCalculationServiceTest {

    @Mock TunisianTaxService         taxService;
    @Mock EmployeeRepository         employeeRepository;
    @Mock ContractRepository         contractRepository;
    @Mock RubriqueRepository         rubriqueRepository;
    @Mock PaySlipRepository          paySlipRepository;
    @Mock PaySlipLineRepository      paySlipLineRepository;
    @Mock BonusRepository            bonusRepository;
    @Mock AdvanceRepository          advanceRepository;
    @Mock PayrollPeriodRepository    periodRepository;
    @Mock TimeEntryRepository        timeEntryRepository;
    @Mock RegulatoryParamRepository  paramRepository;

    @InjectMocks
    PayrollCalculationServiceImpl calculationService;

    private Employee    employee;
    private PayrollPeriod period;
    private Contract    contract;
    private Company     company;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setName("TestCorp");

        employee = new Employee();
        employee.setId(10L);
        employee.setMatricule("E001");
        employee.setFirstName("Ahmed");
        employee.setLastName("Ben Ali");
        employee.setChefDeFamille(true);
        employee.setNumberOfChildren(2);
        employee.setActive(true);
        employee.setCompany(company);

        period = new PayrollPeriod();
        period.setId(1L);
        period.setMonth(1);
        period.setYear(2026);
        period.setStatus(PayrollStatus.DRAFT);
        period.setCompany(company);

        contract = new Contract();
        contract.setId(1L);
        contract.setBaseSalary(new BigDecimal("2000"));
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setEmployee(employee);
    }

    // ── TEST 1 : Calcul normal ─────────────────────────────────────
    @Test
    void calculatePaySlip_scenarioStandard_doitRetournerBulletinCorrect() {
        // Arrange
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(periodRepository.findById(1L)).thenReturn(Optional.of(period));
        when(contractRepository.findActiveContractByEmployee(eq(10L), any()))
            .thenReturn(Optional.of(contract));
        when(rubriqueRepository.findByCompanyIdAndActiveTrueOrderBySortOrderAsc(1L))
            .thenReturn(List.of());                    // pas de rubriques variables
        when(timeEntryRepository.findValidatedByEmployeeAndMonth(10L, 1, 2026))
            .thenReturn(List.of());                    // pas d'heures sup
        when(bonusRepository.findByEmployeeIdAndMonthAndYear(10L, 1, 2026))
            .thenReturn(List.of());                    // pas de primes
        when(advanceRepository.findApprovedForDeduction(10L, 1, 2026))
            .thenReturn(List.of());                    // pas d'avances
        when(paySlipRepository.findByEmployeeIdAndPayrollPeriodId(10L, 1L))
            .thenReturn(Optional.empty());
        when(paramRepository.findActiveByKeyAndDate(eq("HEURES_MENSUELLES_BASE"), any()))
            .thenReturn(Optional.of(param("HEURES_MENSUELLES_BASE", "173.33")));

        // Simuler TunisianTaxService (déjà testé séparément)
        when(taxService.calculateCnssSalariale(any(), any()))
            .thenReturn(new BigDecimal("193.600"));
        when(taxService.calculateCss(any(), any()))
            .thenReturn(new BigDecimal("9.032"));
        when(taxService.calculateIrppMensuel(any(), any(), any()))
            .thenReturn(new BigDecimal("253.683"));
        when(taxService.calculateCnssPatronale(any(), any()))
            .thenReturn(new BigDecimal("331.400"));
        when(paySlipRepository.save(any())).thenAnswer(inv -> {
            PaySlip ps = inv.getArgument(0);
            ps.setId(100L);
            return ps;
        });

        // Act
        PaySlip result = calculationService.calculatePaySlip(10L, 1L);

        // Assert
        assertThat(result.getGrossSalary()).isEqualByComparingTo("2000.000");
        assertThat(result.getCnssSalaryAmount()).isEqualByComparingTo("193.600");
        assertThat(result.getIrppAmount()).isEqualByComparingTo("253.683");
        assertThat(result.getNetSalary()).isEqualByComparingTo("1543.685");
        assertThat(result.getStatus()).isEqualTo(PayrollStatus.CALCULATED);

        // Vérifier que le bulletin a bien été sauvegardé
        verify(paySlipRepository, times(1)).save(any(PaySlip.class));
    }

    // ── TEST 2 : Période clôturée → exception ─────────────────────
    @Test
    void calculatePaySlip_periodeLocked_doitLeverException() {
        period.setStatus(PayrollStatus.LOCKED);
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(periodRepository.findById(1L)).thenReturn(Optional.of(period));

        assertThatThrownBy(() -> calculationService.calculatePaySlip(10L, 1L))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("clôturée");
    }

    // ── TEST 3 : Pas de contrat actif → exception ──────────────────
    @Test
    void calculatePaySlip_sansContratActif_doitLeverException() {
        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(periodRepository.findById(1L)).thenReturn(Optional.of(period));
        when(contractRepository.findActiveContractByEmployee(eq(10L), any()))
            .thenReturn(Optional.empty());

        assertThatThrownBy(() -> calculationService.calculatePaySlip(10L, 1L))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("contrat actif");
    }

    // ── TEST 4 : Calcul avec prime ────────────────────────────────
    @Test
    void calculatePaySlip_avecPrime_doitAjouterPrimeAuNet() {
        Bonus prime = new Bonus();
        prime.setAmount(new BigDecimal("200"));

        when(employeeRepository.findById(10L)).thenReturn(Optional.of(employee));
        when(periodRepository.findById(1L)).thenReturn(Optional.of(period));
        when(contractRepository.findActiveContractByEmployee(eq(10L), any()))
            .thenReturn(Optional.of(contract));
        when(rubriqueRepository.findByCompanyIdAndActiveTrueOrderBySortOrderAsc(1L))
            .thenReturn(List.of());
        when(timeEntryRepository.findValidatedByEmployeeAndMonth(10L, 1, 2026))
            .thenReturn(List.of());
        when(bonusRepository.findByEmployeeIdAndMonthAndYear(10L, 1, 2026))
            .thenReturn(List.of(prime));              // ← prime de 200 DT
        when(advanceRepository.findApprovedForDeduction(10L, 1, 2026))
            .thenReturn(List.of());
        when(paySlipRepository.findByEmployeeIdAndPayrollPeriodId(10L, 1L))
            .thenReturn(Optional.empty());
        when(paramRepository.findActiveByKeyAndDate(eq("HEURES_MENSUELLES_BASE"), any()))
            .thenReturn(Optional.of(param("HEURES_MENSUELLES_BASE", "173.33")));
        when(taxService.calculateCnssSalariale(any(), any()))
            .thenReturn(new BigDecimal("193.600"));
        when(taxService.calculateCss(any(), any()))
            .thenReturn(new BigDecimal("9.032"));
        when(taxService.calculateIrppMensuel(any(), any(), any()))
            .thenReturn(new BigDecimal("253.683"));
        when(taxService.calculateCnssPatronale(any(), any()))
            .thenReturn(new BigDecimal("331.400"));
        when(paySlipRepository.save(any())).thenAnswer(inv -> {
            PaySlip ps = inv.getArgument(0); ps.setId(100L); return ps;
        });

        PaySlip result = calculationService.calculatePaySlip(10L, 1L);

        // Net = 1543,685 + 200 (prime) = 1743,685
        assertThat(result.getNetSalary()).isEqualByComparingTo("1743.685");
    }

    // ── TEST 5 : Calcul en masse ───────────────────────────────────
    @Test
    void calculateAllPaySlips_doitCalculerTousLesEmployes() {
        Employee emp2 = new Employee();
        emp2.setId(11L);
        emp2.setMatricule("E002");
        emp2.setCompany(company);
        emp2.setChefDeFamille(false);
        emp2.setNumberOfChildren(0);

        when(periodRepository.findById(1L)).thenReturn(Optional.of(period));
        when(employeeRepository.findByCompanyIdAndActiveTrue(1L))
            .thenReturn(List.of(employee, emp2));

        // Simuler calculatePaySlip pour les 2 employés
        PayrollCalculationServiceImpl spy = spy(calculationService);
        doReturn(mockPaySlip(new BigDecimal("1543.685"), new BigDecimal("2000")))
            .when(spy).calculatePaySlip(10L, 1L);
        doReturn(mockPaySlip(new BigDecimal("1200.000"), new BigDecimal("1500")))
            .when(spy).calculatePaySlip(11L, 1L);

        BulkCalculationResultDTO result = spy.calculateAllPaySlips(1L);

        assertThat(result.getTotalEmployees()).isEqualTo(2);
        assertThat(result.getCalculated()).isEqualTo(2);
        assertThat(result.getErrors()).isEqualTo(0);
    }

    // ── Helpers ───────────────────────────────────────────────────
    private RegulatoryParam param(String key, String value) {
        RegulatoryParam p = new RegulatoryParam();
        p.setParamKey(key);
        p.setNumericValue(new BigDecimal(value));
        return p;
    }

    private PaySlip mockPaySlip(BigDecimal net, BigDecimal gross) {
        PaySlip ps = new PaySlip();
        ps.setNetSalary(net);
        ps.setGrossSalary(gross);
        ps.setStatus(PayrollStatus.CALCULATED);
        return ps;
    }
}
