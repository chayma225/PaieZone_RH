package tn.paiezone.rh.service.dto;

import java.time.Instant;

public class ChatMessageDTO {

    private Long id;
    private Long sessionId;
    private String role; // "user" | "assistant"
    private String content;
    private Instant sentAt;
    private boolean escalatedToHuman;
    private String intent;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
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
