package tn.paiezone.rh.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.MessageIntent;
import tn.paiezone.rh.domain.enumeration.MessageRole;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.ChatMessage} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatMessageDTO implements Serializable {

    private Long id;

    @NotNull
    private MessageRole role;

    @Lob
    private String content;

    private MessageIntent intent;

    @Size(max = 200)
    private String actionTaken;

    private Integer tokenUsed;

    @NotNull
    private Instant sentAt;

    private Boolean errorOccurred;

    @NotNull
    private ChatSessionDTO session;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public MessageIntent getIntent() {
        return intent;
    }

    public void setIntent(MessageIntent intent) {
        this.intent = intent;
    }

    public String getActionTaken() {
        return actionTaken;
    }

    public void setActionTaken(String actionTaken) {
        this.actionTaken = actionTaken;
    }

    public Integer getTokenUsed() {
        return tokenUsed;
    }

    public void setTokenUsed(Integer tokenUsed) {
        this.tokenUsed = tokenUsed;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public Boolean getErrorOccurred() {
        return errorOccurred;
    }

    public void setErrorOccurred(Boolean errorOccurred) {
        this.errorOccurred = errorOccurred;
    }

    public ChatSessionDTO getSession() {
        return session;
    }

    public void setSession(ChatSessionDTO session) {
        this.session = session;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChatMessageDTO)) {
            return false;
        }

        ChatMessageDTO chatMessageDTO = (ChatMessageDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, chatMessageDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChatMessageDTO{" +
            "id=" + getId() +
            ", role='" + getRole() + "'" +
            ", content='" + getContent() + "'" +
            ", intent='" + getIntent() + "'" +
            ", actionTaken='" + getActionTaken() + "'" +
            ", tokenUsed=" + getTokenUsed() +
            ", sentAt='" + getSentAt() + "'" +
            ", errorOccurred='" + getErrorOccurred() + "'" +
            ", session=" + getSession() +
            "}";
    }
}
