package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatSession getSession() {
        return session;
    }

    public void setSession(ChatSession session) {
        this.session = session;
    }

    public MessageRole getRole() {
        return role;
    }

    public void setRole(MessageRole role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public boolean isEscalatedToHuman() {
        return escalatedToHuman;
    }

    public void setEscalatedToHuman(boolean escalatedToHuman) {
        this.escalatedToHuman = escalatedToHuman;
    }

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }
}
