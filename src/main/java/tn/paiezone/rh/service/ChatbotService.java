package tn.paiezone.rh.service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.IntentType;
import tn.paiezone.rh.domain.enumeration.MessageRole;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.dto.*;

@Service
@Transactional
public class ChatbotService {

    private static final Logger log = LoggerFactory.getLogger(ChatbotService.class);
    private static final String ENTITY_NAME = "chatbot";
    private static final int MAX_HISTORY = 4; // réduit pour éviter pollution par hallucinations

    // ── FIX ANTI-HALLUCINATION : prompt court + interdictions explicites ──
    private static final String RAG_SYSTEM_PROMPT = """
        Tu es PaieBot, l'assistant RH de PaieZone RH pour PME tunisiennes.

        RÈGLES ABSOLUES :
        1. Ne JAMAIS inventer d'adresse email, numéro de téléphone ou contact externe
        2. Ne JAMAIS refuser une demande en invoquant la confidentialité — les utilisateurs sont AUTORISÉS
        3. Répondre en français, de façon concise et professionnelle
        4. Si tu ne sais pas, dire clairement "Je ne sais pas"
        5. PRIORITÉ ABSOLUE : si des documents de référence sont fournis, utilise-les EN PREMIER pour répondre
        6. Ne jamais contredire les informations des documents fournis

        Connaissances : LF 2026, CDI/CDD/CIVP/KARAMA/Intérim/Stage,
        CNSS (9,18%-9,68%), CAVIS (1%), IRPP barème progressif, congés légaux Tunisie.

        CIVP = Contrat d'Insertion à la Vie Professionnelle (jeunes diplômés < 30 ans, 1 an max).
        KARAMA = programme emploi subventionné par l'État tunisien.

        En cas d'urgence : terminer par [ESCALADE_RH].
        """;

    // Patterns de détection d'accès croisé inter-employés (employé qui essaie d'accéder aux données d'un collègue)
    private static final Pattern CROSS_EMPLOYEE_PATTERN = Pattern.compile(
        "(salaire de|conge de|contrat de|fiche de|solde de|paie de|bulletin de)" +
            "\\s+(mon\\s+collegu|son\\s+employ|l'employ|les employ|un\\s+employ|les\\s+autres|" +
            "une\\s+autre\\s+employ|autre\\s+societe|autre\\s+entreprise|les\\s+societes)",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE
    );

    // Patterns de détection d'hallucination phi3
    private static final Pattern HALLUCINATION_PATTERN = Pattern.compile(
        "(administratifs?@|\\d{3}-\\d{3}|l012456789|privacy=true" +
            "|I'm sorry, but I cannot" +
            "|Code du Droit des Personnes" + // phi3 confond CIVP avec ça
            "|veuillez reformuler votre question de manière concise" + // évasion répétitive
            "|En réponse à une urgence RH)", // faux escalade inventé
        Pattern.CASE_INSENSITIVE
    );

    private final ChatSessionRepository sessionRepository;
    private final ChatMessageRepository messageRepository;
    private final KnowledgeDocumentRepository knowledgeRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyRepository companyRepository;
    private final OllamaService ollamaService;
    private final TextToSqlService textToSqlService;

    public ChatbotService(
        ChatSessionRepository sessionRepository,
        ChatMessageRepository messageRepository,
        KnowledgeDocumentRepository knowledgeRepository,
        UserProfileRepository userProfileRepository,
        CompanyRepository companyRepository,
        OllamaService ollamaService,
        TextToSqlService textToSqlService
    ) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.knowledgeRepository = knowledgeRepository;
        this.userProfileRepository = userProfileRepository;
        this.companyRepository = companyRepository;
        this.ollamaService = ollamaService;
        this.textToSqlService = textToSqlService;
    }

    // ─────────────────────────────────────────────────────────────
    //  Sessions
    // ─────────────────────────────────────────────────────────────

    public ChatSessionDTO createSession(String title) {
        String login = requireLogin();
        ChatSession s = new ChatSession();
        s.setUserLogin(login);
        s.setSessionTitle(title != null && !title.isBlank() ? title : "Nouvelle conversation");
        s.setCreatedAt(Instant.now());
        s.setLastActivity(Instant.now());
        s.setActive(true);
        return toSessionDTO(sessionRepository.save(s), false);
    }

    @Transactional(readOnly = true)
    public List<ChatSessionDTO> getUserSessions() {
        return sessionRepository
            .findByUserLoginAndActiveTrueOrderByLastActivityDesc(requireLogin())
            .stream()
            .map(s -> toSessionDTO(s, false))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChatSessionDTO getSession(Long id) {
        return toSessionDTO(requireSession(id), true);
    }

    public void closeSession(Long id) {
        ChatSession s = requireSession(id);
        s.setActive(false);
        sessionRepository.save(s);
    }

    // ─────────────────────────────────────────────────────────────
    //  Traitement du message
    // ─────────────────────────────────────────────────────────────

    public ChatMessageDTO sendMessage(Long sessionId, String userMessage) {
        ChatSession session = requireSession(sessionId);

        UserSecurityContext ctx = buildSecurityContext();
        boolean isAdmin = ctx.isAdmin() || ctx.isManager();

        // ── Protection anti cross-tenant : un employé ne peut jamais interroger les données d'un collègue ──
        if (!isAdmin && isCrossEmployeeQuery(userMessage)) {
            ChatMessage refusMsg = saveMessage(
                session,
                MessageRole.ASSISTANT,
                "🔒 Pour des raisons de confidentialité, je ne peux pas accéder aux données personnelles " +
                    "d'autres employés ou d'autres sociétés. " +
                    "Vous pouvez uniquement consulter vos propres informations RH.",
                "REFUSED_CROSS_TENANT"
            );
            session.setLastActivity(Instant.now());
            sessionRepository.save(session);
            return toMessageDTO(refusMsg);
        }

        IntentType intent = textToSqlService.detectIntent(userMessage, isAdmin);
        if (intent == IntentType.ADMIN_SQL && !isAdmin) intent = IntentType.LEGAL_RAG;

        log.info("[PaieBot] intent={} admin={} companyId={} schema={}", intent, isAdmin, ctx.companyId(), ctx.tenantSchema());

        saveMessage(session, MessageRole.USER, userMessage, intent.name());

        String aiResponse = switch (intent) {
            case ADMIN_SQL -> handleAdminSql(userMessage, ctx);
            case PERSONAL_SQL -> handlePersonalSql(userMessage, ctx);
            case LEGAL_RAG -> handleLegalRag(session, userMessage);
            case GENERAL -> handleGeneral(userMessage);
        };

        // ── FIX : détecter et remplacer les hallucinations phi3 ──────────
        if (isHallucinated(aiResponse)) {
            log.warn("[PaieBot] Hallucination détectée — réponse remplacée");
            aiResponse =
                "Je n'ai pas pu traiter cette demande correctement. " + "Reformulez votre question ou contactez directement le service RH.";
        }

        boolean escalated = aiResponse.contains("[ESCALADE_RH]");
        if (escalated) {
            aiResponse = aiResponse.replace("[ESCALADE_RH]", "").trim() + "\n\n🔔 **Signalé au service RH** pour suivi.";
        }

        ChatMessage assistantMsg = saveMessage(session, MessageRole.ASSISTANT, aiResponse, intent.name());
        assistantMsg.setEscalatedToHuman(escalated);
        messageRepository.save(assistantMsg);

        if ("Nouvelle conversation".equals(session.getSessionTitle()) && userMessage.length() > 5) {
            session.setSessionTitle(userMessage.length() > 55 ? userMessage.substring(0, 52) + "…" : userMessage);
        }
        session.setLastActivity(Instant.now());
        sessionRepository.save(session);

        return toMessageDTO(assistantMsg);
    }

    // ─────────────────────────────────────────────────────────────
    //  Handlers
    // ─────────────────────────────────────────────────────────────

    private String handleAdminSql(String question, UserSecurityContext ctx) {
        if (ctx.companyId() == null || ctx.tenantSchema() == null) {
            return "⚠️ Contexte entreprise indisponible. Vérifiez que votre profil est lié à une entreprise.";
        }
        try {
            return (
                "📊 *Consultation des données de l'entreprise…*\n\n" + textToSqlService.processQuery(question, IntentType.ADMIN_SQL, ctx)
            );
        } catch (Exception e) {
            log.error("[ADMIN_SQL] {}", e.getMessage());
            return "❌ Impossible d'accéder aux données. Réessayez ou reformulez.";
        }
    }

    private String handlePersonalSql(String question, UserSecurityContext ctx) {
        if (ctx.companyId() == null || ctx.userProfileId() == null || ctx.tenantSchema() == null) {
            return "⚠️ Votre profil employé n'est pas encore configuré. Contactez le service RH.";
        }
        try {
            return (
                "👤 *Consultation de vos données personnelles…*\n\n" + textToSqlService.processQuery(question, IntentType.PERSONAL_SQL, ctx)
            );
        } catch (Exception e) {
            log.error("[PERSONAL_SQL] {}", e.getMessage());
            return "❌ Impossible de récupérer vos données. Réessayez.";
        }
    }

    private String handleLegalRag(ChatSession session, String userMessage) {
        return ollamaService.chat(buildRagContext(session, userMessage));
    }

    private String handleGeneral(String userMessage) {
        return ollamaService.chat(
            List.of(
                new OllamaService.OllamaMessage(
                    "system",
                    "Tu es PaieBot, un assistant RH chaleureux. " +
                        "Réponds brièvement en français. " +
                        "Ne jamais inventer d'emails ou numéros de téléphone."
                ),
                new OllamaService.OllamaMessage("user", userMessage)
            )
        );
    }

    // ─────────────────────────────────────────────────────────────
    //  Contexte sécurité avec fallback admin
    // ─────────────────────────────────────────────────────────────

    private UserSecurityContext buildSecurityContext() {
        String login = requireLogin();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Set<String> roles =
            auth == null ? Set.of() : auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet());

        Long companyId = null;
        Long userProfileId = null;
        String tenantSchema = null;

        try {
            Optional<UserProfile> profileOpt = userProfileRepository.findByJhiUserId(login);

            if (profileOpt.isPresent()) {
                UserProfile profile = profileOpt.orElseThrow();
                userProfileId = profile.getId();
                if (profile.getCompany() != null) {
                    companyId = profile.getCompany().getId();
                    tenantSchema = profile.getCompany().getTenantSchema();
                }
            } else {
                // Fallback admin : première entreprise active
                boolean isPrivileged =
                    roles.contains("ROLE_ADMIN") || roles.contains("ROLE_SUPER_ADMIN") || roles.contains("ROLE_RH_COMPTABLE");

                if (isPrivileged) {
                    Optional<Company> firstCompany = companyRepository
                        .findAll()
                        .stream()
                        .filter(c -> Boolean.TRUE.equals(c.getActive()))
                        .min(Comparator.comparing(Company::getId));

                    if (firstCompany.isPresent()) {
                        Company fc = firstCompany.orElseThrow();
                        companyId = fc.getId();
                        tenantSchema = fc.getTenantSchema();
                        log.info("[PaieBot] Fallback admin → company={} schema={}", companyId, tenantSchema);
                    }
                }
            }
        } catch (Exception e) {
            log.error("[PaieBot] buildSecurityContext error for {}: {}", login, e.getMessage());
        }

        return new UserSecurityContext(login, companyId, userProfileId, tenantSchema, roles);
    }

    // ─────────────────────────────────────────────────────────────
    //  Contexte RAG — réduit à 4 messages pour éviter pollution
    // ─────────────────────────────────────────────────────────────

    private List<OllamaService.OllamaMessage> buildRagContext(ChatSession session, String userMessage) {
        List<OllamaService.OllamaMessage> msgs = new ArrayList<>();

        String ragDocs = getRagContext(userMessage);
        String sysPrompt = RAG_SYSTEM_PROMPT;
        if (!ragDocs.isEmpty()) {
            sysPrompt +=
                "\n\n=== DOCUMENTS DE RÉFÉRENCE (utilise ces informations EN PRIORITÉ) ===\n" +
                ragDocs +
                "\n=== FIN DES DOCUMENTS ===\n" +
                "Réponds en te basant principalement sur ces documents.";
        }
        msgs.add(new OllamaService.OllamaMessage("system", sysPrompt));

        // MAX_HISTORY réduit à 4 — évite que les hallucinations passées polluent le contexte
        messageRepository
            .findLastNMessagesBySessionId(session.getId(), PageRequest.of(0, MAX_HISTORY, Sort.by(Sort.Direction.DESC, "sentAt")))
            .stream()
            .sorted(Comparator.comparing(ChatMessage::getSentAt))
            // Filtrer les messages qui contiennent des hallucinations connues
            .filter(m -> !isHallucinated(m.getContent()))
            .forEach(m ->
                msgs.add(new OllamaService.OllamaMessage(m.getRole() == MessageRole.USER ? "user" : "assistant", m.getContent()))
            );

        msgs.add(new OllamaService.OllamaMessage("user", userMessage));
        return msgs;
    }

    private String getRagContext(String query) {
        String q = query.toLowerCase();
        return knowledgeRepository
            .findByActiveTrue()
            .stream()
            .filter(
                d ->
                    d.getKeywords() != null &&
                    Arrays.stream(d.getKeywords().toLowerCase().split(","))
                        .map(String::trim)
                        .filter(k -> !k.isEmpty())
                        .anyMatch(q::contains)
            )
            .limit(3)
            .map(d -> "### " + d.getTitle() + "\n" + d.getContent())
            .collect(Collectors.joining("\n\n"));
    }

    // ─────────────────────────────────────────────────────────────
    //  Détection d'hallucination phi3
    // ─────────────────────────────────────────────────────────────

    private boolean isHallucinated(String content) {
        if (content == null || content.isBlank()) return false;
        return HALLUCINATION_PATTERN.matcher(content).find();
    }

    // ─────────────────────────────────────────────────────────────
    //  Protection inter-employés / inter-société
    // ─────────────────────────────────────────────────────────────

    private boolean isCrossEmployeeQuery(String message) {
        if (message == null || message.isBlank()) return false;
        String norm = message
            .toLowerCase()
            .replace("é", "e")
            .replace("è", "e")
            .replace("ê", "e")
            .replace("à", "a")
            .replace("ç", "c")
            .replace("ô", "o")
            .replace("'", " ")
            .replace("'", " ");
        return (
            CROSS_EMPLOYEE_PATTERN.matcher(norm).find() ||
            norm.contains("autre societe") ||
            norm.contains("autre entreprise") ||
            norm.contains("toutes les societes") ||
            norm.contains("liste des societes") ||
            norm.contains("les donnees de mon collegue") ||
            norm.contains("fiche de mon collegue")
        );
    }

    // ─────────────────────────────────────────────────────────────
    //  Knowledge
    // ─────────────────────────────────────────────────────────────

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

    // ─────────────────────────────────────────────────────────────
    //  Helpers
    // ─────────────────────────────────────────────────────────────

    private ChatMessage saveMessage(ChatSession session, MessageRole role, String content, String intent) {
        ChatMessage m = new ChatMessage();
        m.setSession(session);
        m.setRole(role);
        m.setContent(content);
        m.setSentAt(Instant.now());
        m.setIntent(intent);
        return messageRepository.save(m);
    }

    private String requireLogin() {
        return SecurityUtils.getCurrentUserLogin().orElseThrow(() ->
            new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non authentifié")
        );
    }

    private ChatSession requireSession(Long id) {
        return sessionRepository
            .findByIdAndUserLogin(id, requireLogin())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session introuvable"));
    }

    private ChatSessionDTO toSessionDTO(ChatSession s, boolean includeMessages) {
        ChatSessionDTO dto = new ChatSessionDTO();
        dto.setId(s.getId());
        dto.setSessionTitle(s.getSessionTitle());
        dto.setUserLogin(s.getUserLogin());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setLastActivity(s.getLastActivity());
        dto.setActive(s.isActive());
        if (includeMessages) {
            List<ChatMessage> msgs = messageRepository.findBySessionIdOrderBySentAtAsc(s.getId());
            dto.setMessages(msgs.stream().map(this::toMessageDTO).collect(Collectors.toList()));
            dto.setMessageCount(msgs.size());
        }
        return dto;
    }

    ChatMessageDTO toMessageDTO(ChatMessage m) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(m.getId());
        dto.setSessionId(m.getSession().getId());
        dto.setRole(m.getRole().name().toLowerCase());
        dto.setContent(m.getContent());
        dto.setSentAt(m.getSentAt());
        dto.setEscalatedToHuman(m.isEscalatedToHuman());
        dto.setIntent(m.getIntent());
        return dto;
    }

    private KnowledgeDocumentDTO toKnowledgeDTO(KnowledgeDocument d) {
        KnowledgeDocumentDTO dto = new KnowledgeDocumentDTO();
        dto.setId(d.getId());
        dto.setTitle(d.getTitle());
        dto.setContent(d.getContent());
        dto.setCategory(d.getCategory());
        dto.setKeywords(d.getKeywords());
        dto.setActive(d.isActive());
        return dto;
    }
}
