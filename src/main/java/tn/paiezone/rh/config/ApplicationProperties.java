package tn.paiezone.rh.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to Paie Zone RH.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();

    private final Totp totp = new Totp(); // Ajout de l'objet Totp

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Totp getTotp() {
        // Getter pour Totp
        return totp;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    // Ajout de la classe interne Totp pour correspondre au YAML
    public static class Totp {

        private boolean enabled = false;
        private String issuer = "PaieZoneRH";

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getIssuer() {
            return issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }
    }

    // jhipster-needle-application-properties-property-class
}
