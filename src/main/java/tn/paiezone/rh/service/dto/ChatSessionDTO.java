package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;
import tn.paiezone.rh.domain.enumeration.ChatChannel;
import tn.paiezone.rh.domain.enumeration.ChatSessionStatus;

public class ChatSessionDTO {

    private Long id;

    // ── Champs chatbot métier ──────────────────────────────────────────────────
    private String sessionTitle;
    private String userLogin;
    private Instant createdAt;
    private Instant lastActivity;
    private boolean active;
    private List<ChatMessageDTO> messages;
    private int messageCount;

    // ── Champs JDL complets (requis par le CRUD REST et les tests IT) ─────────
    @NotNull
    private ChatChannel channel;

    @NotNull
    private ChatSessionStatus status;

    private Instant startedAt;

    private Instant endedAt;
    private Instant escalatedAt;
    private String escalatedTo;
    private String contextData;
    private Integer satisfactionScore;
    private Long employeeId;

    // ── Getters / Setters ──────────────────────────────────────────────────────

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

    public ChatChannel getChannel() {
        return channel;
    }

    public void setChannel(ChatChannel channel) {
        this.channel = channel;
    }

    public ChatSessionStatus getStatus() {
        return status;
    }

    public void setStatus(ChatSessionStatus status) {
        this.status = status;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public Instant getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(Instant escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public String getEscalatedTo() {
        return escalatedTo;
    }

    public void setEscalatedTo(String escalatedTo) {
        this.escalatedTo = escalatedTo;
    }

    public String getContextData() {
        return contextData;
    }

    public void setContextData(String contextData) {
        this.contextData = contextData;
    }

    public Integer getSatisfactionScore() {
        return satisfactionScore;
    }

    public void setSatisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatSessionDTO)) return false;
        ChatSessionDTO dto = (ChatSessionDTO) o;
        return id != null && id.equals(dto.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
