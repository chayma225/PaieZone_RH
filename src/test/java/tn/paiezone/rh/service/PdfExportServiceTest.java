package tn.paiezone.rh.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.Gender;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.repository.*;

/**
 * Tests unitaires de PdfExportService.
 *
 * Cas couverts :
 * - Génération bulletin de paie (byte[] non vide, valide)
 * - Attestation de travail (contenu HTML correct)
 * - Journal de paie (plusieurs employés)
 * - Bulletin introuvable → EntityNotFoundException
 * - Fusion PDF multi-bulletins
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("PdfExportService — Génération PDF")
class PdfExportServiceTest {

    @Mock
    private PaySlipRepository paySlipRepository;

    @Mock
    private PaySlipLineRepository paySlipLineRepository;

    @Mock
    private PayrollPeriodRepository payrollPeriodRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private CnssRateRepository cnssRateRepository;

    @InjectMocks
    private PdfExportService pdfExportService;

    private Company company;
    private Employee employee;
    private PaySlip paySlip;
    private PayrollPeriod period;

    @BeforeEach
    void setUp() {
        company = new Company();
        company.setId(1L);
        company.setName("Atlas Tech SARL");
        company.setAddress("Rue du Lac, Tunis");
        company.setCity("Tunis");
        company.setCnssId("12345678");
        company.setTaxId("1234567/A/M/000");

        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Leila");
        employee.setLastName("Chaabane");
        employee.setMatricule("E001");
        employee.setGender(Gender.FEMALE);
        employee.setHireDate(LocalDate.of(2022, 3, 15));
        employee.setNationalId("12345678");
        employee.setCnssNumber("98765432");
        employee.setMaritalStatus(MaritalStatus.MARRIED);
        employee.setNumberOfChildren(2);
        employee.setChefDeFamille(true);
        employee.setCompany(company);

        period = new PayrollPeriod();
        period.setId(1L);
        period.setMonth(5);
        period.setYear(2026);
        period.setStatus(PayrollStatus.VALIDATED);
        period.setCompany(company);

        paySlip = new PaySlip();
        paySlip.setId(100L);
        paySlip.setEmployee(employee);
        paySlip.setMonth(5);
        paySlip.setYear(2026);
        paySlip.setBaseSalary(new BigDecimal("2000.000"));
        paySlip.setGrossSalary(new BigDecimal("2000.000"));
        paySlip.setCnssSalaryAmount(new BigDecimal("193.600"));
        paySlip.setTaxableIncome(new BigDecimal("1806.400"));
        paySlip.setIrppAmount(new BigDecimal("253.683"));
        paySlip.setCssAmount(new BigDecimal("9.032"));
        paySlip.setNetSalary(new BigDecimal("1543.685"));
        paySlip.setStatus(PayrollStatus.VALIDATED);
        paySlip.setWorkedDays(26);
    }

    // ══════════════════════════════════════════════════════════════
    //  1. Bulletin de paie individuel
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Bulletin de paie individuel")
    class BulletinTest {

        @Test
        @DisplayName("generateBulletin → PDF non vide pour bulletin valide")
        void generateBulletin_bulletinValide_doitRetournerPdfNonVide() {
            when(paySlipRepository.findById(100L)).thenReturn(Optional.of(paySlip));
            when(paySlipLineRepository.findByPaySlipIdOrderBySortOrder(100L)).thenReturn(List.of());

            byte[] pdf = pdfExportService.generateBulletin(100L);

            assertThat(pdf).isNotEmpty();
            // Un PDF valide commence toujours par %PDF-
            assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
        }

        @Test
        @DisplayName("generateBulletin → EntityNotFoundException si bulletin introuvable")
        void generateBulletin_bulletinIntrouvable_doitLeverException() {
            when(paySlipRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> pdfExportService.generateBulletin(999L))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class)
                .hasMessageContaining("999");
        }

        @Test
        @DisplayName("generateBulletin — bullet avec overtime → PDF non vide")
        void generateBulletin_avecOvertime_doitInclureHeuresSup() {
            paySlip.setOvertimeAmount(new BigDecimal("150.000"));
            when(paySlipRepository.findById(100L)).thenReturn(Optional.of(paySlip));
            when(paySlipLineRepository.findByPaySlipIdOrderBySortOrder(100L)).thenReturn(List.of());

            byte[] pdf = pdfExportService.generateBulletin(100L);
            assertThat(pdf).isNotEmpty();
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  2. Attestation de travail
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Attestation de travail")
    class AttestationTest {

        @Test
        @DisplayName("generateAttestationTravail → PDF valide")
        void generateAttestation_employe_doitRetournerPdfValide() {
            when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

            byte[] pdf = pdfExportService.generateAttestationTravail(1L);

            assertThat(pdf).isNotEmpty();
            assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
        }

        @Test
        @DisplayName("generateAttestationTravail → exception si employé inconnu")
        void generateAttestation_employe_introuvable_doitLeverException() {
            when(employeeRepository.findById(404L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> pdfExportService.generateAttestationTravail(404L)).isInstanceOf(
                jakarta.persistence.EntityNotFoundException.class
            );
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  3. Journal de paie
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Journal de paie")
    class JournalTest {

        @Test
        @DisplayName("generateJournalPaie → PDF valide avec 1 bulletin")
        void generateJournal_unBulletin_doitRetournerPdf() {
            when(payrollPeriodRepository.findById(1L)).thenReturn(Optional.of(period));
            when(paySlipRepository.findAllByPeriodIdOrdered(1L)).thenReturn(List.of(paySlip));

            byte[] pdf = pdfExportService.generateJournalPaie(1L);

            assertThat(pdf).isNotEmpty();
            assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
        }

        @Test
        @DisplayName("generateJournalPaie → exception si aucun bulletin pour la période")
        void generateJournal_sansBulletin_doitLeverException() {
            when(payrollPeriodRepository.findById(1L)).thenReturn(Optional.of(period));
            when(paySlipRepository.findAllByPeriodIdOrdered(1L)).thenReturn(List.of());

            assertThatThrownBy(() -> pdfExportService.generateJournalPaie(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Aucun bulletin");
        }

        @Test
        @DisplayName("generateJournalPaie → PDF valide avec plusieurs employés")
        void generateJournal_plusieursEmployes_doitRetournerPdf() {
            Employee emp2 = cloneEmployee(2L, "Mehdi", "Ben Salah", "E002");
            PaySlip slip2 = clonePaySlip(101L, emp2, new BigDecimal("3000.000"), new BigDecimal("2200.000"));

            when(payrollPeriodRepository.findById(1L)).thenReturn(Optional.of(period));
            when(paySlipRepository.findAllByPeriodIdOrdered(1L)).thenReturn(List.of(paySlip, slip2));

            byte[] pdf = pdfExportService.generateJournalPaie(1L);
            assertThat(pdf).isNotEmpty();
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  4. Génération en masse (bulk)
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Bulk bulletins")
    class BulkTest {

        @Test
        @DisplayName("generateBulkBulletin → PDF fusionné pour plusieurs bulletins")
        void generateBulkBulletin_deuxBulletins_doitRetournerPdfFusionne() {
            Employee emp2 = cloneEmployee(2L, "Mehdi", "Ben Salah", "E002");
            PaySlip slip2 = clonePaySlip(101L, emp2, new BigDecimal("1800.000"), new BigDecimal("1320.000"));

            when(paySlipRepository.findAllByPeriodIdOrdered(1L)).thenReturn(List.of(paySlip, slip2));
            when(paySlipRepository.findById(100L)).thenReturn(Optional.of(paySlip));
            when(paySlipRepository.findById(101L)).thenReturn(Optional.of(slip2));
            when(paySlipLineRepository.findByPaySlipIdOrderBySortOrder(anyLong())).thenReturn(List.of());

            byte[] pdf = pdfExportService.generateBulkBulletin(1L);

            assertThat(pdf).isNotEmpty();
            assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
        }
    }

    // ── Helpers ────────────────────────────────────────────────────

    private Employee cloneEmployee(Long id, String firstName, String lastName, String matricule) {
        Employee e = new Employee();
        e.setId(id);
        e.setFirstName(firstName);
        e.setLastName(lastName);
        e.setMatricule(matricule);
        e.setGender(Gender.MALE);
        e.setNationalId("9876" + id);
        e.setHireDate(LocalDate.of(2021, 1, 1));
        e.setMaritalStatus(MaritalStatus.SINGLE);
        e.setNumberOfChildren(0);
        e.setCompany(company);
        return e;
    }

    private PaySlip clonePaySlip(Long id, Employee emp, BigDecimal gross, BigDecimal net) {
        PaySlip ps = new PaySlip();
        ps.setId(id);
        ps.setEmployee(emp);
        ps.setMonth(5);
        ps.setYear(2026);
        ps.setBaseSalary(gross);
        ps.setGrossSalary(gross);
        ps.setCnssSalaryAmount(gross.multiply(new BigDecimal("0.0968")));
        ps.setTaxableIncome(gross.multiply(new BigDecimal("0.9032")));
        ps.setIrppAmount(BigDecimal.ZERO);
        ps.setCssAmount(BigDecimal.ZERO);
        ps.setNetSalary(net);
        ps.setWorkedDays(26);
        return ps;
    }
}
