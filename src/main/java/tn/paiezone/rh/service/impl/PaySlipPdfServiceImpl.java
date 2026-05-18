package tn.paiezone.rh.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.paiezone.rh.service.PaySlipPdfService;
import tn.paiezone.rh.service.PdfExportService;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaySlipPdfServiceImpl implements PaySlipPdfService {

    private final PdfExportService pdfExportService;

    @Override
    public byte[] generatePdf(Long paySlipId) {
        return pdfExportService.generateBulletin(paySlipId);
    }

    @Override
    public byte[] generateBulkPdf(Long periodId) {
        return pdfExportService.generateBulkBulletin(periodId);
    }
}
