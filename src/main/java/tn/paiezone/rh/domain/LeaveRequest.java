package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;

/**
 * Demande de congé
 */
@Entity
@Table(name = "leave_request")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @Min(value = 1)
    @Column(name = "number_of_days", nullable = false)
    private Integer numberOfDays;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LeaveStatus status;

    @NotNull
    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Size(max = 500)
    @Column(name = "manager_comment", length = 500)
    private String managerComment;

    @Size(max = 500)
    @Column(name = "employee_comment", length = 500)
    private String employeeComment;

    @Size(max = 500)
    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private LeaveType leaveType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile approvedBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LeaveRequest id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }

    public LeaveRequest startDate(LocalDate startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return this.endDate;
    }

    public LeaveRequest endDate(LocalDate endDate) {
        this.setEndDate(endDate);
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getNumberOfDays() {
        return this.numberOfDays;
    }

    public LeaveRequest numberOfDays(Integer numberOfDays) {
        this.setNumberOfDays(numberOfDays);
        return this;
    }

    public void setNumberOfDays(Integer numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public LeaveStatus getStatus() {
        return this.status;
    }

    public LeaveRequest status(LeaveStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(LeaveStatus status) {
        this.status = status;
    }

    public Instant getRequestedAt() {
        return this.requestedAt;
    }

    public LeaveRequest requestedAt(Instant requestedAt) {
        this.setRequestedAt(requestedAt);
        return this;
    }

    public void setRequestedAt(Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public Instant getProcessedAt() {
        return this.processedAt;
    }

    public LeaveRequest processedAt(Instant processedAt) {
        this.setProcessedAt(processedAt);
        return this;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public String getManagerComment() {
        return this.managerComment;
    }

    public LeaveRequest managerComment(String managerComment) {
        this.setManagerComment(managerComment);
        return this;
    }

    public void setManagerComment(String managerComment) {
        this.managerComment = managerComment;
    }

    public String getEmployeeComment() {
        return this.employeeComment;
    }

    public LeaveRequest employeeComment(String employeeComment) {
        this.setEmployeeComment(employeeComment);
        return this;
    }

    public void setEmployeeComment(String employeeComment) {
        this.employeeComment = employeeComment;
    }

    public String getDocumentUrl() {
        return this.documentUrl;
    }

    public LeaveRequest documentUrl(String documentUrl) {
        this.setDocumentUrl(documentUrl);
        return this;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LeaveRequest employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public LeaveType getLeaveType() {
        return this.leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }

    public LeaveRequest leaveType(LeaveType leaveType) {
        this.setLeaveType(leaveType);
        return this;
    }

    public UserProfile getApprovedBy() {
        return this.approvedBy;
    }

    public void setApprovedBy(UserProfile userProfile) {
        this.approvedBy = userProfile;
    }

    public LeaveRequest approvedBy(UserProfile userProfile) {
        this.setApprovedBy(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LeaveRequest)) {
            return false;
        }
        return getId() != null && getId().equals(((LeaveRequest) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveRequest{" +
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
            "}";
    }
}
