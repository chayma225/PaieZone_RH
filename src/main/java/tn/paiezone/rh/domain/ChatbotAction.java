package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.ActionStatus;
import tn.paiezone.rh.domain.enumeration.ChatbotActionType;

/**
 * Action métier déclenchée par le chatbot (demande congé, consultation bulletin)
 */
@Entity
@Table(name = "chatbot_action")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatbotAction implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ChatbotActionType actionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_status", nullable = false)
    private ActionStatus actionStatus;

    @Column(name = "requested_at")
    private Instant requestedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @Column(name = "result_payload", columnDefinition = "TEXT")
    private String resultPayload;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_message_id")
    @JsonIgnoreProperties(value = { "session" }, allowSetters = true)
    private ChatMessage chatMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_request_id")
    @JsonIgnoreProperties(value = { "employee", "leaveType", "approvedBy" }, allowSetters = true)
    private LeaveRequest leaveRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pay_slip_id")
    @JsonIgnoreProperties(value = { "employee", "payrollPeriod", "contract" }, allowSetters = true)
    private PaySlip paySlip;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatbotAction id(Long id) {
        this.id = id;
        return this;
    }

    public ChatbotActionType getActionType() {
        return actionType;
    }

    public void setActionType(ChatbotActionType actionType) {
        this.actionType = actionType;
    }

    public ChatbotAction actionType(ChatbotActionType actionType) {
        this.actionType = actionType;
        return this;
    }

    public ActionStatus getActionStatus() {
        return actionStatus;
    }

    public void setActionStatus(ActionStatus actionStatus) {
        this.actionStatus = actionStatus;
    }

    public ChatbotAction actionStatus(ActionStatus actionStatus) {
        this.actionStatus = actionStatus;
        return this;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getResultPayload() {
        return resultPayload;
    }

    public void setResultPayload(String resultPayload) {
        this.resultPayload = resultPayload;
    }

    public ChatMessage getChatMessage() {
        return chatMessage;
    }

    public void setChatMessage(ChatMessage chatMessage) {
        this.chatMessage = chatMessage;
    }

    public ChatbotAction chatMessage(ChatMessage chatMessage) {
        this.chatMessage = chatMessage;
        return this;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public ChatbotAction employee(Employee employee) {
        this.employee = employee;
        return this;
    }

    public LeaveRequest getLeaveRequest() {
        return leaveRequest;
    }

    public void setLeaveRequest(LeaveRequest leaveRequest) {
        this.leaveRequest = leaveRequest;
    }

    public ChatbotAction leaveRequest(LeaveRequest leaveRequest) {
        this.leaveRequest = leaveRequest;
        return this;
    }

    public PaySlip getPaySlip() {
        return paySlip;
    }

    public void setPaySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
    }

    public ChatbotAction paySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatbotAction)) return false;
        return id != null && id.equals(((ChatbotAction) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "ChatbotAction{id=" + id + ", actionType=" + actionType + ", actionStatus=" + actionStatus + "}";
    }
}
