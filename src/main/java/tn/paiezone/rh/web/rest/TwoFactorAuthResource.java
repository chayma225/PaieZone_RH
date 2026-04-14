package tn.paiezone.rh.web.rest;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.service.TwoFactorAuthService;

@RestController
@RequestMapping("/api/2fa")
public class TwoFactorAuthResource {

    private static final Logger LOG = LoggerFactory.getLogger(TwoFactorAuthResource.class);

    private final TwoFactorAuthService twoFactorAuthService;

    public TwoFactorAuthResource(TwoFactorAuthService twoFactorAuthService) {
        this.twoFactorAuthService = twoFactorAuthService;
    }

    // ── Étape 1 : Générer le secret + QR Code ────────────────────────────────
    @PostMapping("/setup")
    public ResponseEntity<Map<String, String>> setup(@AuthenticationPrincipal Jwt jwt) {
        String login = jwt.getSubject();
        LOG.debug("REST request to setup 2FA for : {}", login);

        String secret = twoFactorAuthService.generateSecret(login);
        String qrUrl = twoFactorAuthService.generateQRUrl(login, secret);

        return ResponseEntity.ok(Map.of("secret", secret, "qrUrl", qrUrl, "message", "Scannez le QR code avec Google Authenticator"));
    }

    // ── Étape 2 : Vérifier le code et activer le 2FA ─────────────────────────
    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Integer> body) {
        String login = jwt.getSubject();
        int code = body.get("code");
        LOG.debug("REST request to verify 2FA code for : {}", login);

        boolean valid = twoFactorAuthService.verifyAndEnable(login, code);

        if (valid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "2FA activé avec succès !"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Code incorrect. Réessayez."));
        }
    }

    // ── Désactiver le 2FA ─────────────────────────────────────────────────────
    @DeleteMapping("/disable")
    public ResponseEntity<Map<String, String>> disable(@AuthenticationPrincipal Jwt jwt) {
        String login = jwt.getSubject();
        LOG.debug("REST request to disable 2FA for : {}", login);
        twoFactorAuthService.disable(login);
        return ResponseEntity.ok(Map.of("message", "2FA désactivé."));
    }

    // ── Vérifier le statut du 2FA ─────────────────────────────────────────────
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status(@AuthenticationPrincipal Jwt jwt) {
        String login = jwt.getSubject();
        LOG.debug("REST request to get 2FA status for : {}", login);
        boolean valid = twoFactorAuthService.verifyCode(login, "0");
        return ResponseEntity.ok(Map.of("login", login, "twoFactorEnabled", !valid));
    }
}
