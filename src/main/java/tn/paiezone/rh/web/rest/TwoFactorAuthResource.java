package tn.paiezone.rh.web.rest;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.service.TwoFactorAuthService;

@RestController
@RequestMapping("/api")
public class TwoFactorAuthResource {

    private static final Logger LOG = LoggerFactory.getLogger(TwoFactorAuthResource.class);
    private final TwoFactorAuthService twoFactorAuthService;
    private final AuthenticateController authenticateController;
    private final UserDetailsService userDetailsService;

    public TwoFactorAuthResource(
        TwoFactorAuthService twoFactorAuthService,
        AuthenticateController authenticateController,
        UserDetailsService userDetailsService
    ) {
        this.twoFactorAuthService = twoFactorAuthService;
        this.authenticateController = authenticateController;
        this.userDetailsService = userDetailsService;
    }

    @PostMapping("/2fa/check")
    public ResponseEntity<Map<String, Object>> check(@RequestBody Map<String, String> body) {
        String login = body.get("login");
        boolean required = twoFactorAuthService.checkAndSendCode(login);
        return ResponseEntity.ok(Map.of("requires2fa", required));
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body) {
        // On vérifie les deux clés possibles
        String login = body.get("login") != null ? body.get("login") : body.get("username");
        String code = body.get("code");

        // LOG CRITIQUE : Regarde ta console Java après avoir cliqué !
        LOG.info("VÉRIFICATION : Login reçu = [{}], Code reçu = [{}]", login, code);

        if (login == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Données manquantes"));
        }

        if (twoFactorAuthService.verifyCode(login, code)) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(login);
            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            String jwt = authenticateController.createToken(authentication, false);
            return ResponseEntity.ok(new AuthenticateController.JWTToken(jwt));
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/2fa/status")
    public ResponseEntity<Map<String, Object>> status(@AuthenticationPrincipal Jwt jwt) {
        String login = jwt.getSubject();
        boolean enabled = twoFactorAuthService.getStatusByLogin(login);
        return ResponseEntity.ok(Map.of("login", login, "twoFactorEnabled", enabled));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<Map<String, String>> enable(@AuthenticationPrincipal Jwt jwt) {
        twoFactorAuthService.enable(jwt.getSubject());
        return ResponseEntity.ok(Map.of("message", "2FA activé"));
    }

    @DeleteMapping("/2fa/disable")
    public ResponseEntity<Map<String, String>> disable(@AuthenticationPrincipal Jwt jwt) {
        twoFactorAuthService.disable(jwt.getSubject());
        return ResponseEntity.ok(Map.of("message", "2FA désactivé"));
    }
}
