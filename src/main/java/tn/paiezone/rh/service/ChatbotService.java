package tn.paiezone.rh.service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.MessageRole;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.dto.*;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@Service
@Transactional
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private static final String ENTITY_NAME = "chatbot";
    private static final int MAX_HISTORY_MESSAGES = 10;

    private static final String SYSTEM_PROMPT = """
        Tu es PaieBot, l'assistant RH intelligent de PaieZone RH — logiciel de gestion RH et paie pour les PME tunisiennes.

        Tu maîtrises :
        - La législation du travail tunisienne et la Loi de Finances 2026
        - Les contrats : CDI, CDD (max 4 ans, 2 renouvellements → CDI auto), CIVP, KARAMA, Intérim, Stage
        - Les cotisations : CNSS salarié (9,18% à 9,68%), CAVIS (1%)
        - L'IRPP 2026 : 0% / 15% / 20% / 26% / 28% / 35% (barème progressif)
        - Frais professionnels déductibles : 10% du salaire brut (plafond 2 000 DT/an)
        - Heures supplémentaires : +25% (jour), +50% (nuit et jours fériés)
        - Procédures de congé : annuel (1 jour/mois), maladie, maternité (30j + 15j), sans solde
        - Bulletins de paie et déclarations sociales CNSS, CAVIS, IRPP

        Instructions :
        - Réponds TOUJOURS en français, de manière claire et professionnelle
        - Sois précis sur les taux et calculs légaux tunisiens
        - Si la demande concerne une action concrète, explique la procédure dans PaieZone RH
        - Si tu ne sais pas, dis-le et suggère de contacter le service RH
        - En cas d'urgence ou de situation nécessitant une intervention humaine, termine par [ESCALADE_RH]
        """;

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final KnowledgeDocumentRepository knowledgeRepository;
    private final OllamaService ollamaService;

    public ChatbotService(
        ChatSessionRepository sessionRepository,
        ChatMessageRepository messageRepository,
        KnowledgeDocumentRepository knowledgeRepository,
        OllamaService ollamaService
    ) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.knowledgeRepository = knowledgeRepository;
        this.ollamaService = ollamaService;
    }

    // ── Créer une session ────────────────────────────────────────────

    public ChatSessionDTO createSession(String title) {
        String login = requireLogin();
        ChatSession session = new ChatSession();
        session.setUserLogin(login);
        session.setSessionTitle(title != null && !title.isBlank() ? title : "Nouvelle conversation");
        session.setCreatedAt(Instant.now());
        session.setLastActivity(Instant.now());
        session.setActive(true);
        log.info("Nouvelle session chatbot pour [{}]", login);
        return toSessionDTO(sessionRepository.save(session), false);
    }

    // ── Lister les sessions de l'utilisateur ────────────────────────

    @Transactional(readOnly = true)
    public List<ChatSessionDTO> getUserSessions() {
        return sessionRepository
            .findByUserLoginAndActiveTrueOrderByLastActivityDesc(requireLogin())
            .stream()
            .map(s -> toSessionDTO(s, false))
            .collect(Collectors.toList());
    }

    // ── Récupérer une session avec ses messages ──────────────────────

    @Transactional(readOnly = true)
    public ChatSessionDTO getSession(Long sessionId) {
        ChatSession session = requireSession(sessionId);
        return toSessionDTO(session, true);
    }

    // ── Clôturer une session ─────────────────────────────────────────

    public void closeSession(Long sessionId) {
        ChatSession session = requireSession(sessionId);
        session.setActive(false);
        sessionRepository.save(session);
    }

    // ── Envoyer un message → Ollama ──────────────────────────────────

    public ChatMessageDTO sendMessage(Long sessionId, String userMessage) {
        String login = requireLogin();
        ChatSession session = requireSession(sessionId);

        String intent = detectIntent(userMessage);
        log.debug("Message [intent={}] session={}", intent, sessionId);

        // 1. Sauvegarder le message utilisateur
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setRole(MessageRole.USER);
        userMsg.setContent(userMessage.trim());
        userMsg.setSentAt(Instant.now());
        userMsg.setIntent(intent);
        messageRepository.save(userMsg);

        // 2. Construire le contexte Ollama
        List<OllamaService.OllamaMessage> ollamaMessages = buildOllamaContext(session, userMessage);

        // 3. Appeler Ollama (gère les erreurs en interne, ne lève jamais d'exception)
        String aiResponse = ollamaService.chat(ollamaMessages);

        // 4. Détecter l'escalade RH
        boolean escalated = aiResponse.contains("[ESCALADE_RH]");
        if (escalated) {
            aiResponse =
                aiResponse.replace("[ESCALADE_RH]", "").trim() +
                "\n\n🔔 **Cette demande a été signalée à l'équipe RH** pour un suivi personnalisé.";
        }

        // 5. Sauvegarder la réponse de l'assistant
        ChatMessage assistantMsg = new ChatMessage();
        assistantMsg.setSession(session);
        assistantMsg.setRole(MessageRole.ASSISTANT);
        assistantMsg.setContent(aiResponse);
        assistantMsg.setSentAt(Instant.now());
        assistantMsg.setEscalatedToHuman(escalated);
        messageRepository.save(assistantMsg);

        // 6. Mettre à jour le titre et lastActivity de la session
        if ("Nouvelle conversation".equals(session.getSessionTitle()) && userMessage.length() > 5) {
            session.setSessionTitle(userMessage.length() > 60 ? userMessage.substring(0, 57) + "…" : userMessage);
        }
        session.setLastActivity(Instant.now());
        sessionRepository.save(session);

        return toMessageDTO(assistantMsg);
    }

    // ── Ajouter un document RAG ──────────────────────────────────────

    public KnowledgeDocumentDTO addKnowledge(KnowledgeDocumentDTO dto) {
        KnowledgeDocument doc = new KnowledgeDocument();
        doc.setTitle(dto.getTitle());
        doc.setContent(dto.getContent());
        doc.setCategory(dto.getCategory());
        doc.setKeywords(dto.getKeywords());
        doc.setActive(true);
        doc.setCreatedAt(Instant.now());
        return toKnowledgeDTO(knowledgeRepository.save(doc));
    }

    // ── Helpers privés ───────────────────────────────────────────────

    private List<OllamaService.OllamaMessage> buildOllamaContext(ChatSession session, String userMessage) {
        List<OllamaService.OllamaMessage> messages = new ArrayList<>();

        // Prompt système + contexte RAG
        String ragContext = getRagContext(userMessage);
        String systemContent = SYSTEM_PROMPT;
        if (!ragContext.isEmpty()) {
            systemContent += "\n\n📚 Informations de référence pertinentes :\n" + ragContext;
        }
        messages.add(new OllamaService.OllamaMessage("system", systemContent));

        // FIX : utilise findLastNMessagesBySessionId (Long) au lieu de l'entité
        List<ChatMessage> history = messageRepository.findLastNMessagesBySessionId(
            session.getId(),
            PageRequest.of(0, MAX_HISTORY_MESSAGES, Sort.by(Sort.Direction.DESC, "sentAt"))
        );
        Collections.reverse(history);
        for (ChatMessage msg : history) {
            String role = msg.getRole() == MessageRole.USER ? "user" : "assistant";
            messages.add(new OllamaService.OllamaMessage(role, msg.getContent()));
        }

        messages.add(new OllamaService.OllamaMessage("user", userMessage));
        return messages;
    }

    private String getRagContext(String query) {
        String queryLower = query.toLowerCase();
        return knowledgeRepository
            .findByActiveTrue()
            .stream()
            .filter(doc -> {
                if (doc.getKeywords() == null) return false;
                return Arrays.stream(doc.getKeywords().toLowerCase().split(","))
                    .map(String::trim)
                    .filter(kw -> !kw.isEmpty())
                    .anyMatch(queryLower::contains);
            })
            .limit(3)
            .map(doc -> "### " + doc.getTitle() + "\n" + doc.getContent())
            .collect(Collectors.joining("\n\n"));
    }

    private String detectIntent(String message) {
        String lower = message.toLowerCase();
        if (lower.matches(".*(congé|conge|vacances|absence|arrêt maladie|repos).*")) return "DEMANDE_CONGE";
        if (lower.matches(".*(bulletin|fiche de paie|salaire|virement|prime).*")) return "CONSULTATION_BULLETIN";
        if (lower.matches(".*(urgent|grave|plainte|harcèlement|litige|tribunal).*")) return "ESCALADE";
        if (lower.matches(".*(contrat|cdi|cdd|civp|karama|stage|intérim|interim).*")) return "QUESTION_CONTRAT";
        if (lower.matches(".*(cnss|irpp|cavis|cotis|retenue|imposition|taxe).*")) return "QUESTION_COTISATION";
        return "QUESTION_RH";
    }

    private String requireLogin() {
        return SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new BadRequestAlertException("Utilisateur non authentifié", ENTITY_NAME, "notauthenticated")
        );
    }

    private ChatSession requireSession(Long id) {
        return sessionRepository
            .findByIdAndUserLogin(id, requireLogin())
            .orElseThrow(() -> new BadRequestAlertException("Session introuvable", ENTITY_NAME, "sessionnotfound"));
    }

    // ── Mappers DTO ──────────────────────────────────────────────────

    private ChatSessionDTO toSessionDTO(ChatSession session, boolean includeMessages) {
        ChatSessionDTO dto = new ChatSessionDTO();
        dto.setId(session.getId());
        dto.setSessionTitle(session.getSessionTitle());
        dto.setUserLogin(session.getUserLogin());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setLastActivity(session.getLastActivity());
        dto.setActive(session.isActive());
        if (includeMessages) {
            // FIX : utilise findBySessionIdOrderBySentAtAsc (Long)
            List<ChatMessage> msgs = messageRepository.findBySessionIdOrderBySentAtAsc(session.getId());
            dto.setMessages(msgs.stream().map(this::toMessageDTO).collect(Collectors.toList()));
            dto.setMessageCount(msgs.size());
        }
        return dto;
    }

    ChatMessageDTO toMessageDTO(ChatMessage msg) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(msg.getId());
        dto.setSessionId(msg.getSession().getId());
        dto.setRole(msg.getRole().name().toLowerCase()); // "user" | "assistant"
        dto.setContent(msg.getContent());
        dto.setSentAt(msg.getSentAt());
        dto.setEscalatedToHuman(msg.isEscalatedToHuman());
        dto.setIntent(msg.getIntent());
        return dto;
    }

    private KnowledgeDocumentDTO toKnowledgeDTO(KnowledgeDocument doc) {
        KnowledgeDocumentDTO dto = new KnowledgeDocumentDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setContent(doc.getContent());
        dto.setCategory(doc.getCategory());
        dto.setKeywords(doc.getKeywords());
        dto.setActive(doc.isActive());
        return dto;
    }
}
