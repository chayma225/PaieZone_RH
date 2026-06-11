package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.LeaveRequest} entity.
 */
@Schema(description = "Demande de congé")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveRequestDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @Min(value = 1)
    private Integer numberOfDays;

    @NotNull
    private LeaveStatus status;

    private Instant requestedAt;

    private Instant processedAt;

    @Size(max = 500)
    private String managerComment;

    @Size(max = 500)
    private String employeeComment;

    @Size(max = 500)
    private String documentUrl;

    @NotNull
    private EmployeeDTO employee;

    @NotNull
    private LeaveTypeDTO leaveType;

    private UserProfileDTO approvedBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Integer numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public LeaveStatus getStatus() {
        return status;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public String getManagerComment() {
        return managerComment;
    }

    public void setManagerComment(String managerComment) {
        this.managerComment = managerComment;
    }

    public String getEmployeeComment() {
        return employeeComment;
    }

    public void setEmployeeComment(String employeeComment) {
        this.employeeComment = employeeComment;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public LeaveTypeDTO getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveTypeDTO leaveType) {
        this.leaveType = leaveType;
    }

    public UserProfileDTO getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(UserProfileDTO approvedBy) {
        this.approvedBy = approvedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LeaveRequestDTO)) {
            return false;
        }

        LeaveRequestDTO leaveRequestDTO = (LeaveRequestDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, leaveRequestDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveRequestDTO{" +
            "id=" + getId() +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", numberOfDays=" + getNumberOfDays() +
            ", status='" + getStatus() + "'" +
            ", requestedAt='" + getRequestedAt() + "'" +
            ", processedAt='" + getProcessedAt() + "'" +
            ", managerComment='" + getManagerComment() + "'" +
            ", employeeComment='" + getEmployeeComment() + "'" +
            ", documentUrl='" + getDocumentUrl() + "'" +
            ", employee=" + getEmployee() +
            ", leaveType=" + getLeaveType() +
            ", approvedBy=" + getApprovedBy() +
            "}";
    }
}
