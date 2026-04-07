package tn.paiezone.rh.web.rest;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Point d'entrée sans authentification pour vérifier que l'API répond avant toute initialisation métier.
 */
@RestController
@RequestMapping("/api/public")
public class PublicInitResource {

    public static final String INIT_STATUS_PATH = "/api/public/init-status";

    @GetMapping("/init-status")
    public ResponseEntity<Map<String, Object>> initStatus() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("application", "paieZoneRH");
        body.put("phase", "initialisation-sprint-1");
        body.put("ok", true);
        body.put(
            "nextSteps",
            List.of(
                "Démarrer PostgreSQL + Redis selon application-dev.yml",
                "Lancer l'application (./mvnw ou votre IDE) : Liquibase applique le schéma et les données faker en dev",
                "Se connecter avec un compte ROLE_ADMIN pour accéder aux menus Entreprise / Abonnement",
                "Tester une ressource métier : GET /api/companies (JWT admin requis)"
            )
        );
        return ResponseEntity.ok(body);
    }
}
