package tn.paiezone.rh.service;

import com.lowagie.text.Document;
import com.lowagie.text.pdf.PdfCopy;
import com.lowagie.text.pdf.PdfReader;
import jakarta.persistence.EntityNotFoundException;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.xhtmlrenderer.pdf.ITextRenderer;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.Gender;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;
import tn.paiezone.rh.domain.enumeration.RubriqueType;
import tn.paiezone.rh.repository.*;

/**
 * Génération PDF de tous les documents RH/Paie.
 * Utilise Flying Saucer (HTML → PDF via iText 2.x).
 */
@Service
@Transactional(readOnly = true)
public class PdfExportService {

    private static final Logger log = LoggerFactory.getLogger(PdfExportService.class);

    private static final DateTimeFormatter DATE_FR = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final BigDecimal TAUX_AT = new BigDecimal("0.005"); // Accident de travail 0.5%

    private final PaySlipRepository paySlipRepository;
    private final PaySlipLineRepository paySlipLineRepository;
    private final PayrollPeriodRepository payrollPeriodRepository;
    private final EmployeeRepository employeeRepository;
    private final CnssRateRepository cnssRateRepository;

    public PdfExportService(
        PaySlipRepository paySlipRepository,
        PaySlipLineRepository paySlipLineRepository,
        PayrollPeriodRepository payrollPeriodRepository,
        EmployeeRepository employeeRepository,
        CnssRateRepository cnssRateRepository
    ) {
        this.paySlipRepository = paySlipRepository;
        this.paySlipLineRepository = paySlipLineRepository;
        this.payrollPeriodRepository = payrollPeriodRepository;
        this.employeeRepository = employeeRepository;
        this.cnssRateRepository = cnssRateRepository;
    }

    // ═══════════════════════════════════════════════════════════════════
    //  1. BULLETIN DE PAIE
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generateBulletin(Long paySlipId) {
        PaySlip ps = paySlipRepository
            .findById(paySlipId)
            .orElseThrow(() -> new EntityNotFoundException("Bulletin introuvable : " + paySlipId));
        List<PaySlipLine> lines = paySlipLineRepository.findByPaySlipIdOrderBySortOrder(paySlipId);
        String html = buildBulletinHtml(ps, lines);
        log.info("✅ Bulletin PDF généré pour bulletin#{}", paySlipId);
        return htmlToPdf(html);
    }

    public byte[] generateBulkBulletin(Long periodId) {
        List<PaySlip> slips = paySlipRepository.findAllByPeriodIdOrdered(periodId);
        if (slips.isEmpty()) throw new IllegalStateException("Aucun bulletin pour la période #" + periodId);
        List<byte[]> pdfs = slips
            .stream()
            .map(ps -> generateBulletin(ps.getId()))
            .toList();
        return mergePdfs(pdfs);
    }

    private String buildBulletinHtml(PaySlip ps, List<PaySlipLine> lines) {
        Employee emp = ps.getEmployee();
        Company co = emp.getCompany();
        String poste =
            ps.getContract() != null && ps.getContract().getJobTitle() != null
                ? ps.getContract().getJobTitle().toUpperCase()
                : (emp.getPosition() != null ? emp.getPosition().getTitle().toUpperCase() : "—");
        String sf = maritalCode(emp.getMaritalStatus()) + " " + emp.getNumberOfChildren();
        String cnssEmp = Optional.ofNullable(emp.getCnssNumber()).orElse("—");
        String moisLabel = monthLabel(ps.getMonth()) + " " + ps.getYear();
        int workedDays = ps.getWorkedDays() != null ? ps.getWorkedDays() : 26;
        int totalHours = workedDays * 8;

        String singleCopy = buildOneCopy(ps, lines, co, emp, poste, sf, cnssEmp, moisLabel, workedDays, totalHours);

        return (
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>" +
            "body{font-family:Arial,sans-serif;font-size:7.5pt;margin:5mm}" +
            "table{border-collapse:collapse;width:100%}" +
            "td,th{padding:2px 3px;font-size:7pt}" +
            ".copy{border:1px solid #444;padding:3px}" +
            ".sep{width:8px;border-left:2px dashed #aaa}" +
            ".title{font-size:10pt;font-weight:bold;text-align:center}" +
            ".hd{background:#e8e8e8;font-weight:bold;text-align:center;border:1px solid #666;font-size:6.5pt;text-transform:uppercase}" +
            ".c{border:1px solid #888}" +
            ".num{text-align:right}" +
            ".bold{font-weight:bold}" +
            ".net td{font-weight:bold;border-top:2px solid #000}" +
            "</style></head><body>" +
            "<table><tr>" +
            "<td class='copy'>" +
            singleCopy +
            "</td>" +
            "<td class='sep'></td>" +
            "<td class='copy'>" +
            singleCopy +
            "</td>" +
            "</tr></table></body></html>"
        );
    }

    private String buildOneCopy(
        PaySlip ps,
        List<PaySlipLine> lines,
        Company co,
        Employee emp,
        String poste,
        String sf,
        String cnssEmp,
        String moisLabel,
        int workedDays,
        int totalHours
    ) {
        StringBuilder sb = new StringBuilder();

        // ── En-tête entreprise / titre ─────────────────────────────────────────
        sb
            .append("<table><tr>")
            .append("<td style='width:55%'><span class='bold'>")
            .append(esc(co.getName()))
            .append("</span><br/>")
            .append(esc(Optional.ofNullable(co.getAddress()).orElse("")))
            .append("<br/>")
            .append(esc(Optional.ofNullable(co.getCity()).orElse("")))
            .append("</td>")
            .append("<td style='width:45%;text-align:center'><div class='title'>BULLETIN DE PAIE</div></td>")
            .append("</tr></table>");

        // ── N° CNSS entreprise / Mois ─────────────────────────────────────────
        sb
            .append("<table style='margin-top:3px'><tr>")
            .append("<td class='c' style='width:55%'><b>N° C.N.S.S : ")
            .append(esc(Optional.ofNullable(co.getCnssId()).orElse("—")))
            .append("</b></td>")
            .append("<td class='c' style='width:15%'>MOIS DE</td>")
            .append("<td class='c' style='width:30%'><b>")
            .append(moisLabel)
            .append("</b></td>")
            .append("</tr></table>");

        // ── Ligne employé ──────────────────────────────────────────────────────
        sb
            .append("<table style='margin-top:2px'>")
            .append("<tr>")
            .append("<th class='hd' style='width:10%'>MAT.</th>")
            .append("<th class='hd' style='width:42%'>NOM &amp; PRENOM</th>")
            .append("<th class='hd' style='width:13%'>S.F.</th>")
            .append("<th class='hd' style='width:35%'>QUALIFICATION</th>")
            .append("</tr><tr>")
            .append("<td class='c num'>")
            .append(esc(emp.getMatricule()))
            .append("</td>")
            .append("<td class='c bold'>")
            .append(esc(emp.getFirstName() + " " + emp.getLastName().toUpperCase()))
            .append("</td>")
            .append("<td class='c' style='text-align:center'>")
            .append(sf)
            .append("</td>")
            .append("<td class='c'>")
            .append(esc(poste))
            .append("</td>")
            .append("</tr></table>");

        // ── Ligne CNSS employé ─────────────────────────────────────────────────
        sb
            .append("<table style='margin-top:1px'>")
            .append("<tr>")
            .append("<th class='hd' style='width:30%'>N° CNSS</th>")
            .append("<th class='hd' style='width:8%'>CAT.</th>")
            .append("<th class='hd' style='width:7%'>ECH.</th>")
            .append("<th class='hd' style='width:25%'>BASE/TX H.</th>")
            .append("<th class='hd' style='width:20%'>&nbsp;</th>")
            .append("<th class='hd' style='width:10%'>PAIEMENT</th>")
            .append("</tr><tr>")
            .append("<td class='c'>")
            .append(esc(cnssEmp))
            .append("</td>")
            .append("<td class='c'></td><td class='c'></td>")
            .append("<td class='c num'>")
            .append(fmt(ps.getBaseSalary()))
            .append("</td>")
            .append("<td class='c'>Titulaire</td>")
            .append("<td class='c' style='text-align:center'>00</td>")
            .append("</tr></table>");

        // ── Tableau des rubriques ──────────────────────────────────────────────
        sb
            .append("<table style='margin-top:2px'>")
            .append("<tr>")
            .append("<th class='hd' style='width:10%'>CODE</th>")
            .append("<th class='hd' style='width:38%'>DESIGNATION</th>")
            .append("<th class='hd' style='width:12%'>NBJ/HR.</th>")
            .append("<th class='hd' style='width:20%'>REMUNERATION</th>")
            .append("<th class='hd' style='width:20%'>RETENUES</th>")
            .append("</tr>");

        if (!lines.isEmpty()) {
            for (PaySlipLine l : lines) {
                boolean isDeduction = l.getRubriqueType() == RubriqueType.DEDUCTION;
                sb
                    .append("<tr>")
                    .append("<td class='c num'>")
                    .append(esc(l.getRubriqueCode()))
                    .append("</td>")
                    .append("<td class='c'>")
                    .append(esc(l.getRubriqueLabel()))
                    .append("</td>")
                    .append("<td class='c num'>")
                    .append(l.getBase() != null && !isDeduction ? fmt(l.getBase()) : "")
                    .append("</td>")
                    .append("<td class='c num'>")
                    .append(!isDeduction ? fmt(l.getAmount()) : "")
                    .append("</td>")
                    .append("<td class='c num'>")
                    .append(isDeduction ? fmt(l.getAmount()) : "")
                    .append("</td>")
                    .append("</tr>");
            }
        } else {
            // Lignes par défaut depuis les champs PaySlip
            sb.append(rubriqueRow("1000", "SALAIRE DE BASE", String.valueOf(workedDays), fmt(ps.getBaseSalary()), ""));
            if (ps.getBonusTotal() != null && ps.getBonusTotal().compareTo(BigDecimal.ZERO) > 0) sb.append(
                rubriqueRow("1110", "PRIMES", "", fmt(ps.getBonusTotal()), "")
            );
            if (ps.getOvertimeAmount() != null && ps.getOvertimeAmount().compareTo(BigDecimal.ZERO) > 0) sb.append(
                rubriqueRow("1120", "HEURES SUPPLEMENTAIRES", "", fmt(ps.getOvertimeAmount()), "")
            );
            sb.append(rubriqueRow("2000", "SALAIRE BRUT", "", fmt(ps.getGrossSalary()), ""));
            sb.append(rubriqueRow("3000", "C.N.S.S", "", "", fmt(ps.getCnssSalaryAmount())));
            sb.append(rubriqueRow("4000", "IMPOSABLE", "", fmt(ps.getTaxableIncome()), ""));
            sb.append(rubriqueRow("5000", "I.R.P.P", "", "", fmt(ps.getIrppAmount())));
            if (ps.getCssAmount() != null && ps.getCssAmount().compareTo(BigDecimal.ZERO) > 0) sb.append(
                rubriqueRow("5001", "C.S.S", "", "", fmt(ps.getCssAmount()))
            );
            if (ps.getAdvanceDeduction() != null && ps.getAdvanceDeduction().compareTo(BigDecimal.ZERO) > 0) sb.append(
                rubriqueRow("6000", "AVANCE", "", "", fmt(ps.getAdvanceDeduction()))
            );
        }
        // Lignes vides pour espace
        for (int i = 0; i < 4; i++) sb.append(
            "<tr><td class='c'>&nbsp;</td><td class='c'></td><td class='c'></td><td class='c'></td><td class='c'></td></tr>"
        );

        // ── NET À PAYER ────────────────────────────────────────────────────────
        sb
            .append("<tr class='net'>")
            .append("<td class='c bold' colspan='2'>CAISSE</td>")
            .append("<td class='c'></td>")
            .append("<td class='c bold' style='text-align:right'>NET A PAYER</td>")
            .append("<td class='c bold num'>")
            .append(fmt(ps.getNetSalary()))
            .append("</td>")
            .append("</tr></table>");

        sb
            .append("<div style='margin-top:3px;font-size:6.5pt;font-weight:bold'>")
            .append("NOMBRE D'HEURES NORMALES DU MOIS &nbsp;&nbsp; ")
            .append(totalHours)
            .append("</div>");

        return sb.toString();
    }

    private String rubriqueRow(String code, String label, String nbj, String remu, String retenue) {
        return (
            "<tr>" +
            "<td class='c num'>" +
            code +
            "</td>" +
            "<td class='c'>" +
            label +
            "</td>" +
            "<td class='c num'>" +
            nbj +
            "</td>" +
            "<td class='c num'>" +
            remu +
            "</td>" +
            "<td class='c num'>" +
            retenue +
            "</td>" +
            "</tr>"
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    //  2. ATTESTATION DE TRAVAIL
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generateAttestationTravail(Long employeeId) {
        Employee emp = employeeRepository
            .findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + employeeId));
        Company co = emp.getCompany();

        String civility = emp.getGender() == Gender.FEMALE ? "Mme" : "Mr";
        String poste = emp.getPosition() != null ? emp.getPosition().getTitle() : "—";
        String hireDate = emp.getHireDate() != null ? emp.getHireDate().format(DATE_FR) : "—";
        String today = LocalDate.now().format(DATE_FR);
        String city = Optional.ofNullable(co.getCity()).orElse("");
        String address = Optional.ofNullable(co.getAddress()).orElse("") + (city.isEmpty() ? "" : " - " + city);

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>" +
            "body{font-family:'Times New Roman',serif;font-size:12pt;margin:25mm 20mm;line-height:1.8}" +
            ".co-name{font-size:16pt;font-weight:bold;text-align:center}" +
            ".co-sub{font-size:11pt;text-align:center;color:#333}" +
            ".date{text-align:right;margin:20px 0}" +
            ".attest-title{text-align:center;font-size:14pt;font-weight:bold;text-decoration:underline;margin:35px 0}" +
            "p{text-align:justify;margin:12px 0}" +
            ".sig{text-align:right;margin-top:60px}" +
            "</style></head><body>" +
            "<div class='co-name'>" +
            esc(co.getName()) +
            "</div>" +
            (co.getTradeName() != null ? "<div class='co-sub'>" + esc(co.getTradeName()) + "</div>" : "") +
            "<div class='co-sub'>" +
            esc(address) +
            "</div>" +
            "<div class='date'>" +
            city +
            " Le " +
            today +
            "</div>" +
            "<div class='attest-title'>ATTESTATION DE TRAVAIL</div>" +
            "<p>Je soussigné(e) " +
            esc(co.getName()) +
            ", sis(e) à " +
            esc(address) +
            ", " +
            "J'atteste que " +
            civility +
            " <strong>" +
            esc(emp.getFirstName() + " " + emp.getLastName().toUpperCase()) +
            "</strong>, " +
            "titulaire de la carte d'identité nationale N°<strong>" +
            esc(emp.getNationalId()) +
            "</strong>, " +
            "occupe le poste de <strong>" +
            esc(poste) +
            "</strong> depuis le <strong>" +
            hireDate +
            "</strong> jusqu'à ce jour.</p>" +
            "<p>Cette attestation est délivrée à l'intéressé(e) pour valoir ce que de droit.</p>" +
            "<div class='sig'><p><strong>Signature</strong></p><p><strong>" +
            esc(co.getName()) +
            "</strong></p></div>" +
            "</body></html>";

        log.info("✅ Attestation de travail générée pour employé#{}", employeeId);
        return htmlToPdf(html);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  3. JOURNAL DE PAIE
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generateJournalPaie(Long periodId) {
        PayrollPeriod period = payrollPeriodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        List<PaySlip> slips = paySlipRepository.findAllByPeriodIdOrdered(periodId);
        if (slips.isEmpty()) throw new IllegalStateException("Aucun bulletin calculé pour la période #" + periodId);

        Company co = period.getCompany();
        String title = "Journal de paie   " + monthLabel(period.getMonth()) + " " + period.getYear();
        String today = LocalDate.now().format(DATE_FR);

        StringBuilder rows = new StringBuilder();
        BigDecimal tBase = bd0(),
            tPrimes = bd0(),
            tBrut = bd0(),
            tCnss = bd0();
        BigDecimal tImp = bd0(),
            tIrpp = bd0(),
            tCss = bd0(),
            tCavis = bd0();
        BigDecimal tAvance = bd0(),
            tNet = bd0();

        for (PaySlip ps : slips) {
            Employee emp = ps.getEmployee();
            BigDecimal primes = nvl(ps.getBonusTotal());
            BigDecimal css = nvl(ps.getCssAmount());
            BigDecimal cavis = nvl(ps.getCavisAmount());
            BigDecimal avance = nvl(ps.getAdvanceDeduction());
            BigDecimal impot = ps.getIrppAmount().add(css);

            tBase = tBase.add(ps.getBaseSalary());
            tPrimes = tPrimes.add(primes);
            tBrut = tBrut.add(ps.getGrossSalary());
            tCnss = tCnss.add(ps.getCnssSalaryAmount());
            tImp = tImp.add(ps.getTaxableIncome());
            tIrpp = tIrpp.add(ps.getIrppAmount());
            tCss = tCss.add(css);
            tCavis = tCavis.add(cavis);
            tAvance = tAvance.add(avance);
            tNet = tNet.add(ps.getNetSalary());

            rows
                .append("<tr>")
                .append(td(emp.getMatricule()))
                .append(td(emp.getFirstName() + " " + emp.getLastName().toUpperCase()))
                .append(tdr(fmt(ps.getBaseSalary())))
                .append(tdr(ps.getWorkedDays() != null ? ps.getWorkedDays().toString() : "26"))
                .append(tdr(fmt(ps.getBaseSalary())))
                .append(tdr(fmt(primes)))
                .append(tdr(fmt(ps.getGrossSalary())))
                .append(tdr(fmt(ps.getCnssSalaryAmount())))
                .append(tdr(fmt(ps.getTaxableIncome())))
                .append(tdr(fmt(ps.getIrppAmount())))
                .append(tdr(fmt(css)))
                .append(tdr(fmt(impot)))
                .append(tdr(avance.compareTo(BigDecimal.ZERO) > 0 ? fmt(avance) : ""))
                .append(tdr(""))
                .append(tdr(fmt(ps.getNetSalary())))
                .append("</tr>");
        }

        // Ligne total
        BigDecimal totalImpot = tIrpp.add(tCss);
        rows
            .append("<tr style='font-weight:bold;background:#f0f0f0;border-top:2px solid #555'>")
            .append("<td class='c' colspan='2'>Nombre salariés : " + slips.size() + " &nbsp;&nbsp; Total Journal</td>")
            .append(tdr(fmt(tBase)))
            .append(tdr(""))
            .append(tdr(fmt(tBrut)))
            .append(tdr(fmt(tPrimes)))
            .append(tdr(fmt(tBrut)))
            .append(tdr(fmt(tCnss)))
            .append(tdr(fmt(tImp)))
            .append(tdr(fmt(tIrpp)))
            .append(tdr(fmt(tCss)))
            .append(tdr(fmt(totalImpot)))
            .append(tdr(fmt(tAvance)))
            .append(tdr(""))
            .append(tdr(fmt(tNet)))
            .append("</tr>");

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>" +
            "body{font-family:Arial,sans-serif;font-size:7pt;margin:8mm}" +
            "table{border-collapse:collapse;width:100%}" +
            ".c{border:1px solid #999}" +
            "td.c,th.c{padding:2px 3px}" +
            "th.c{background:#d8d8d8;text-align:center;font-size:6.5pt;font-weight:bold;text-transform:uppercase}" +
            ".r{text-align:right}" +
            ".page-n{text-align:right;font-size:7pt;margin-top:4px}" +
            "</style></head><body>" +
            "<table style='border:0;margin-bottom:6px'><tr>" +
            "<td style='font-size:11pt;font-weight:bold'>" +
            esc(co.getName()) +
            "</td>" +
            "<td style='text-align:right;font-size:8pt'>Date Tirage : " +
            today +
            "</td>" +
            "</tr></table>" +
            "<div style='font-size:12pt;font-weight:bold;text-align:center;margin-bottom:8px'>" +
            esc(title) +
            "</div>" +
            "<table>" +
            "<thead><tr>" +
            "<th class='c'>Matricul</th><th class='c'>Nom et Prénom</th>" +
            "<th class='c'>THX/SBASE</th><th class='c'>H/J</th><th class='c'>Base</th>" +
            "<th class='c'>Primes</th><th class='c'>Brut</th><th class='c'>C.N.S.S</th>" +
            "<th class='c'>Imposable</th><th class='c'>IRPP</th><th class='c'>Contribution</th>" +
            "<th class='c'>Impôt</th><th class='c'>Avance</th><th class='c'>Prêt</th>" +
            "<th class='c'>Net à payer</th>" +
            "</tr></thead><tbody>" +
            rows +
            "</tbody></table>" +
            "<div class='page-n'>1 / 1</div>" +
            "</body></html>";

        log.info("✅ Journal de paie généré pour période#{}", periodId);
        return htmlToPdf(html);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  4. ÉTAT RÉCAPITULATIF CNSS
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generateCnssRecap(Long periodId) {
        PayrollPeriod period = payrollPeriodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        List<PaySlip> slips = paySlipRepository.findAllByPeriodIdOrdered(periodId);
        if (slips.isEmpty()) throw new IllegalStateException("Aucun bulletin pour la période #" + periodId);

        Company co = period.getCompany();
        int year = period.getYear();
        int q = quarter(period.getMonth());

        // Taux CNSS depuis la base ou valeurs par défaut
        BigDecimal tauxSS = cnssRateRepository
            .findByYear(year)
            .map(r -> r.getEmployeeRate().add(r.getEmployerRate()).add(nvl(r.getCavisEmployee())))
            .orElse(new BigDecimal("0.2675"));

        // Totaux depuis les bulletins de la période
        BigDecimal totalBrut = slips.stream().map(PaySlip::getGrossSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal montantSS = totalBrut.multiply(tauxSS).setScale(3, RoundingMode.HALF_UP);
        BigDecimal montantAT = totalBrut.multiply(TAUX_AT).setScale(3, RoundingMode.HALF_UP);
        BigDecimal totalAPayer = montantSS.add(montantAT);
        String montantEnLettres = numberToWords(totalAPayer);

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>" +
            "body{font-family:Arial,sans-serif;font-size:8pt;margin:8mm}" +
            "table{border-collapse:collapse}" +
            ".c{border:1px solid #888}" +
            "td.c,th.c{padding:3px 5px}" +
            "th.c{background:#e0e0e0;font-weight:bold;text-align:center;font-size:7.5pt}" +
            ".bold{font-weight:bold}" +
            ".r{text-align:right}" +
            ".box{border:2px solid #000}" +
            ".main-title{font-size:13pt;font-weight:bold;text-align:center;padding:8px;border-bottom:1px solid #000;margin:0}" +
            "</style></head><body>" +
            // Header République
            "<table style='width:100%;border:0;margin-bottom:8px'><tr>" +
            "<td style='font-size:7.5pt;font-weight:bold;vertical-align:top'>" +
            "République Tunisienne<br/>Ministère des Affaires Sociales<br/>" +
            "<b>Caisse Nationale de Sécurité Sociale</b><br/>" +
            "49, Av. TAIEB MHIRI Tel : 71.796.744" +
            "</td></tr></table>" +
            // Boîte principale
            "<div class='box'>" +
            "<div class='main-title'>ETAT RECAPITULATIF DES SALAIRES ET APPOINTEMENTS</div>" +
            "<table style='width:100%;border:0'><tr>" +
            // Colonne gauche
            "<td style='width:38%;border-right:1px solid #888;vertical-align:top;padding:8px'>" +
            "<div class='bold' style='font-size:7.5pt'>REPUBLIQUE TUNISIENNE<br/>MINISTERE<br/>" +
            "DES AFFAIRES SOCIALES ET DE LA SOLIDARITE<br/>" +
            "<b>CAISSE NATIONALE DE SECURITE</b></div>" +
            "<table style='margin-top:8px'>" +
            "<tr><td class='c'><b>TR</b></td><td class='c'><b>Année</b></td><td class='c'><b>N° Employeur</b></td><td class='c'><b>BR</b></td></tr>" +
            "<tr><td class='c'>" +
            q +
            "</td><td class='c'>" +
            year +
            "</td><td class='c'>" +
            esc(Optional.ofNullable(co.getCnssId()).orElse("—")) +
            "</td><td class='c'>&nbsp;</td></tr>" +
            "</table>" +
            "<table style='margin-top:6px'><tr><td class='c'>Permanents</td><td class='c'>Occasionnels</td><td class='c'>Nbre Tot. Salariés</td></tr>" +
            "<tr><td class='c'></td><td class='c'></td><td class='c' style='text-align:center'><b>" +
            slips.size() +
            "</b></td></tr></table>" +
            "<div style='margin-top:8px;font-size:7.5pt'>Date d'arrivée :<br/>Mode paiement par :<br/>Montant :<br/>" +
            "Caisse le : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; sur banque<br/>Chèque N° :<br/>Virement bancaire sur :<br/>Mondat N° :</div>" +
            "<div style='margin-top:8px'><b>" +
            esc(montantEnLettres) +
            "</b></div>" +
            "</td>" +
            // Colonne droite
            "<td style='width:62%;vertical-align:top;padding:8px'>" +
            "<div style='font-size:18pt;font-weight:bold'>P P</div>" +
            "<div style='font-size:12pt;font-weight:bold;margin:4px 0'>" +
            esc(co.getName()) +
            "</div>" +
            "<div style='font-size:9pt'>" +
            esc(Optional.ofNullable(co.getAddress()).orElse("")) +
            "</div>" +
            "<table style='width:100%;margin-top:10px'>" +
            "<tr><th class='c'>Nature</th><th class='c'>Salaires déclarés</th><th class='c'>Taux Cotisations</th><th class='c'>Montant à payer</th></tr>" +
            "<tr><td class='c'>Sécurité Social</td><td class='c r'>" +
            fmt(totalBrut) +
            "</td>" +
            "<td class='c r'>" +
            fmt(tauxSS.multiply(new BigDecimal("100")).setScale(2, RoundingMode.HALF_UP)) +
            "</td>" +
            "<td class='c r'>" +
            fmt(montantSS) +
            "</td></tr>" +
            "<tr><td class='c'>Accident de travail</td><td class='c r'>" +
            fmt(totalBrut) +
            "</td>" +
            "<td class='c r'>0,50</td><td class='c r'>" +
            fmt(montantAT) +
            "</td></tr>" +
            "<tr><td class='c' colspan='2'>Pénalités</td><td class='c'>Nbre de jours</td><td class='c'></td></tr>" +
            "<tr><td class='c' colspan='3' style='text-align:right;font-weight:bold'>Total à payer</td>" +
            "<td class='c r bold'>" +
            fmt(totalAPayer) +
            "</td></tr>" +
            "</table>" +
            "<table style='width:100%;border:0;margin-top:12px'><tr>" +
            "<td>OBSERVATIONS</td>" +
            "<td style='text-align:right'>Fait à ............, Le ...............<br/><br/>" +
            "Cachet<br/>de l'Entreprise<br/><br/>Signature de l'Employeur</td>" +
            "</tr></table>" +
            "</td></tr></table></div>" +
            // Accusé de réception
            "<div style='border-top:2px dashed #000;margin-top:12px'></div>" +
            "<div style='font-size:13pt;font-weight:bold;text-align:center;margin:6px 0'>ACCUSE DE RECEPTION</div>" +
            "<table style='width:100%;border:1px solid #000;border-collapse:collapse'><tr>" +
            "<td style='width:50%;border-right:1px solid #000;padding:8px;vertical-align:top;font-size:7.5pt'>" +
            "<table style='border-collapse:collapse'><tr><th class='c'>TR</th><th class='c'>Année</th><th class='c'>N° Employeur</th><th class='c'>BR</th></tr>" +
            "<tr><td class='c'>&nbsp;</td><td class='c'></td><td class='c'></td><td class='c'></td></tr></table><br/>" +
            "Chèque N° ................................................................<br/>" +
            "sur .......................<br/>du ........................ déposé le ..............<br/>" +
            "Montant ................................................................<br/><br/>" +
            "Ce règlement est effectué sous réserve de toute vérification éventuelle et de tout autre dû" +
            "</td>" +
            "<td style='width:50%;padding:8px;vertical-align:top;font-size:7.5pt'>" +
            "<div style='font-weight:bold;text-align:center'>CAISSE NATIONALE DE SECURITE SOCIALE</div>" +
            "<div>Bureau Régional : ..............................<br/><br/>Le ..............................<br/><br/>" +
            "L'agent de controle &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; cachet</div>" +
            "</td></tr></table>" +
            "</body></html>";

        log.info("✅ Récap CNSS généré pour période#{}", periodId);
        return htmlToPdf(html);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  5. DÉCLARATION TRIMESTRIELLE DES SALAIRES
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generateDeclarationTrimestrielle(Long periodId) {
        PayrollPeriod period = payrollPeriodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        Company co = period.getCompany();
        int year = period.getYear();
        int q = quarter(period.getMonth());
        int m1 = (q - 1) * 3 + 1,
            m2 = m1 + 1,
            m3 = m1 + 2;

        // Bulletins des 3 mois du trimestre
        List<PaySlip> m1Slips = paySlipRepository.findByEmployee_Company_IdAndMonthAndYear(co.getId(), m1, year);
        List<PaySlip> m2Slips = paySlipRepository.findByEmployee_Company_IdAndMonthAndYear(co.getId(), m2, year);
        List<PaySlip> m3Slips = paySlipRepository.findByEmployee_Company_IdAndMonthAndYear(co.getId(), m3, year);

        // Regrouper par employé (matricule comme clé)
        Map<Long, PaySlip[]> byEmployee = new LinkedHashMap<>();
        for (PaySlip ps : m1Slips) byEmployee.computeIfAbsent(ps.getEmployee().getId(), k -> new PaySlip[3])[0] = ps;
        for (PaySlip ps : m2Slips) byEmployee.computeIfAbsent(ps.getEmployee().getId(), k -> new PaySlip[3])[1] = ps;
        for (PaySlip ps : m3Slips) byEmployee.computeIfAbsent(ps.getEmployee().getId(), k -> new PaySlip[3])[2] = ps;

        // Si aucun bulletin, charger les employés actifs de la company
        if (byEmployee.isEmpty()) throw new IllegalStateException("Aucun bulletin pour le trimestre " + q + "/" + year);

        StringBuilder rows = new StringBuilder();
        BigDecimal sumM1 = bd0(),
            sumM2 = bd0(),
            sumM3 = bd0(),
            sumTotal = bd0();
        int ordre = 1;
        for (Map.Entry<Long, PaySlip[]> e : byEmployee.entrySet()) {
            PaySlip[] arr = e.getValue();
            PaySlip ref = arr[0] != null ? arr[0] : arr[1] != null ? arr[1] : arr[2];
            Employee emp = ref.getEmployee();
            BigDecimal g1 = arr[0] != null ? arr[0].getGrossSalary() : bd0();
            BigDecimal g2 = arr[1] != null ? arr[1].getGrossSalary() : bd0();
            BigDecimal g3 = arr[2] != null ? arr[2].getGrossSalary() : bd0();
            BigDecimal total = g1.add(g2).add(g3);
            sumM1 = sumM1.add(g1);
            sumM2 = sumM2.add(g2);
            sumM3 = sumM3.add(g3);
            sumTotal = sumTotal.add(total);

            String cnssNum = Optional.ofNullable(emp.getCnssNumber()).orElse("—");
            String[] parts = cnssNum.split("(?<=\\d{8})"); // Séparation matricule/clé
            String mat = parts.length > 0 ? cnssNum.substring(0, Math.min(8, cnssNum.length())) : cnssNum;
            String cle = cnssNum.length() > 8 ? cnssNum.substring(8) : "";
            String poste = emp.getPosition() != null ? emp.getPosition().getTitle() : "—";

            rows
                .append("<tr>")
                .append(td(String.valueOf(ordre++)))
                .append(td(mat))
                .append(td(cle))
                .append(td(emp.getFirstName() + " " + emp.getLastName().toUpperCase()))
                .append(td(String.valueOf(ordre - 1)))
                .append(td(poste.toUpperCase()))
                .append(tdr(fmt(g1)))
                .append(tdr(fmt(g2)))
                .append(tdr(fmt(g3)))
                .append(tdr(fmt(total)))
                .append("</tr>");
        }

        rows
            .append("<tr style='font-weight:bold;background:#f0f0f0'>")
            .append("<td class='c' colspan='6' style='text-align:right'>Total</td>")
            .append(tdr(fmt(sumM1)))
            .append(tdr(fmt(sumM2)))
            .append(tdr(fmt(sumM3)))
            .append(tdr(fmt(sumTotal)))
            .append("</tr>");

        String montantLettres = numberToWords(sumTotal);

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>" +
            "body{font-family:Arial,sans-serif;font-size:7.5pt;margin:8mm}" +
            "table{border-collapse:collapse}" +
            ".c{border:1px solid #888}" +
            "td.c,th.c{padding:2px 4px}" +
            "th.c{background:#ddd;font-weight:bold;text-align:center;font-size:7pt;text-transform:uppercase}" +
            ".r{text-align:right}" +
            "</style></head><body>" +
            "<table style='width:100%;border:0;margin-bottom:8px'><tr>" +
            "<td style='width:42%;font-size:7.5pt;font-weight:bold;vertical-align:top'>" +
            "REPUBLIQUE TUNISIENNE<br/>MINISTRE DES AFFAIRES SOCIALES<br/>ET DE LA SOLIDARITE<br/>" +
            "<b>CAISSE NATIONALE DE LA<br/>SECURITE SOCIALE</b><br/>" +
            "49, Av. TAIEB MHIRI Tel : 71.796.744" +
            "</td>" +
            "<td style='width:58%;vertical-align:top'>" +
            "<div style='font-size:12pt;font-weight:bold;text-align:center'>DECLARATION TRIMESTRIELLE DES SALARIES ET DES SALAIRES</div>" +
            "<div style='text-align:center;font-style:italic;font-size:7pt;margin-top:4px'>" +
            "doit être remise à la caisse sous peine de pénalités dans les 15 premiers jours qui suivent le trimestre.</div>" +
            "</td></tr></table>" +
            "<table style='width:100%;border:0;margin-bottom:8px'><tr>" +
            "<td style='width:38%;vertical-align:top'>" +
            "<table><tr><td class='c' style='font-weight:bold'>N° Employeur</td><td class='c'>" +
            esc(Optional.ofNullable(co.getCnssId()).orElse("—")) +
            "</td></tr>" +
            "<tr><td class='c'>BR :</td><td class='c'>Trimestre " +
            q +
            "</td></tr>" +
            "<tr><td class='c'>Page N° :</td><td class='c'>1 &nbsp;&nbsp; Année : " +
            year +
            "</td></tr></table>" +
            "</td>" +
            "<td style='width:62%;vertical-align:top'>" +
            "<div style='font-weight:bold;margin-bottom:4px'>Nom et Adresse de L'employeur</div>" +
            "<table style='width:100%;border:1px solid #888;border-collapse:collapse'>" +
            "<tr><td style='padding:4px'>" +
            esc(co.getName()) +
            "</td></tr>" +
            "<tr><td style='padding:4px'>" +
            esc(Optional.ofNullable(co.getAddress()).orElse("")) +
            "</td></tr>" +
            "</table></td></tr></table>" +
            "<table style='width:100%'>" +
            "<thead><tr>" +
            "<th class='c' rowspan='2'>N° Ordre</th>" +
            "<th class='c' rowspan='2'>Matricule</th>" +
            "<th class='c' rowspan='2'>Clé</th>" +
            "<th class='c' rowspan='2'>Identité de salarié</th>" +
            "<th class='c' rowspan='2'>N° chez Employeur</th>" +
            "<th class='c' rowspan='2'>Catégorie Professionnel</th>" +
            "<th class='c' colspan='4'>RENUMERATION MENSUELLE</th>" +
            "</tr><tr>" +
            "<th class='c'>1er mois</th><th class='c'>2ème mois</th><th class='c'>3ème mois</th><th class='c'>Total Général</th>" +
            "</tr></thead><tbody>" +
            rows +
            "</tbody></table>" +
            "<table style='width:100%;border:0;margin-top:10px'><tr>" +
            "<td style='vertical-align:top'>Certifié sincère et conforme à nos documents comptable et arrétéé à la somme de :<br/>" +
            "<b>" +
            esc(montantLettres) +
            "</b></td>" +
            "<td style='text-align:right;vertical-align:top'>Fait à ................................ le................................<br/><br/>" +
            "Cachet et signature de l'employeur</td>" +
            "</tr></table>" +
            "</body></html>";

        log.info("✅ Déclaration trimestrielle T{}/{} générée pour period#{}", q, year, periodId);
        return htmlToPdf(html);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  6. CERTIFICAT DE RETENUE D'IMPÔT (RI)
    // ═══════════════════════════════════════════════════════════════════

    public byte[] generateCertificatRI(Long employeeId, int year) {
        Employee emp = employeeRepository
            .findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + employeeId));
        Company co = emp.getCompany();

        // Agréger tous les bulletins de l'année
        List<PaySlip> yearSlips = paySlipRepository.findByEmployee_Company_IdAndMonthAndYear(co.getId(), 1, year);
        // Charger tous les mois
        List<PaySlip> allSlips = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            paySlipRepository
                .findByEmployee_Company_IdAndMonthAndYear(co.getId(), m, year)
                .stream()
                .filter(ps -> ps.getEmployee().getId().equals(employeeId))
                .forEach(allSlips::add);
        }

        if (allSlips.isEmpty()) throw new IllegalStateException("Aucun bulletin pour employé#" + employeeId + " en " + year);

        BigDecimal annualTaxable = allSlips.stream().map(PaySlip::getTaxableIncome).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal annualIRPP = allSlips.stream().map(PaySlip::getIrppAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal annualCSS = allSlips
            .stream()
            .map(ps -> nvl(ps.getCssAmount()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal annualContrib = annualCSS; // CSS = contribution
        BigDecimal annualNet = allSlips.stream().map(PaySlip::getNetSalary).reduce(BigDecimal.ZERO, BigDecimal::add);

        String poste =
            allSlips.get(0).getContract() != null && allSlips.get(0).getContract().getJobTitle() != null
                ? allSlips.get(0).getContract().getJobTitle()
                : (emp.getPosition() != null ? emp.getPosition().getTitle() : "—");

        // Période: 01/01/year au 31/12/year (ou dates réelles du premier/dernier bulletin)
        String startPeriod = LocalDate.of(year, 1, 1).format(DATE_FR);
        String endPeriod = LocalDate.of(year, 12, 31).format(DATE_FR);
        String today = LocalDate.now().format(DATE_FR);
        String city = Optional.ofNullable(co.getCity()).orElse("");

        String html =
            "<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>" +
            "body{font-family:Arial,sans-serif;font-size:8.5pt;margin:12mm}" +
            "table{border-collapse:collapse}" +
            ".c{border:1px solid #888}" +
            "td.c,th.c{padding:3px 5px}" +
            "th.c{background:#e0e0e0;font-weight:bold;text-align:center;font-size:8pt}" +
            ".bold{font-weight:bold}" +
            ".r{text-align:right}" +
            "h1{font-size:12pt;font-weight:bold;text-align:center;margin:4px 0}" +
            ".outer{border:2px solid #000;padding:10px}" +
            ".sl{font-weight:bold;font-size:9pt;margin:8px 0 3px 0}" +
            ".year-box{border:2px solid #000;display:inline;padding:2px 8px;font-size:12pt;font-weight:bold}" +
            "</style></head><body>" +
            // Header
            "<table style='width:100%;border:0;margin-bottom:12px'><tr>" +
            "<td style='width:38%;font-size:7.5pt;font-weight:bold;vertical-align:top'>" +
            "REPUBLIQUE TUNISIENNE<br/>MINISTRE DES FINANCES<br/>" +
            "<b>DIRECTION GENERALE<br/>DU CONTROLE FISCAL</b>" +
            "</td>" +
            "<td style='width:62%;text-align:center;vertical-align:top'>" +
            "<h1>Certificat de retenue d'impôt sur le revenu au titre</h1>" +
            "<h1>des traitements, salaires, pensions et rentes viagères</h1>" +
            "<div style='margin-top:6px'>Retenue effectuée durant l'année &nbsp;<span class='year-box'>" +
            year +
            "</span></div>" +
            "</td></tr></table>" +
            "<div class='outer'>" +
            // Employeur
            "<div class='sl'>A. - Employeur ou organisme payeur</div>" +
            "<table style='width:100%'><tr>" +
            "<td style='width:65%'>" +
            "Nom, prénom ou raison sociale : <b>" +
            esc(co.getName()) +
            "</b><br/>" +
            "Adresse : <b>" +
            esc(Optional.ofNullable(co.getAddress()).orElse("")) +
            ", " +
            esc(city) +
            "</b>" +
            "</td>" +
            "<td style='width:35%;vertical-align:top'>" +
            "<table style='font-size:7.5pt'><tr><th class='c'>Matricule fiscal</th><th class='c'>Code TVA</th><th class='c'>Code catégorie</th><th class='c'>N° Ets sec.</th></tr>" +
            "<tr><td class='c'>" +
            esc(Optional.ofNullable(co.getTaxId()).orElse("")) +
            "</td><td class='c'></td><td class='c'></td><td class='c'></td></tr></table>" +
            "</td></tr></table>" +
            // Bénéficiaire
            "<div class='sl'>B. - Désignation bénéficiaire</div>" +
            "<table style='width:100%'><tr>" +
            "<td style='width:55%;vertical-align:top'>" +
            "Nom et prénoms : <b>" +
            esc(emp.getFirstName() + " " + emp.getLastName().toUpperCase()) +
            "</b><br/>" +
            "Adresse de résidence : " +
            esc(Optional.ofNullable(emp.getCity()).orElse(city)) +
            "<br/>" +
            "Emploi occupé : <b>" +
            esc(poste.toUpperCase()) +
            "</b><br/>" +
            "Période du travail durant l'année : <b>" +
            startPeriod +
            "</b> au <b>" +
            endPeriod +
            "</b>" +
            "</td>" +
            "<td style='width:45%;vertical-align:top'>" +
            "<table><tr><th class='c'>Situation de famille</th><th class='c'>Nb. d'enfants pris en considération pour le calcul de la retenue</th></tr>" +
            "<tr><td class='c' style='text-align:center'>" +
            maritalCode(emp.getMaritalStatus()) +
            "</td>" +
            "<td class='c' style='text-align:center'>" +
            emp.getNumberOfChildren() +
            "</td></tr></table><br/>" +
            "N° carte d'identité : <b>" +
            esc(emp.getNationalId()) +
            "</b><br/>" +
            "Matricule C.N.S.S : " +
            esc(Optional.ofNullable(emp.getCnssNumber()).orElse("—")) +
            "</td></tr></table>" +
            // Montants
            "<table style='width:100%;margin-top:10px'>" +
            "<tr>" +
            "<th class='c'>Revenu imposable (a)</th>" +
            "<th class='c'>Valeur avantages en nature (b)</th>" +
            "<th class='c'>Total revenu brut imposable (a+b)</th>" +
            "<th class='c'>Revenu réinvesti</th>" +
            "<th class='c'>Montant Contribution</th>" +
            "<th class='c'>Montant des retenues</th>" +
            "<th class='c'>Revenu net de retenues</th>" +
            "</tr><tr>" +
            "<td class='c r'>" +
            fmt(annualTaxable) +
            "</td>" +
            "<td class='c r'></td>" +
            "<td class='c r'>" +
            fmt(annualTaxable) +
            "</td>" +
            "<td class='c r'></td>" +
            "<td class='c r'>" +
            fmt(annualContrib) +
            "</td>" +
            "<td class='c r'>" +
            fmt(annualIRPP) +
            "</td>" +
            "<td class='c r'>" +
            fmt(annualNet) +
            "</td>" +
            "</tr></table>" +
            "</div>" +
            // Signature
            "<div style='margin-top:12px;font-size:7.5pt;text-align:justify'>" +
            "Je soussigné, certifie exacts et sincères les renseignements figurant sur le présent certificat et " +
            "m'expose aux sanctions prévues par la loi pour toute inexactitude." +
            "</div>" +
            "<div style='text-align:right;margin-top:15px'>A " +
            esc(city) +
            ", le " +
            today +
            "<br/><br/>" +
            "Cachet et signature de l'employeur ou du débirentier</div>" +
            "</body></html>";

        log.info("✅ Certificat RI généré pour employé#{} année {}", employeeId, year);
        return htmlToPdf(html);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  UTILITAIRES PDF
    // ═══════════════════════════════════════════════════════════════════

    private byte[] htmlToPdf(String html) {
        try {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF : " + e.getMessage(), e);
        }
    }

    private byte[] mergePdfs(List<byte[]> pdfs) {
        if (pdfs.isEmpty()) return new byte[0];
        if (pdfs.size() == 1) return pdfs.get(0);
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document document = null;
            PdfCopy copy = null;
            for (byte[] pdfBytes : pdfs) {
                PdfReader reader = new PdfReader(pdfBytes);
                int n = reader.getNumberOfPages();
                if (document == null) {
                    document = new Document(reader.getPageSizeWithRotation(1));
                    copy = new PdfCopy(document, baos);
                    document.open();
                }
                for (int i = 1; i <= n; i++) {
                    copy.addPage(copy.getImportedPage(reader, i));
                }
                reader.close();
            }
            if (document != null) document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur fusion PDF : " + e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    //  UTILITAIRES HTML / FORMAT
    // ═══════════════════════════════════════════════════════════════════

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String fmt(BigDecimal val) {
        if (val == null) return "";
        return String.format("%,.3f", val).replace(",", " ").replace(".", ",");
    }

    private String td(String content) {
        return "<td class='c'>" + esc(content) + "</td>";
    }

    private String tdr(String content) {
        return "<td class='c r'>" + content + "</td>";
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }

    private BigDecimal bd0() {
        return BigDecimal.ZERO;
    }

    private String maritalCode(MaritalStatus s) {
        if (s == null) return "C";
        return switch (s) {
            case SINGLE -> "C";
            case MARRIED -> "M";
            case DIVORCED -> "D";
            case WIDOWED -> "V";
        };
    }

    private String monthLabel(int m) {
        String[] months = {
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Août",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre",
        };
        return m >= 1 && m <= 12 ? months[m - 1] : String.valueOf(m);
    }

    private int quarter(int month) {
        return (month - 1) / 3 + 1;
    }

    /** Convertit un montant en lettres françaises (dinars / millimes). */
    private String numberToWords(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return "Zéro Dinar 000 Millimes";
        long dinars = amount.toBigInteger().longValue();
        long millimes = amount
            .subtract(new BigDecimal(dinars))
            .multiply(new BigDecimal("1000"))
            .setScale(0, RoundingMode.HALF_UP)
            .longValue();
        String d = intToWordsFr(dinars);
        return capitalize(d) + " Dinar" + (dinars > 1 ? "s" : "") + " " + String.format("%03d", millimes) + " Millimes";
    }

    private String intToWordsFr(long n) {
        if (n == 0) return "zéro";
        if (n < 0) return "moins " + intToWordsFr(-n);
        String[] units = {
            "",
            "un",
            "deux",
            "trois",
            "quatre",
            "cinq",
            "six",
            "sept",
            "huit",
            "neuf",
            "dix",
            "onze",
            "douze",
            "treize",
            "quatorze",
            "quinze",
            "seize",
            "dix-sept",
            "dix-huit",
            "dix-neuf",
        };
        String[] tens = { "", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante", "quatre-vingt", "quatre-vingt" };
        if (n < 20) return units[(int) n];
        if (n < 100) {
            int t = (int) n / 10,
                u = (int) n % 10;
            if (t == 7 || t == 9) return tens[t] + (u == 0 ? "-dix" : "-" + units[10 + u]);
            if (t == 8) return "quatre-vingts" + (u > 0 ? "-" + units[u] : "");
            return tens[t] + (u == 1 ? "-et-un" : u > 0 ? "-" + units[u] : "");
        }
        if (n < 1000) {
            long h = n / 100,
                r = n % 100;
            return (h == 1 ? "cent" : units[(int) h] + " cent" + (r == 0 ? "s" : "")) + (r > 0 ? " " + intToWordsFr(r) : "");
        }
        if (n < 1_000_000) {
            long m = n / 1000,
                r = n % 1000;
            return (m == 1 ? "mille" : intToWordsFr(m) + " mille") + (r > 0 ? " " + intToWordsFr(r) : "");
        }
        long m = n / 1_000_000,
            r = n % 1_000_000;
        return intToWordsFr(m) + " million" + (m > 1 ? "s" : "") + (r > 0 ? " " + intToWordsFr(r) : "");
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
