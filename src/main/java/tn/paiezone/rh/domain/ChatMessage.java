package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import tn.paiezone.rh.domain.enumeration.MessageIntent;
import tn.paiezone.rh.domain.enumeration.MessageRole;

@Entity
@Table(name = "chat_message")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chatMessageSequenceGenerator")
    @SequenceGenerator(name = "chatMessageSequenceGenerator", sequenceName = "chat_message_sequence", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnoreProperties(value = { "messages" }, allowSetters = true)
    private ChatSession session;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private MessageRole role;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "escalated_to_human")
    private boolean escalatedToHuman;

    @Column(name = "intent", length = 50)
    private String intent;

    @Column(name = "action_taken", length = 255)
    private String actionTaken;

    @Column(name = "token_used")
    private Integer tokenUsed;

    @Column(name = "error_occurred")
    private Boolean errorOccurred;

    // ── Getters / Setters ───────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatMessage id(Long id) {
        this.id = id;
        return this;
    }

    public ChatSession getSession() {
        return session;
    }

    public void setSession(ChatSession session) {
        this.session = session;
    }

    public ChatMessage session(ChatSession session) {
        this.session = session;
        return this;
    }

    public MessageRole getRole() {
        return role;
    }

    public void setRole(MessageRole role) {
        this.role = role;
    }

    public ChatMessage role(MessageRole role) {
        this.role = role;
        return this;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public ChatMessage content(String content) {
        this.content = content;
        return this;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public ChatMessage sentAt(Instant sentAt) {
        this.sentAt = sentAt;
        return this;
    }

    public boolean isEscalatedToHuman() {
        return escalatedToHuman;
    }

    public void setEscalatedToHuman(boolean escalatedToHuman) {
        this.escalatedToHuman = escalatedToHuman;
    }

    public ChatMessage escalatedToHuman(boolean escalatedToHuman) {
        this.escalatedToHuman = escalatedToHuman;
        return this;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public ChatMessage intent(String intent) {
        this.intent = intent;
        return this;
    }

    public ChatMessage intent(MessageIntent intent) {
        this.intent = intent != null ? intent.name() : null;
        return this;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public ChatMessage actionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
        return this;
    }

    public Integer getTokenUsed() {
        return tokenUsed;
    }

    public void setTokenUsed(Integer tokenUsed) {
        this.tokenUsed = tokenUsed;
    }

    public ChatMessage tokenUsed(Integer tokenUsed) {
        this.tokenUsed = tokenUsed;
        return this;
    }

    public Boolean getErrorOccurred() {
        return errorOccurred;
    }

    public void setErrorOccurred(Boolean errorOccurred) {
        this.errorOccurred = errorOccurred;
    }

    public ChatMessage errorOccurred(Boolean errorOccurred) {
        this.errorOccurred = errorOccurred;
        return this;
    }

    // ── equals / hashCode / toString ────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatMessage)) return false;
        return id != null && id.equals(((ChatMessage) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ChatMessage{id=" + id + ", role=" + role + ", intent='" + intent + "', sentAt=" + sentAt + "}";
    }
}
