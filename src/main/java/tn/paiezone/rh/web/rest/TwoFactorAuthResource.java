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
@RequestMapping("/api")
public class TwoFactorAuthResource {

    private static final Logger LOG = LoggerFactory.getLogger(TwoFactorAuthResource.class);
    private final TwoFactorAuthService twoFactorAuthService;

    public TwoFactorAuthResource(TwoFactorAuthService twoFactorAuthService) {
        this.twoFactorAuthService = twoFactorAuthService;
    }

    // ── Vérifier si 2FA requis + envoyer le code ─────────────────────────────
    @PostMapping("/2fa/check")
    public ResponseEntity<Map<String, Object>> check(@RequestBody Map<String, String> body) {
        String login = body.get("login");
        LOG.debug("REST request to check 2FA for : {}", login);
        boolean required = twoFactorAuthService.checkAndSendCode(login);
        return ResponseEntity.ok(
            Map.of("requires2fa", required, "message", required ? "Un code de vérification a été envoyé à votre email." : "2FA non activé.")
        );
    }

    // ── Vérifier le code saisi ────────────────────────────────────────────────
    @PostMapping("/verify-2fa")
    public ResponseEntity<Map<String, Object>> verify(@RequestBody Map<String, String> body) {
        String login = body.get("login");
        String code = body.get("code");
        LOG.debug("REST request to verify 2FA code for : {}", login);

        boolean valid = twoFactorAuthService.verifyCode(login, code);
        if (valid) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Code vérifié avec succès !"));
        }
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Code incorrect ou expiré."));
    }

    // ── Statut 2FA ────────────────────────────────────────────────────────────
    @GetMapping("/2fa/status")
    public ResponseEntity<Map<String, Object>> status(@AuthenticationPrincipal Jwt jwt) {
        String login = jwt.getSubject();
        boolean enabled = twoFactorAuthService.getStatusByLogin(login);
        return ResponseEntity.ok(Map.of("login", login, "twoFactorEnabled", enabled));
    }

    // ── Activer 2FA ───────────────────────────────────────────────────────────
    @PostMapping("/2fa/enable")
    public ResponseEntity<Map<String, String>> enable(@AuthenticationPrincipal Jwt jwt) {
        twoFactorAuthService.enable(jwt.getSubject());
        return ResponseEntity.ok(Map.of("message", "2FA activé avec succès."));
    }

    // ── Désactiver 2FA ────────────────────────────────────────────────────────
    @DeleteMapping("/2fa/disable")
    public ResponseEntity<Map<String, String>> disable(@AuthenticationPrincipal Jwt jwt) {
        twoFactorAuthService.disable(jwt.getSubject());
        return ResponseEntity.ok(Map.of("message", "2FA désactivé."));
    }
}
