package tn.paiezone.rh.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import tn.paiezone.rh.web.rest.PublicInitResource;

/**
 * Affiche un rappel unique au démarrage (profil {@code dev}) pour initialiser le travail sans lire la doc.
 */
@Component
@Profile("dev")
@Order(0)
public class DevStartupBanner implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger LOG = LoggerFactory.getLogger(DevStartupBanner.class);

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        String port = event.getApplicationContext().getEnvironment().getProperty("server.port", "8080");
        LOG.info(
            """

            ========== PaieZone RH — initialisation (dev) ==========
            Sans login : GET http://localhost:{}/{}
            Avec JWT admin : menus Entités → Company / CompanySubscription (ROLE_ADMIN)
            Données démo : Liquibase contexte "faker" (voir application-dev.yml)
            ==========================================================
            """,
            port,
            PublicInitResource.INIT_STATUS_PATH
        );
    }
}
