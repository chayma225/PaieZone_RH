package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import tn.paiezone.rh.domain.enumeration.ChatChannel;
import tn.paiezone.rh.domain.enumeration.ChatSessionStatus;

@Entity
@Table(name = "chat_session")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatSession implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "chatSessionSequenceGenerator")
    @SequenceGenerator(name = "chatSessionSequenceGenerator", sequenceName = "chat_session_sequence", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    // ── Champs chatbot métier (utilisés par ChatbotService) ─────────────────

    @Column(name = "session_title")
    private String sessionTitle;

    @Column(name = "user_login", nullable = false, length = 50)
    private String userLogin;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "last_activity")
    private Instant lastActivity;

    @Column(name = "active")
    private boolean active;

    // ── Champs JDL complets (requis par les tests générés) ──────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private ChatChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ChatSessionStatus status;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "escalated_at")
    private Instant escalatedAt;

    @Column(name = "escalated_to", length = 100)
    private String escalatedTo;

    @Column(name = "context_data", columnDefinition = "TEXT")
    private String contextData;

    @Column(name = "satisfaction_score")
    private Integer satisfactionScore;

    // ── Relations ────────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties(value = { "subscriptions", "users" }, allowSetters = true)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @OrderBy("sentAt ASC")
    @JsonIgnoreProperties(value = { "session" }, allowSetters = true)
    private List<ChatMessage> messages = new ArrayList<>();

    // ── Getters / Setters / Fluent methods ──────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatSession id(Long id) {
        this.id = id;
        return this;
    }

    public String getSessionTitle() {
        return sessionTitle;
    }

    public void setSessionTitle(String sessionTitle) {
        this.sessionTitle = sessionTitle;
    }

    public ChatSession sessionTitle(String sessionTitle) {
        this.sessionTitle = sessionTitle;
        return this;
    }

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    public ChatSession userLogin(String userLogin) {
        this.userLogin = userLogin;
        return this;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public ChatSession createdAt(Instant createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public Instant getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
    }

    public ChatSession lastActivity(Instant lastActivity) {
        this.lastActivity = lastActivity;
        return this;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public ChatSession active(boolean active) {
        this.active = active;
        return this;
    }

    public ChatChannel getChannel() {
        return channel;
    }

    public void setChannel(ChatChannel channel) {
        this.channel = channel;
    }

    public ChatSession channel(ChatChannel channel) {
        this.channel = channel;
        return this;
    }

    public ChatSessionStatus getStatus() {
        return status;
    }

    public void setStatus(ChatSessionStatus status) {
        this.status = status;
    }

    public ChatSession status(ChatSessionStatus status) {
        this.status = status;
        return this;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public ChatSession startedAt(Instant startedAt) {
        this.startedAt = startedAt;
        return this;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public ChatSession endedAt(Instant endedAt) {
        this.endedAt = endedAt;
        return this;
    }

    public Instant getEscalatedAt() {
        return escalatedAt;
    }

    public void setEscalatedAt(Instant escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public ChatSession escalatedAt(Instant escalatedAt) {
        this.escalatedAt = escalatedAt;
        return this;
    }

    public String getEscalatedTo() {
        return escalatedTo;
    }

    public void setEscalatedTo(String escalatedTo) {
        this.escalatedTo = escalatedTo;
    }

    public ChatSession escalatedTo(String escalatedTo) {
        this.escalatedTo = escalatedTo;
        return this;
    }

    public String getContextData() {
        return contextData;
    }

    public void setContextData(String contextData) {
        this.contextData = contextData;
    }

    public ChatSession contextData(String contextData) {
        this.contextData = contextData;
        return this;
    }

    public Integer getSatisfactionScore() {
        return satisfactionScore;
    }

    public void setSatisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }

    public ChatSession satisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
        return this;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public ChatSession company(Company company) {
        this.company = company;
        return this;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public ChatSession employee(Employee employee) {
        this.employee = employee;
        return this;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }

    public ChatSession messages(List<ChatMessage> messages) {
        this.messages = messages;
        return this;
    }

    // ── equals / hashCode / toString ─────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatSession)) return false;
        return id != null && id.equals(((ChatSession) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ChatSession{id=" + id + ", userLogin='" + userLogin + "', active=" + active + ", status=" + status + "}";
    }
}
