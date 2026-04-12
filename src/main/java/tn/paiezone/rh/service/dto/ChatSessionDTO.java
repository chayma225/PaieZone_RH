package tn.paiezone.rh.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.ChatChannel;
import tn.paiezone.rh.domain.enumeration.ChatSessionStatus;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.ChatSession} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChatSessionDTO implements Serializable {

    private Long id;

    @NotNull
    private ChatChannel channel;

    @NotNull
    private ChatSessionStatus status;

    @NotNull
    private Instant startedAt;

    private Instant endedAt;

    private Instant escalatedAt;

    @Size(max = 100)
    private String escalatedTo;

    @Lob
    private String contextData;

    @Min(value = 1)
    @Max(value = 5)
    private Integer satisfactionScore;

    @NotNull
    private EmployeeDTO employee;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChatSessionDTO)) {
            return false;
        }

        ChatSessionDTO chatSessionDTO = (ChatSessionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, chatSessionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChatSessionDTO{" +
            "id=" + getId() +
            ", channel='" + getChannel() + "'" +
            ", status='" + getStatus() + "'" +
            ", startedAt='" + getStartedAt() + "'" +
            ", endedAt='" + getEndedAt() + "'" +
            ", escalatedAt='" + getEscalatedAt() + "'" +
            ", escalatedTo='" + getEscalatedTo() + "'" +
            ", contextData='" + getContextData() + "'" +
            ", satisfactionScore=" + getSatisfactionScore() +
            ", employee=" + getEmployee() +
            "}";
    }
}
