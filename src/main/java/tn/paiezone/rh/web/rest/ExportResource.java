package tn.paiezone.rh.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.service.PdfExportService;

@RestController
@RequestMapping("/api/export")
public class ExportResource {

    private static final Logger log = LoggerFactory.getLogger(ExportResource.class);

    private final PdfExportService pdfExportService;

    public ExportResource(PdfExportService pdfExportService) {
        this.pdfExportService = pdfExportService;
    }

    @GetMapping("/bulletin/{paySlipId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE','EMPLOYE')")
    public ResponseEntity<byte[]> downloadBulletin(@PathVariable Long paySlipId) {
        log.debug("GET /api/export/bulletin/{}", paySlipId);
        byte[] pdf = pdfExportService.generateBulletin(paySlipId);
        return pdfResponse(pdf, "bulletin-paie-" + paySlipId + ".pdf");
    }

    @GetMapping("/bulletin-bulk/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadBulkBulletin(@PathVariable Long periodId) {
        log.debug("GET /api/export/bulletin-bulk/{}", periodId);
        byte[] pdf = pdfExportService.generateBulkBulletin(periodId);
        return pdfResponse(pdf, "bulletins-paie-periode-" + periodId + ".pdf");
    }

    @GetMapping("/attestation/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE','EMPLOYE')")
    public ResponseEntity<byte[]> downloadAttestation(@PathVariable Long employeeId) {
        log.debug("GET /api/export/attestation/{}", employeeId);
        byte[] pdf = pdfExportService.generateAttestationTravail(employeeId);
        return pdfResponse(pdf, "attestation-travail-" + employeeId + ".pdf");
    }

    @GetMapping("/journal/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadJournal(@PathVariable Long periodId) {
        log.debug("GET /api/export/journal/{}", periodId);
        byte[] pdf = pdfExportService.generateJournalPaie(periodId);
        return pdfResponse(pdf, "journal-paie-periode-" + periodId + ".pdf");
    }

    @GetMapping("/cnss-recap/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadCnssRecap(@PathVariable Long periodId) {
        log.debug("GET /api/export/cnss-recap/{}", periodId);
        byte[] pdf = pdfExportService.generateCnssRecap(periodId);
        return pdfResponse(pdf, "recap-cnss-periode-" + periodId + ".pdf");
    }

    @GetMapping("/declaration-trimestrielle/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadDeclarationTrimestrielle(@PathVariable Long periodId) {
        log.debug("GET /api/export/declaration-trimestrielle/{}", periodId);
        byte[] pdf = pdfExportService.generateDeclarationTrimestrielle(periodId);
        return pdfResponse(pdf, "declaration-trimestrielle-periode-" + periodId + ".pdf");
    }

    @GetMapping("/cnss-employeur/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadCnssEmployeur(@PathVariable Long periodId) {
        log.debug("GET /api/export/cnss-employeur/{}", periodId);
        byte[] pdf = pdfExportService.generateCnssEmployeur(periodId);
        return pdfResponse(pdf, "cnss-patronal-" + periodId + ".pdf");
    }

    @GetMapping("/cavis-recap/{periodId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadCavisRecap(@PathVariable Long periodId) {
        log.debug("GET /api/export/cavis-recap/{}", periodId);
        byte[] pdf = pdfExportService.generateCavisRecap(periodId);
        return pdfResponse(pdf, "cavis-" + periodId + ".pdf");
    }

    @GetMapping("/irpp-annuel")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE')")
    public ResponseEntity<byte[]> downloadIrppAnnuel(@RequestParam int year) {
        log.debug("GET /api/export/irpp-annuel?year={}", year);
        byte[] pdf = pdfExportService.generateIrppAnnuel(year);
        return pdfResponse(pdf, "irpp-annuel-" + year + ".pdf");
    }

    @GetMapping("/certificat-ri/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN','RH_COMPTABLE','EMPLOYE')")
    public ResponseEntity<byte[]> downloadCertificatRI(@PathVariable Long employeeId, @RequestParam(defaultValue = "0") int year) {
        if (year == 0) {
            year = java.time.LocalDate.now().getYear() - 1;
        }
        log.debug("GET /api/export/certificat-ri/{} year={}", employeeId, year);
        byte[] pdf = pdfExportService.generateCertificatRI(employeeId, year);
        return pdfResponse(pdf, "certificat-ri-" + employeeId + "-" + year + ".pdf");
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .contentLength(pdf.length)
            .body(pdf);
    }
}
