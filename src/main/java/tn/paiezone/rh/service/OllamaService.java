package tn.paiezone.rh.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
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

    /**
     * Pre-warm : charge phi3 en mémoire au démarrage.
     * Evite le cold start sur le 1er appel utilisateur (~2-8s de latence).
     * Exécuté en async pour ne pas bloquer le démarrage de l'application.
     */
    @PostConstruct
    @Async
    public void warmUp() {
        try {
            log.info("[Ollama] Pré-chargement du modèle {} en mémoire...", model);
            long start = System.currentTimeMillis();
            callOllama(
                List.of(new OllamaMessage("user", "ok")),
                0.1,
                1, // 1 seul token suffit pour charger le modèle
                512 // contexte minimal
            );
            log.info("[Ollama] Modèle chargé en {} ms — prêt.", System.currentTimeMillis() - start);
        } catch (Exception e) {
            log.warn("[Ollama] Pre-warm ignoré (Ollama non démarré) : {}", e.getMessage());
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Mode conversationnel (RAG + réponses générales)
    // ──────────────────────────────────────────────────────────────────────────

    public String chat(List<OllamaMessage> messages) {
        // max 512 tokens suffisent pour une réponse RH concise
        return callOllama(messages, 0.7, Math.min(maxTokens, 512), 1024);
    }

    /** Appel à température basse (0.1) pour les sorties JSON structurées. */
    public String chatJson(List<OllamaMessage> messages) {
        return callOllama(messages, 0.1, 600, 1024);
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

        // SQL : température 0.05, max 200 tokens, contexte 512 (SQL court)
        String rawSql = callOllama(messages, 0.05, 200, 512);
        log.debug("[SQL-GEN] Réponse brute phi3 : {}", rawSql);
        return rawSql;
    }

    // ──────────────────────────────────────────────────────────────────────────
    //  Appel HTTP commun
    // ──────────────────────────────────────────────────────────────────────────

    private String callOllama(List<OllamaMessage> messages, double temperature, int numPredict, int numCtx) {
        OllamaChatRequest request = new OllamaChatRequest(
            model,
            messages,
            false,
            Map.of(
                "num_predict",
                numPredict,
                "temperature",
                temperature,
                "top_p",
                0.9,
                "repeat_penalty",
                1.1,
                "num_ctx",
                numCtx, // fenêtre de contexte réduite → plus rapide
                "num_thread",
                4, // threads CPU explicites
                "keep_alive",
                -1 // modèle toujours en mémoire (élimine le cold start)
            )
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
