package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.MessageIntent;
import tn.paiezone.rh.domain.enumeration.MessageRole;

/**
 * A ChatMessage.
 */
@Entity
@Table(name = "chat_message")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatMessage implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private MessageRole role;

    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "intent")
    private MessageIntent intent;

    @Size(max = 200)
    @Column(name = "action_taken", length = 200)
    private String actionTaken;

    @Column(name = "token_used")
    private Integer tokenUsed;

    @NotNull
    @Column(name = "sent_at", nullable = false)
    private Instant sentAt;

    @Column(name = "error_occurred")
    private Boolean errorOccurred;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "employee" }, allowSetters = true)
    private ChatSession session;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ChatMessage id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MessageRole getRole() {
        return this.role;
    }

    public ChatMessage role(MessageRole role) {
        this.setRole(role);
        return this;
    }

    public void setRole(MessageRole role) {
        this.role = role;
    }

    public String getContent() {
        return this.content;
    }

    public ChatMessage content(String content) {
        this.setContent(content);
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageIntent getIntent() {
        return this.intent;
    }

    public ChatMessage intent(MessageIntent intent) {
        this.setIntent(intent);
        return this;
    }

    public void setIntent(MessageIntent intent) {
        this.intent = intent;
    }

    public String getActionTaken() {
        return this.actionTaken;
    }

    public ChatMessage actionTaken(String actionTaken) {
        this.setActionTaken(actionTaken);
        return this;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public Integer getTokenUsed() {
        return this.tokenUsed;
    }

    public ChatMessage tokenUsed(Integer tokenUsed) {
        this.setTokenUsed(tokenUsed);
        return this;
    }

    public void setTokenUsed(Integer tokenUsed) {
        this.tokenUsed = tokenUsed;
    }

    public Instant getSentAt() {
        return this.sentAt;
    }

    public ChatMessage sentAt(Instant sentAt) {
        this.setSentAt(sentAt);
        return this;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Boolean getErrorOccurred() {
        return this.errorOccurred;
    }

    public ChatMessage errorOccurred(Boolean errorOccurred) {
        this.setErrorOccurred(errorOccurred);
        return this;
    }

    public void setErrorOccurred(Boolean errorOccurred) {
        this.errorOccurred = errorOccurred;
    }

    public ChatSession getSession() {
        return this.session;
    }

    public void setSession(ChatSession chatSession) {
        this.session = chatSession;
    }

    public ChatMessage session(ChatSession chatSession) {
        this.setSession(chatSession);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChatMessage)) {
            return false;
        }
        return getId() != null && getId().equals(((ChatMessage) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChatMessage{" +
            "id=" + getId() +
            ", role='" + getRole() + "'" +
            ", content='" + getContent() + "'" +
            ", intent='" + getIntent() + "'" +
            ", actionTaken='" + getActionTaken() + "'" +
            ", tokenUsed=" + getTokenUsed() +
            ", sentAt='" + getSentAt() + "'" +
            ", errorOccurred='" + getErrorOccurred() + "'" +
            "}";
    }
}
