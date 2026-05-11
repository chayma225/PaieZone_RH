package tn.paiezone.rh.web.rest;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import tn.paiezone.rh.service.CnssDeclarationService;
@RestController
@RequestMapping("/api/declarations")
@RequiredArgsConstructor
public class CnssDeclarationResource {

    private final CnssDeclarationService cnssDeclarationService;

    /** GET /api/declarations/cnss?companyId=1&month=3&year=2026 */
    @GetMapping(value = "/cnss", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN')")
    public ResponseEntity<byte[]> downloadCnss(
        @RequestParam Long companyId,
        @RequestParam int month,
        @RequestParam int year) {
        byte[] file = cnssDeclarationService.generateCnssFile(companyId, month, year);
        String filename = String.format("cnss_%02d_%d.txt", month, year);
        return buildDownloadResponse(file, filename, MediaType.TEXT_PLAIN);
    }

    /** GET /api/declarations/virement?companyId=1&month=3&year=2026 */
    @GetMapping(value = "/virement", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @PreAuthorize("hasAnyRole('ROLE_RH_COMPTABLE','ROLE_ADMIN')")
    public ResponseEntity<byte[]> downloadVirement(
        @RequestParam Long companyId,
        @RequestParam int month,
        @RequestParam int year) {
        byte[] file = cnssDeclarationService.generateVirementFile(companyId, month, year);
        String filename = String.format("virement_%02d_%d.txt", month, year);
        return buildDownloadResponse(file, filename, MediaType.TEXT_PLAIN);
    }

    private ResponseEntity<byte[]> buildDownloadResponse(byte[] data,
                                                         String filename,
                                                         MediaType type) {
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + filename + "\"")
            .contentLength(data.length)
            .contentType(type)
            .body(data);
    }
}
