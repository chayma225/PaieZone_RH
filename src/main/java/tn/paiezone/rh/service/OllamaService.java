package tn.paiezone.rh.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import tn.paiezone.rh.config.ApplicationProperties;

/**
 * Service de communication avec Ollama.
 *
 * IMPORTANT — URL selon le contexte de déploiement :
 *
 *   Spring Boot natif (Windows) + Ollama local :
 *     ollama-url: http://localhost:11434
 *
 *   Spring Boot dans Docker + Ollama sur la machine hôte Windows :
 *     ollama-url: http://host.docker.internal:11434
 */
@Service
public class OllamaService {

    private static final Logger log = LoggerFactory.getLogger(OllamaService.class);

    private final RestClient restClient;
    private final String model;
    private final int maxTokens;
    private final String ollamaUrl;

    public OllamaService(ApplicationProperties applicationProperties) {
        ApplicationProperties.Chatbot chatbot = applicationProperties.getChatbot();
        this.model = chatbot.getModel();
        this.maxTokens = chatbot.getMaxTokens();
        this.ollamaUrl = chatbot.getOllamaUrl();

        this.restClient = RestClient.builder().baseUrl(this.ollamaUrl).defaultHeader("Content-Type", "application/json").build();

        log.info("OllamaService initialisé → {} (modèle: {})", this.ollamaUrl, model);
    }

    public String chat(List<OllamaMessage> messages) {
        OllamaChatRequest request = new OllamaChatRequest(model, messages, false, Map.of("num_predict", maxTokens, "temperature", 0.7));

        try {
            log.debug("Appel Ollama ({} messages)...", messages.size());

            OllamaChatResponse response = restClient
                .post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OllamaChatResponse.class);

            if (response != null && response.message() != null && response.message().content() != null) {
                String content = response.message().content().trim();
                log.debug("Réponse Ollama reçue ({} chars)", content.length());
                return content;
            }

            log.warn("Réponse Ollama vide ou malformée");
            return "Je n'ai pas pu générer une réponse. Veuillez réessayer.";
        } catch (ResourceAccessException e) {
            // Ollama non joignable → message clair pour l'utilisateur
            log.error("Ollama non joignable à {} : {}", ollamaUrl, e.getMessage());
            return (
                "⚠️ Le service IA est temporairement indisponible.\n\n" +
                "**Pour l'administrateur système :**\n" +
                "- Vérifiez qu'Ollama est démarré : `ollama serve`\n" +
                "- URL configurée : `" +
                ollamaUrl +
                "`\n" +
                "- Si Spring Boot tourne dans Docker, utilisez `http://host.docker.internal:11434`"
            );
        } catch (Exception e) {
            log.error("Erreur inattendue Ollama: {}", e.getMessage(), e);
            return "⚠️ Erreur technique. Veuillez réessayer dans quelques instants.";
        }
    }

    // ── Records Java 21 ─────────────────────────────────────────────

    public record OllamaChatRequest(String model, List<OllamaMessage> messages, boolean stream, Map<String, Object> options) {}

    public record OllamaMessage(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OllamaChatResponse(String model, @JsonProperty("created_at") String createdAt, OllamaMessage message, boolean done) {}
}
