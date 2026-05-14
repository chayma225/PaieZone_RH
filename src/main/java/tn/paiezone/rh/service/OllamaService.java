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
 * Service de communication avec Ollama (phi3:latest).
 *
 * Deux modes d'appel :
 *  - chat()        : réponse conversationnelle (RAG, salutations) — température 0.7
 *  - generateSql() : génération SQL déterministe — température 0.05
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

        log.info("OllamaService → {} (modèle: {})", this.ollamaUrl, model);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Mode conversationnel (RAG + réponses générales)
    // ──────────────────────────────────────────────────────────────────────────

    public String chat(List<OllamaMessage> messages) {
        return callOllama(messages, 0.7, maxTokens);
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Mode Text-to-SQL (température très basse → SQL déterministe)
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Génère une requête SQL depuis une question en langage naturel.
     *
     * @param systemPrompt  Prompt système avec le schéma et les exemples
     * @param question      Question de l'utilisateur
     * @return Requête SQL brute générée par phi3
     */
    public String generateSql(String systemPrompt, String question) {
        List<OllamaMessage> messages = List.of(
            new OllamaMessage("system", systemPrompt + " " + question),
            new OllamaMessage("user", question)
        );

        // Température 0.05 : quasi-déterministe pour le SQL
        // Max 300 tokens : une requête SQL simple ne dépasse pas 300 tokens
        String rawSql = callOllama(messages, 0.05, 300);
        log.debug("[SQL-GEN] Réponse brute phi3 : {}", rawSql);
        return rawSql;
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Appel HTTP commun
    // ──────────────────────────────────────────────────────────────────────────

    private String callOllama(List<OllamaMessage> messages, double temperature, int numPredict) {
        OllamaChatRequest request = new OllamaChatRequest(
            model,
            messages,
            false,
            Map.of("num_predict", numPredict, "temperature", temperature, "top_p", 0.9, "repeat_penalty", 1.1)
        );

        try {
            OllamaChatResponse response = restClient
                .post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(OllamaChatResponse.class);

            if (response != null && response.message() != null && response.message().content() != null) {
                return response.message().content().trim();
            }
            return "";
        } catch (ResourceAccessException e) {
            log.error("Ollama non joignable à {} : {}", ollamaUrl, e.getMessage());
            return (
                "⚠️ Le service IA est indisponible.\n" +
                "**Solution :** Lancez `ollama serve` dans un terminal Windows.\n" +
                "Si Spring Boot tourne dans Docker, configurez : `ollama-url: http://host.docker.internal:11434`"
            );
        } catch (Exception e) {
            log.error("Erreur Ollama inattendue : {}", e.getMessage(), e);
            return "";
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Records Java 21
    // ──────────────────────────────────────────────────────────────────────────

    public record OllamaChatRequest(String model, List<OllamaMessage> messages, boolean stream, Map<String, Object> options) {}

    public record OllamaMessage(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record OllamaChatResponse(String model, @JsonProperty("created_at") String createdAt, OllamaMessage message, boolean done) {}
}
