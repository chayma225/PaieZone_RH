package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.service.ChatbotService;
import tn.paiezone.rh.service.dto.*;

/**
 * REST Controller pour le chatbot PaieBot.
 *
 * Endpoints :
 *   POST   /api/chatbot/sessions              → Créer une session
 *   GET    /api/chatbot/sessions              → Lister les sessions de l'utilisateur
 *   GET    /api/chatbot/sessions/{id}         → Récupérer une session + ses messages
 *   POST   /api/chatbot/sessions/{id}/messages → Envoyer un message (appelle Ollama)
 *   DELETE /api/chatbot/sessions/{id}         → Clôturer une session
 *   POST   /api/chatbot/knowledge             → Ajouter un document RAG (ADMIN seulement)
 *   GET    /api/chatbot/health                → Vérifier que le service est actif
 */
@RestController
@RequestMapping("/api/chatbot")
@PreAuthorize("isAuthenticated()")
public class ChatbotResource {

    private static final Logger log = LoggerFactory.getLogger(ChatbotResource.class);

    private final ChatbotService chatbotService;

    public ChatbotResource(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    /** Créer une nouvelle session de conversation */
    @PostMapping("/sessions")
    public ResponseEntity<ChatSessionDTO> createSession(@RequestBody(required = false) Map<String, String> body) {
        log.debug("REST POST /api/chatbot/sessions");
        String title = body != null ? body.get("title") : null;
        return ResponseEntity.ok(chatbotService.createSession(title));
    }

    /** Lister les sessions actives de l'utilisateur connecté */
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSessionDTO>> getUserSessions() {
        log.debug("REST GET /api/chatbot/sessions");
        return ResponseEntity.ok(chatbotService.getUserSessions());
    }

    /** Récupérer une session avec tout son historique de messages */
    @GetMapping("/sessions/{id}")
    public ResponseEntity<ChatSessionDTO> getSession(@PathVariable Long id) {
        log.debug("REST GET /api/chatbot/sessions/{}", id);
        return ResponseEntity.ok(chatbotService.getSession(id));
    }

    /**
     * Envoyer un message dans une session.
     * Le service appelle Ollama phi3 et retourne la réponse IA.
     */
    @PostMapping("/sessions/{id}/messages")
    public ResponseEntity<ChatMessageDTO> sendMessage(@PathVariable Long id, @Valid @RequestBody ChatRequestDTO request) {
        log.debug("REST POST /api/chatbot/sessions/{}/messages", id);
        return ResponseEntity.ok(chatbotService.sendMessage(id, request.getMessage()));
    }

    /** Clôturer (archiver) une session */
    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> closeSession(@PathVariable Long id) {
        log.debug("REST DELETE /api/chatbot/sessions/{}", id);
        chatbotService.closeSession(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ajouter un document dans la base de connaissances RAG.
     * Réservé aux administrateurs.
     */
    @PostMapping("/knowledge")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPER_ADMIN')")
    public ResponseEntity<KnowledgeDocumentDTO> addKnowledge(@Valid @RequestBody KnowledgeDocumentDTO dto) {
        log.debug("REST POST /api/chatbot/knowledge — titre: {}", dto.getTitle());
        return ResponseEntity.ok(chatbotService.addKnowledge(dto));
    }

    /** Dernier bulletin de paie de l'employé connecté */
    @GetMapping("/my-bulletin")
    public ResponseEntity<Map<String, Object>> getMyLatestBulletin() {
        log.debug("REST GET /api/chatbot/my-bulletin");
        return ResponseEntity.ok(chatbotService.getMyLatestBulletin());
    }

    /** Health-check rapide pour le frontend */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "model", "phi3:latest"));
    }
}
