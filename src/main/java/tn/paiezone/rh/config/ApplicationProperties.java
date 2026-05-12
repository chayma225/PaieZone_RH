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
    // 1. AJOUT DU CHAMP CHATBOT
    private final Chatbot chatbot = new Chatbot();

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Totp getTotp() {
        // Getter pour Totp
        return totp;
    }

    public Chatbot getChatbot() {
        return chatbot;
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

    // 3. AJOUT DE LA CLASSE INTERNE CHATBOT À LA FIN
    public static class Chatbot {

        /** URL de base Ollama — ex: http://localhost:11434 */
        private String ollamaUrl = "http://localhost:11434";

        /** Modèle Ollama à utiliser — ex: phi3:latest */
        private String model = "phi3:latest";

        /** Nombre max de tokens générés par réponse */
        private int maxTokens = 1024;

        /** Nombre max de messages d'historique envoyés à Ollama */
        private int maxHistoryMessages = 10;

        public String getOllamaUrl() {
            return ollamaUrl;
        }

        public void setOllamaUrl(String ollamaUrl) {
            this.ollamaUrl = ollamaUrl;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public int getMaxTokens() {
            return maxTokens;
        }

        public void setMaxTokens(int maxTokens) {
            this.maxTokens = maxTokens;
        }

        public int getMaxHistoryMessages() {
            return maxHistoryMessages;
        }

        public void setMaxHistoryMessages(int maxHistoryMessages) {
            this.maxHistoryMessages = maxHistoryMessages;
        }
    }

    // jhipster-needle-application-properties-property-class
}
