package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class ChatMessageDTO {

    private Long id;

    @NotNull
    private String role;

    @NotNull
    private String content;

    @NotNull
    private Instant sentAt;

    private String intent;
    private boolean escalatedToHuman;

    // ── Champs JDL complets ───────────────────────────────────────────────────
    private String actionTaken;
    private Integer tokenUsed;
    private Boolean errorOccurred;

    private Long sessionId;

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
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

    public String getIntent() {
        return intent;
    }

    public void setIntent(String intent) {
        this.intent = intent;
    }

    public boolean isEscalatedToHuman() {
        return escalatedToHuman;
    }

    public void setEscalatedToHuman(boolean escalatedToHuman) {
        this.escalatedToHuman = escalatedToHuman;
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

    public Boolean getErrorOccurred() {
        return errorOccurred;
    }

    public void setErrorOccurred(Boolean errorOccurred) {
        this.errorOccurred = errorOccurred;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatMessageDTO)) return false;
        ChatMessageDTO dto = (ChatMessageDTO) o;
        return id != null && id.equals(dto.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
