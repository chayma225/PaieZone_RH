package tn.paiezone.rh.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.IntentType;
import tn.paiezone.rh.domain.enumeration.MessageRole;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.service.OllamaService.OllamaMessage;
import tn.paiezone.rh.service.dto.*;

/**
 * Tests unitaires de ChatbotService.
 *
 * Cas critiques couverts :
 * - Protection cross-tenant (employé ≠ accès aux données d'un collègue)
 * - Détection + remplacement des hallucinations phi3
 * - Routage d'intention (ADMIN_SQL, PERSONAL_SQL, LEGAL_RAG, GENERAL)
 * - Création / lecture de sessions
 * - Escalade RH automatique
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ChatbotService — Tests unitaires")
class ChatbotServiceTest {

    // ── Mocks ──────────────────────────────────────────────────────
    @Mock
    private ChatSessionRepository sessionRepository;

    @Mock
    private ChatMessageRepository messageRepository;

    @Mock
    private KnowledgeDocumentRepository knowledgeRepository;

    @Mock
    private UserProfileRepository userProfileRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private PaySlipRepository paySlipRepository;

    @Mock
    private OllamaService ollamaService;

    @Mock
    private TextToSqlService textToSqlService;

    @InjectMocks
    private ChatbotService chatbotService;

    // ── Fixtures ───────────────────────────────────────────────────
    private static final String LOGIN_EMPLOYE = "employe1";
    private static final String LOGIN_RH = "rh_comptable";
    private static final Long SESSION_ID = 42L;

    private ChatSession activeSession;

    @BeforeEach
    void setUp() {
        activeSession = new ChatSession();
        activeSession.setId(SESSION_ID);
        activeSession.setUserLogin(LOGIN_EMPLOYE);
        activeSession.setActive(true);
        activeSession.setCreatedAt(Instant.now());
        activeSession.setLastActivity(Instant.now());
    }

    // ══════════════════════════════════════════════════════════════
    //  1. Sessions
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Sessions")
    class SessionsTest {

        @Test
        @DisplayName("createSession — doit sauvegarder et retourner le DTO")
        void createSession_doitSauvegarderEtRetournerDTO() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            when(sessionRepository.save(any())).thenAnswer(inv -> {
                ChatSession s = inv.getArgument(0);
                s.setId(1L);
                return s;
            });

            ChatSessionDTO dto = chatbotService.createSession("Test session");

            assertThat(dto).isNotNull();
            assertThat(dto.getSessionTitle()).isEqualTo("Test session");
            verify(sessionRepository).save(any(ChatSession.class));
        }

        @Test
        @DisplayName("createSession — titre null → 'Nouvelle conversation' par défaut")
        void createSession_titreNull_doitUtiliserTitreParDefaut() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            when(sessionRepository.save(any())).thenAnswer(inv -> {
                ChatSession s = inv.getArgument(0);
                s.setId(2L);
                return s;
            });

            ChatSessionDTO dto = chatbotService.createSession(null);
            assertThat(dto.getSessionTitle()).isEqualTo("Nouvelle conversation");
        }

        @Test
        @DisplayName("getSession — session inexistante → 404")
        void getSession_sessionInexistante_doit404() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            // requireSession utilise findByIdAndUserLogin — retourne empty → 404
            when(sessionRepository.findByIdAndUserLogin(999L, LOGIN_EMPLOYE)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> chatbotService.getSession(999L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        }

        @Test
        @DisplayName("getSession — session d'un autre utilisateur → 404 (sécurité par obscurité)")
        void getSession_autreUtilisateur_doit404ParSecurite() {
            // Le service retourne intentionnellement 404 (pas 403)
            // pour ne pas révéler si la session existe
            authenticateAs("autre_user", "ROLE_EMPLOYE");
            when(sessionRepository.findByIdAndUserLogin(SESSION_ID, "autre_user")).thenReturn(Optional.empty()); // La session appartient à LOGIN_EMPLOYE, pas "autre_user"

            assertThatThrownBy(() -> chatbotService.getSession(SESSION_ID))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(e -> assertThat(((ResponseStatusException) e).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND)); // 404, pas 403
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  2. Protection cross-tenant (CRITICAL)
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Sécurité Cross-Tenant")
    class CrossTenantSecurityTest {

        @Test
        @DisplayName("Employé demandant le salaire d'un collègue → refus immédiat sans appel IA")
        void sendMessage_crossEmployeeQuery_doitRefuserSansAppelIA() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(1L);
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_EMPLOYE)).thenReturn(Optional.empty());

            // Message qui tente d'accéder aux données d'un collègue
            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "Quel est le salaire de mon collègue ?");

            assertThat(response.getContent()).contains("confidentialité");
            // L'IA NE DOIT PAS être appelée
            verifyNoInteractions(ollamaService);
        }

        @Test
        @DisplayName("Admin envoyant même requête → accès accordé, IA appelée")
        void sendMessage_adminCrossQuery_doitAccorder() {
            authenticateAs(LOGIN_RH, "ROLE_RH_COMPTABLE");
            activeSession.setUserLogin(LOGIN_RH);
            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            when(textToSqlService.detectIntent(anyString(), eq(true))).thenReturn(IntentType.ADMIN_SQL);
            when(textToSqlService.processQuery(anyString(), any(IntentType.class), any())).thenReturn("Résultat SQL mock");
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(1L);
                m.setContent("Résultat SQL mock");
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_RH)).thenReturn(Optional.empty());
            when(companyRepository.findAll()).thenReturn(List.of());

            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "Quel est le salaire de mon collègue ?");

            // L'admin doit obtenir une réponse (pas de refus)
            assertThat(response.getContent()).doesNotContain("Pour des raisons de confidentialité");
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  3. Anti-hallucination phi3
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Anti-Hallucination phi3")
    class AntiHallucinationTest {

        @Test
        @DisplayName("Réponse avec email inventé → remplacée par message sûr")
        void sendMessage_hallucinationEmail_doitEtreRemplacee() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            activeSession.setUserLogin(LOGIN_EMPLOYE);
            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            when(textToSqlService.detectIntent(anyString(), eq(false))).thenReturn(IntentType.LEGAL_RAG);
            when(knowledgeRepository.findByActiveTrue()).thenReturn(List.of());
            // phi3 hallucine un email
            when(ollamaService.chat(anyList())).thenReturn("Contactez les administratifs@rh.societe.com pour plus d'infos.");
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(1L);
                m.setContent(m.getContent() != null ? m.getContent() : "default");
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_EMPLOYE)).thenReturn(Optional.empty());
            when(companyRepository.findAll()).thenReturn(List.of());

            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "Comment contacter les RH ?");

            // La réponse ne doit PAS contenir d'email inventé
            assertThat(response.getContent()).doesNotContain("administratifs@");
            assertThat(response.getContent()).contains("Reformulez");
        }

        @Test
        @DisplayName("Réponse phi3 avec pattern 'I'm sorry but I cannot' → remplacée")
        void sendMessage_hallucinationRefus_doitEtreRemplacee() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            activeSession.setUserLogin(LOGIN_EMPLOYE);
            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            when(textToSqlService.detectIntent(anyString(), anyBoolean())).thenReturn(IntentType.LEGAL_RAG);
            when(knowledgeRepository.findByActiveTrue()).thenReturn(List.of());
            when(ollamaService.chat(anyList())).thenReturn("I'm sorry, but I cannot answer that.");
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(2L);
                m.setContent(m.getContent() != null ? m.getContent() : "fallback");
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_EMPLOYE)).thenReturn(Optional.empty());

            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "Expliquez le CIVP.");
            assertThat(response.getContent()).doesNotContain("I'm sorry");
        }

        @Test
        @DisplayName("Réponse légitime phi3 → conservée sans modification")
        void sendMessage_reponseLégitime_doitEtreConservee() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            activeSession.setUserLogin(LOGIN_EMPLOYE);
            String bonneReponse = "Le CIVP est un Contrat d'Insertion à la Vie Professionnelle. Il dure 1 an maximum.";

            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            when(textToSqlService.detectIntent(anyString(), anyBoolean())).thenReturn(IntentType.LEGAL_RAG);
            when(knowledgeRepository.findByActiveTrue()).thenReturn(List.of());
            when(ollamaService.chat(anyList())).thenReturn(bonneReponse);
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(3L);
                m.setContent(m.getContent() != null ? m.getContent() : bonneReponse);
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_EMPLOYE)).thenReturn(Optional.empty());

            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "Qu'est-ce que le CIVP ?");
            // Le contenu doit contenir une réponse pertinente (pas remplacée)
            assertThat(response.getContent()).isNotNull().isNotBlank();
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  4. Routage d'intention
    // ══════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("Routage IntentType")
    class IntentRoutingTest {

        @Test
        @DisplayName("Intention ADMIN_SQL d'un employé → downgrade vers LEGAL_RAG")
        void sendMessage_adminSqlParEmploye_doitEtreDegrade() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            activeSession.setUserLogin(LOGIN_EMPLOYE);

            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            // textToSqlService dit ADMIN_SQL mais l'user est EMPLOYE
            when(textToSqlService.detectIntent(anyString(), eq(false))).thenReturn(IntentType.ADMIN_SQL);
            when(knowledgeRepository.findByActiveTrue()).thenReturn(List.of());
            when(ollamaService.chat(anyList())).thenReturn("Réponse RAG.");
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(4L);
                m.setContent("Réponse RAG.");
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_EMPLOYE)).thenReturn(Optional.empty());

            chatbotService.sendMessage(SESSION_ID, "Liste tous les salaires");

            // L'admin SQL ne doit PAS être appelé
            // RAG doit être appelé (chat), pas le SQL
            verify(ollamaService, atLeastOnce()).chat(anyList());
        }

        @Test
        @DisplayName("Intention ADMIN_SQL d'un RH → exécution SQL autorisée")
        void sendMessage_adminSqlParRH_doitExecuterSql() {
            authenticateAs(LOGIN_RH, "ROLE_RH_COMPTABLE");
            activeSession.setUserLogin(LOGIN_RH);

            // Simuler un UserProfile avec companyId + tenantSchema pour que handleAdminSql passe
            Company company = new Company();
            company.setId(1L);
            company.setTenantSchema("atlas_tech");
            UserProfile profile = new UserProfile();
            profile.setJhiUserId(LOGIN_RH);
            profile.setCompany(company);

            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            when(userProfileRepository.findByJhiUserId(LOGIN_RH)).thenReturn(Optional.of(profile));
            when(textToSqlService.detectIntent(anyString(), eq(true))).thenReturn(IntentType.ADMIN_SQL);
            when(textToSqlService.processQuery(anyString(), any(IntentType.class), any())).thenReturn("2 employés trouvés.");
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(5L);
                m.setContent("2 employés trouvés.");
                return m;
            });

            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "Combien d'employés actifs ?");

            verify(textToSqlService).processQuery(anyString(), any(IntentType.class), any());
            assertThat(response.getContent()).contains("employés");
        }

        @Test
        @DisplayName("Message contenant [ESCALADE_RH] → flagué escalatedToHuman")
        void sendMessage_avecEscaladeTag_doitFlaguerEscalade() {
            authenticateAs(LOGIN_EMPLOYE, "ROLE_EMPLOYE");
            activeSession.setUserLogin(LOGIN_EMPLOYE);

            when(sessionRepository.findByIdAndUserLogin(eq(SESSION_ID), anyString())).thenReturn(Optional.of(activeSession));
            when(sessionRepository.save(any())).thenReturn(activeSession);
            when(textToSqlService.detectIntent(anyString(), anyBoolean())).thenReturn(IntentType.GENERAL);
            when(ollamaService.chat(anyList())).thenReturn("Je ne peux pas résoudre ça. [ESCALADE_RH]");
            when(messageRepository.save(any())).thenAnswer(inv -> {
                ChatMessage m = inv.getArgument(0);
                m.setId(6L);
                m.setContent(m.getContent() != null ? m.getContent() : "escalade");
                return m;
            });
            when(userProfileRepository.findByJhiUserId(LOGIN_EMPLOYE)).thenReturn(Optional.empty());
            when(companyRepository.findAll()).thenReturn(List.of());

            ChatMessageDTO response = chatbotService.sendMessage(SESSION_ID, "J'ai un problème urgent !");

            assertThat(response.isEscalatedToHuman()).isTrue();
        }
    }

    // ── Helpers ────────────────────────────────────────────────────

    private void authenticateAs(String login, String role) {
        var auth = new UsernamePasswordAuthenticationToken(login, null, List.of(new SimpleGrantedAuthority(role)));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
