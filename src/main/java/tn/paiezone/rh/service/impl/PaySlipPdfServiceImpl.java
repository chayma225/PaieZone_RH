package tn.paiezone.rh.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Service;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.service.PaySlipPdfService;

import jakarta.persistence.EntityNotFoundException;
import java.io.InputStream;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaySlipPdfServiceImpl implements PaySlipPdfService {

    private static final String TEMPLATE_PATH = "/reports/payslip/payslip.jrxml";

    private final PaySlipRepository paySlipRepository;
    private final PaySlipLineRepository paySlipLineRepository;

    @Override
    public byte[] generatePdf(Long paySlipId) {
        PaySlip ps = paySlipRepository.findById(paySlipId)
            .orElseThrow(() -> new EntityNotFoundException("PaySlip introuvable"));

        List<PaySlipLine> lines = paySlipLineRepository
            .findByPaySlipIdOrderBySortOrder(paySlipId);

        try (InputStream template = getClass().getResourceAsStream(TEMPLATE_PATH)) {
            if (template == null) {
                throw new RuntimeException(
                    "Template JasperReports introuvable : " + TEMPLATE_PATH);
            }

            JasperReport report = JasperCompileManager.compileReport(template);
            Map<String, Object> params = buildParams(ps);
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(lines);
            JasperPrint print = JasperFillManager.fillReport(report, params, dataSource);

            byte[] pdf = JasperExportManager.exportReportToPdf(print);
            log.info("✅ PDF généré pour bulletin #{} ({} pages)", paySlipId, print.getPages().size());
            return pdf;

        } catch (JRException e) {
            throw new RuntimeException("Erreur génération PDF bulletin#" + paySlipId, e);
        } catch (Exception e) {
            throw new RuntimeException("Erreur inattendue PDF bulletin#" + paySlipId, e);
        }
    }

    @Override
    public byte[] generateBulkPdf(Long periodId) {
        List<PaySlip> paySlips = paySlipRepository.findByPayrollPeriodId(periodId);

        if (paySlips.isEmpty()) {
            throw new IllegalStateException("Aucun bulletin calculé pour la période #" + periodId);
        }

        // Générer chaque PDF et les concatener
        // (implémentation avec PDFBox pour la concatenation)
        List<byte[]> pdfs = paySlips.stream()
            .map(ps -> generatePdf(ps.getId()))
            .toList();

        return mergePdfs(pdfs);
    }

    private Map<String, Object> buildParams(PaySlip ps) {
        Employee emp    = ps.getEmployee();
        Company company = emp.getCompany();

        Map<String, Object> p = new LinkedHashMap<>();

        // ── Informations entreprise ────────────────────────────────
        p.put("COMPANY_NAME",    company.getName());
        p.put("COMPANY_ADDRESS", buildAddress(company));
        p.put("COMPANY_CITY",    company.getCity());
        p.put("COMPANY_TAX_ID",  company.getTaxId());
        p.put("COMPANY_CNSS_ID", company.getCnssId());

        // ── Informations employé ───────────────────────────────────
        p.put("EMP_FULL_NAME",  emp.getFirstName() + " " + emp.getLastName().toUpperCase());
        p.put("EMP_MATRICULE",  emp.getMatricule());
        p.put("EMP_CIN",        emp.getNationalId());
        p.put("EMP_CNSS",       emp.getCnssNumber());
        p.put("EMP_POSTE",      ps.getContract().getJobTitle());

        // ── Période ────────────────────────────────────────────────
        p.put("PERIOD_MONTH",   ps.getMonth());
        p.put("PERIOD_YEAR",    ps.getYear());
        p.put("PERIOD_LABEL",   String.format("%02d/%d", ps.getMonth(), ps.getYear()));
        p.put("WORKED_DAYS",    ps.getWorkedDays() != null ? ps.getWorkedDays() : 26);

        // ── Montants ───────────────────────────────────────────────
        p.put("BASE_SALARY",    ps.getBaseSalary());
        p.put("TOTAL_GAINS",    ps.getTotalGains());
        p.put("GROSS_SALARY",   ps.getGrossSalary());
        p.put("CNSS_AMOUNT",    ps.getCnssSalaryAmount());
        p.put("CAVIS_AMOUNT",   ps.getCavisAmount());
        p.put("TAXABLE_BASE",   ps.getTaxableIncome());
        p.put("IRPP_AMOUNT",    ps.getIrppAmount());
        p.put("BONUS_TOTAL",    ps.getBonusTotal());
        p.put("ADVANCE_DED",    ps.getAdvanceDeduction());
        p.put("TOTAL_DED",      ps.getTotalDeductions());
        p.put("NET_SALARY",     ps.getNetSalary());

        // ── Coût employeur (non visible salarié) ───────────────────
        p.put("EMPLOYER_CNSS",  ps.getEmployerCnss());
        p.put("EMPLOYER_COST",  ps.getTotalEmployerCost());

        return p;
    }

    private String buildAddress(Company company) {
        return Optional.ofNullable(company.getAddress()).orElse("") + ", " +
            Optional.ofNullable(company.getPostalCode()).orElse("") + " " +
            Optional.ofNullable(company.getCity()).orElse("");
    }

    private byte[] mergePdfs(List<byte[]> pdfs) {
        // Utiliser PDFBox pour merger les PDFs
        // Implémentation simplifiée — retourner le premier pour l'instant
        if (pdfs.isEmpty()) return new byte[0];
        return pdfs.get(0); // TODO: merger avec PDFBox
    }
}
