package tn.paiezone.rh.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.pdf.PdfCopy;
import com.lowagie.text.pdf.PdfReader;
import jakarta.persistence.EntityNotFoundException;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.xhtmlrenderer.pdf.ITextRenderer;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;
import tn.paiezone.rh.domain.enumeration.RubriqueType;
import tn.paiezone.rh.repository.PaySlipLineRepository;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.PaySlipPdfService;

@Service
@Transactional(readOnly = true)
public class PaySlipPdfServiceImpl implements PaySlipPdfService {

    private static final Logger log = LoggerFactory.getLogger(PaySlipPdfServiceImpl.class);

    private static final String[] MONTHS_FR = {
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

    private final PaySlipRepository paySlipRepository;
    private final PaySlipLineRepository paySlipLineRepository;

    public PaySlipPdfServiceImpl(PaySlipRepository paySlipRepository, PaySlipLineRepository paySlipLineRepository) {
        this.paySlipRepository = paySlipRepository;
        this.paySlipLineRepository = paySlipLineRepository;
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  API publique
    // ─────────────────────────────────────────────────────────────────────────

    @Override
    public byte[] generatePdf(Long paySlipId) {
        PaySlip ps = paySlipRepository
            .findById(paySlipId)
            .orElseThrow(() -> new EntityNotFoundException("Bulletin introuvable : " + paySlipId));
        List<PaySlipLine> lines = paySlipLineRepository.findByPaySlipIdOrderBySortOrder(paySlipId);
        log.info("Génération bulletin PDF — id={} emp={}", paySlipId, ps.getEmployee().getMatricule());
        return htmlToPdf(buildHtml(ps, lines));
    }

    @Override
    public byte[] generateBulkPdf(Long periodId) {
        List<PaySlip> slips = paySlipRepository.findAllByPeriodIdOrdered(periodId);
        if (slips.isEmpty()) throw new IllegalStateException("Aucun bulletin pour la période #" + periodId);
        List<byte[]> pdfs = slips
            .stream()
            .map(ps -> generatePdf(ps.getId()))
            .toList();
        return mergePdfs(pdfs);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Construction HTML
    // ─────────────────────────────────────────────────────────────────────────

    private String buildHtml(PaySlip ps, List<PaySlipLine> lines) {
        Employee emp = ps.getEmployee();
        Company co = emp.getCompany();
        Contract ct = ps.getContract();

        String fullName = emp.getFirstName() + " " + emp.getLastName().toUpperCase();
        String matricule = Optional.ofNullable(emp.getMatricule()).orElse("—");
        String cnssEmp = Optional.ofNullable(emp.getCnssNumber()).orElse("—");
        String cnssEmployeur = Optional.ofNullable(co.getCnssId()).orElse("—");
        String sf = maritalCode(emp.getMaritalStatus()) + " " + Optional.ofNullable(emp.getNumberOfChildren()).orElse(0);
        String qualification =
            ct != null && ct.getJobTitle() != null
                ? ct.getJobTitle().toUpperCase()
                : (emp.getPosition() != null ? emp.getPosition().getTitle().toUpperCase() : "—");
        String moisLabel = MONTHS_FR[ps.getMonth() - 1] + " " + ps.getYear();
        int workedDays = ps.getWorkedDays() != null ? ps.getWorkedDays() : 26;
        int normalHours =
            ct != null && ct.getWorkingHoursWeek() != null ? (int) Math.round((ct.getWorkingHoursWeek() * 52.0) / 12) : workedDays * 8;

        StringBuilder sb = new StringBuilder();

        // ── CSS + page ────────────────────────────────────────────────────────
        sb
            .append("<!DOCTYPE html><html><head><meta charset='UTF-8'/><style>")
            .append("@page{size:A4 portrait;margin:10mm 12mm}")
            .append("body{font-family:Arial,sans-serif;font-size:10pt;margin:0;padding:0}")
            .append("table{border-collapse:collapse;width:100%;table-layout:fixed}")
            .append("td,th{padding:5px 6px;font-size:9.5pt;word-wrap:break-word}")
            .append(".title{font-size:14pt;font-weight:bold;text-align:center}")
            .append(
                ".hd{background:#d0d8e8;font-weight:bold;text-align:center;border:1px solid #555;font-size:9pt;text-transform:uppercase}"
            )
            .append(".c{border:1px solid #888}")
            .append(".r{padding:4px 6px;border-left:1px solid #888;border-right:1px solid #888}")
            .append(".num{text-align:right}")
            .append(".bold{font-weight:bold}")
            .append(".net td{font-weight:bold;border-top:2px solid #000;font-size:11pt;padding:7px 6px}")
            .append("</style></head><body>");

        // ── EN-TÊTE : entreprise (gauche) + titre (droite) ────────────────────
        sb
            .append("<table><tr>")
            .append("<td class='c' style='width:55%;vertical-align:top'>")
            .append("<span class='bold' style='font-size:11pt'>")
            .append(esc(co.getName()))
            .append("</span><br/>")
            .append(esc(Optional.ofNullable(co.getAddress()).orElse("")))
            .append("<br/>")
            .append(esc(Optional.ofNullable(co.getCity()).orElse("")))
            .append("<br/>")
            .append("N° C.N.S.S : <b>")
            .append(esc(cnssEmployeur))
            .append("</b>")
            .append("</td>")
            .append("<td class='c' style='width:45%;text-align:center;vertical-align:middle'>")
            .append("<div class='title'>BULLETIN DE PAIE</div>")
            .append("<div style='font-size:12pt;font-weight:bold;margin-top:6px'>")
            .append(moisLabel)
            .append("</div>")
            .append("</td>")
            .append("</tr></table>");

        // ── IDENTITÉ EMPLOYÉ ──────────────────────────────────────────────────
        sb
            .append("<table style='margin-top:8px'>")
            .append("<tr>")
            .append("<th class='hd' style='width:10%'>MAT.</th>")
            .append("<th class='hd' style='width:40%'>NOM &amp; PRENOM</th>")
            .append("<th class='hd' style='width:12%'>S.F.</th>")
            .append("<th class='hd' style='width:38%'>QUALIFICATION</th>")
            .append("</tr><tr>")
            .append("<td class='c num'>")
            .append(esc(matricule))
            .append("</td>")
            .append("<td class='c bold'>")
            .append(esc(fullName))
            .append("</td>")
            .append("<td class='c' style='text-align:center'>")
            .append(sf)
            .append("</td>")
            .append("<td class='c'>")
            .append(esc(qualification))
            .append("</td>")
            .append("</tr></table>");

        // ── CONTRAT ───────────────────────────────────────────────────────────
        sb
            .append("<table style='margin-top:4px'>")
            .append("<tr>")
            .append("<th class='hd' style='width:30%'>N° CNSS</th>")
            .append("<th class='hd' style='width:10%'>CAT.</th>")
            .append("<th class='hd' style='width:10%'>ECH.</th>")
            .append("<th class='hd' style='width:25%'>BASE/TX H.</th>")
            .append("<th class='hd' style='width:15%'>&nbsp;</th>")
            .append("<th class='hd' style='width:10%'>PAIEMENT</th>")
            .append("</tr><tr>")
            .append("<td class='c'>")
            .append(esc(cnssEmp))
            .append("</td>")
            .append("<td class='c'></td>")
            .append("<td class='c'></td>")
            .append("<td class='c num'>")
            .append(fmt(ps.getBaseSalary()))
            .append("</td>")
            .append("<td class='c'>Titulaire</td>")
            .append("<td class='c' style='text-align:center'>00</td>")
            .append("</tr></table>");

        // ── TABLEAU DES RUBRIQUES ─────────────────────────────────────────────
        sb
            .append("<table style='margin-top:6px;border:1px solid #888'>")
            .append("<tr>")
            .append("<th class='hd' style='width:10%'>CODE</th>")
            .append("<th class='hd' style='width:38%'>DESIGNATION</th>")
            .append("<th class='hd' style='width:12%'>NBJ/HR.</th>")
            .append("<th class='hd' style='width:20%'>REMUNERATION</th>")
            .append("<th class='hd' style='width:20%'>RETENUES</th>")
            .append("</tr>");

        int dataRows;
        if (!lines.isEmpty()) {
            // Lignes réelles depuis PaySlipLine (prioritaire)
            for (PaySlipLine l : lines) {
                boolean isDed = l.getRubriqueType() == RubriqueType.DEDUCTION;
                sb
                    .append("<tr>")
                    .append("<td class='r num'>")
                    .append(esc(l.getRubriqueCode()))
                    .append("</td>")
                    .append("<td class='r'>")
                    .append(esc(l.getRubriqueLabel()))
                    .append("</td>")
                    .append("<td class='r num'>")
                    .append(l.getBase() != null && !isDed ? fmt(l.getBase()) : "")
                    .append("</td>")
                    .append("<td class='r num'>")
                    .append(!isDed ? fmt(l.getAmount()) : "")
                    .append("</td>")
                    .append("<td class='r num'>")
                    .append(isDed ? fmt(l.getAmount()) : "")
                    .append("</td>")
                    .append("</tr>");
            }
            dataRows = lines.size();
        } else {
            // Fallback : champs agrégés de PaySlip
            sb.append(row("1000", "SALAIRE DE BASE", String.valueOf(workedDays), fmt(ps.getBaseSalary()), ""));
            if (gt0(ps.getBonusTotal())) sb.append(row("1110", "PRIMES", "", fmt(ps.getBonusTotal()), ""));
            if (gt0(ps.getOvertimeAmount())) sb.append(row("1120", "HEURES SUPPLEMENTAIRES", "", fmt(ps.getOvertimeAmount()), ""));
            sb.append(row("2000", "SALAIRE BRUT", "", fmt(ps.getGrossSalary()), ""));
            sb.append(row("3000", "C.N.S.S", "", "", fmt(ps.getCnssSalaryAmount())));
            if (gt0(ps.getCavisAmount())) sb.append(row("3001", "CAVIS", "", "", fmt(ps.getCavisAmount())));
            sb.append(row("4000", "IMPOSABLE", "", fmt(ps.getTaxableIncome()), ""));
            sb.append(row("5000", "I.R.P.P", "", "", fmt(ps.getIrppAmount())));
            if (gt0(ps.getCssAmount())) sb.append(row("5001", "C.S.S", "", "", fmt(ps.getCssAmount())));
            if (gt0(ps.getAdvanceDeduction())) sb.append(row("6000", "AVANCE", "", "", fmt(ps.getAdvanceDeduction())));
            dataRows = 8;
        }

        // Lignes vides pour remplir la page
        int emptyRows = Math.max(18 - dataRows, 4);
        for (int i = 0; i < emptyRows; i++) {
            sb
                .append("<tr style='height:18px'>")
                .append("<td class='r'>&nbsp;</td><td class='r'></td><td class='r'></td><td class='r'></td><td class='r'></td>")
                .append("</tr>");
        }

        // ── NET À PAYER ───────────────────────────────────────────────────────
        sb
            .append("<tr class='net'>")
            .append("<td class='c bold' colspan='2'>CAISSE</td>")
            .append("<td class='c'></td>")
            .append("<td class='c bold' style='text-align:right'>NET A PAYER</td>")
            .append("<td class='c bold num'>")
            .append(fmt(ps.getNetSalary()))
            .append("</td>")
            .append("</tr></table>");

        // ── PIED DE PAGE ──────────────────────────────────────────────────────
        sb
            .append("<div style='margin-top:8px;font-size:9pt;font-weight:bold'>")
            .append("NOMBRE D'HEURES NORMALES DU MOIS &nbsp;&nbsp; ")
            .append(normalHours)
            .append("</div>")
            .append("<div style='margin-top:28px;text-align:right;font-size:8.5pt;color:#666'>")
            .append("Document généré par PaieZone RH")
            .append("</div>");

        sb.append("</body></html>");
        return sb.toString();
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  Utilitaires
    // ─────────────────────────────────────────────────────────────────────────

    private String row(String code, String label, String nbj, String remu, String ret) {
        return (
            "<tr>" +
            "<td class='r num'>" +
            code +
            "</td>" +
            "<td class='r'>" +
            label +
            "</td>" +
            "<td class='r num'>" +
            nbj +
            "</td>" +
            "<td class='r num'>" +
            remu +
            "</td>" +
            "<td class='r num'>" +
            ret +
            "</td>" +
            "</tr>"
        );
    }

    private boolean gt0(BigDecimal v) {
        return v != null && v.compareTo(BigDecimal.ZERO) > 0;
    }

    /** Format tunisien : 1 528,320 */
    private String fmt(BigDecimal val) {
        if (val == null) return "0,000";
        return String.format("%,.3f", val).replace(",", " ").replace(".", ",");
    }

    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    private String maritalCode(MaritalStatus s) {
        if (s == null) return "C";
        return switch (s) {
            case MARRIED -> "M";
            case DIVORCED -> "D";
            case WIDOWED -> "V";
            default -> "C";
        };
    }

    private byte[] htmlToPdf(String html) {
        try {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(html);
            renderer.layout();
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            renderer.createPDF(baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération PDF bulletin : " + e.getMessage(), e);
        }
    }

    private byte[] mergePdfs(List<byte[]> pdfs) {
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
                for (int i = 1; i <= n; i++) copy.addPage(copy.getImportedPage(reader, i));
                reader.close();
            }
            if (document != null) document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erreur fusion PDF : " + e.getMessage(), e);
        }
    }
}
