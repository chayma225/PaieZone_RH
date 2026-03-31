package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.ChatChannel;
import tn.paiezone.rh.domain.enumeration.ChatSessionStatus;

/**
 * A ChatSession.
 */
@Entity
@Table(name = "chat_session")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatSession implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false)
    private ChatChannel channel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ChatSessionStatus status;

    @NotNull
    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "escalated_at")
    private Instant escalatedAt;

    @Size(max = 100)
    @Column(name = "escalated_to", length = 100)
    private String escalatedTo;

    @Lob
    @Column(name = "context_data")
    private String contextData;

    @Min(value = 1)
    @Max(value = 5)
    @Column(name = "satisfaction_score")
    private Integer satisfactionScore;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ChatSession id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ChatChannel getChannel() {
        return this.channel;
    }

    public ChatSession channel(ChatChannel channel) {
        this.setChannel(channel);
        return this;
    }

    public void setChannel(ChatChannel channel) {
        this.channel = channel;
    }

    public ChatSessionStatus getStatus() {
        return this.status;
    }

    public ChatSession status(ChatSessionStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(ChatSessionStatus status) {
        this.status = status;
    }

    public Instant getStartedAt() {
        return this.startedAt;
    }

    public ChatSession startedAt(Instant startedAt) {
        this.setStartedAt(startedAt);
        return this;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return this.endedAt;
    }

    public ChatSession endedAt(Instant endedAt) {
        this.setEndedAt(endedAt);
        return this;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public Instant getEscalatedAt() {
        return this.escalatedAt;
    }

    public ChatSession escalatedAt(Instant escalatedAt) {
        this.setEscalatedAt(escalatedAt);
        return this;
    }

    public void setEscalatedAt(Instant escalatedAt) {
        this.escalatedAt = escalatedAt;
    }

    public String getEscalatedTo() {
        return this.escalatedTo;
    }

    public ChatSession escalatedTo(String escalatedTo) {
        this.setEscalatedTo(escalatedTo);
        return this;
    }

    public void setEscalatedTo(String escalatedTo) {
        this.escalatedTo = escalatedTo;
    }

    public String getContextData() {
        return this.contextData;
    }

    public ChatSession contextData(String contextData) {
        this.setContextData(contextData);
        return this;
    }

    public void setContextData(String contextData) {
        this.contextData = contextData;
    }

    public Integer getSatisfactionScore() {
        return this.satisfactionScore;
    }

    public ChatSession satisfactionScore(Integer satisfactionScore) {
        this.setSatisfactionScore(satisfactionScore);
        return this;
    }

    public void setSatisfactionScore(Integer satisfactionScore) {
        this.satisfactionScore = satisfactionScore;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public ChatSession employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChatSession)) {
            return false;
        }
        return getId() != null && getId().equals(((ChatSession) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChatSession{" +
            "id=" + getId() +
            ", channel='" + getChannel() + "'" +
            ", status='" + getStatus() + "'" +
            ", startedAt='" + getStartedAt() + "'" +
            ", endedAt='" + getEndedAt() + "'" +
            ", escalatedAt='" + getEscalatedAt() + "'" +
            ", escalatedTo='" + getEscalatedTo() + "'" +
            ", contextData='" + getContextData() + "'" +
            ", satisfactionScore=" + getSatisfactionScore() +
            "}";
    }
}
