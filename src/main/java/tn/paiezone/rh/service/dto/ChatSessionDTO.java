package tn.paiezone.rh.service.dto;

import java.time.Instant;
import java.util.List;

public class ChatSessionDTO {

    private Long id;
    private String sessionTitle;
    private String userLogin;
    private Instant createdAt;
    private Instant lastActivity;
    private boolean active;
    private List<ChatMessageDTO> messages;
    private int messageCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionTitle() {
        return sessionTitle;
    }

    public void setSessionTitle(String sessionTitle) {
        this.sessionTitle = sessionTitle;
    }

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<ChatMessageDTO> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessageDTO> messages) {
        this.messages = messages;
    }

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }
}
