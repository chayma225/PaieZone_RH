package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.TimeEntrySource;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;

/**
 * A TimeEntry.
 */
@Entity
@Table(name = "time_entry")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TimeEntry implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "check_in")
    private Instant checkIn;

    @Column(name = "check_out")
    private Instant checkOut;

    @Column(name = "worked_hours", precision = 21, scale = 2)
    private BigDecimal workedHours;

    @Column(name = "overtime_hours", precision = 21, scale = 2)
    private BigDecimal overtimeHours;

    @Column(name = "late_minutes")
    private Integer lateMinutes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private TimeEntrySource source;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TimeEntryStatus status;

    @Size(max = 500)
    @Column(name = "anomaly_note", length = 500)
    private String anomalyNote;

    @Size(max = 100)
    @Column(name = "validated_by", length = 100)
    private String validatedBy;

    @Column(name = "validated_at")
    private Instant validatedAt;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile validatedByUser;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TimeEntry id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEntryDate() {
        return this.entryDate;
    }

    public TimeEntry entryDate(LocalDate entryDate) {
        this.setEntryDate(entryDate);
        return this;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public Instant getCheckIn() {
        return this.checkIn;
    }

    public TimeEntry checkIn(Instant checkIn) {
        this.setCheckIn(checkIn);
        return this;
    }

    public void setCheckIn(Instant checkIn) {
        this.checkIn = checkIn;
    }

    public Instant getCheckOut() {
        return this.checkOut;
    }

    public TimeEntry checkOut(Instant checkOut) {
        this.setCheckOut(checkOut);
        return this;
    }

    public void setCheckOut(Instant checkOut) {
        this.checkOut = checkOut;
    }

    public BigDecimal getWorkedHours() {
        return this.workedHours;
    }

    public TimeEntry workedHours(BigDecimal workedHours) {
        this.setWorkedHours(workedHours);
        return this;
    }

    public void setWorkedHours(BigDecimal workedHours) {
        this.workedHours = workedHours;
    }

    public BigDecimal getOvertimeHours() {
        return this.overtimeHours;
    }

    public TimeEntry overtimeHours(BigDecimal overtimeHours) {
        this.setOvertimeHours(overtimeHours);
        return this;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public Integer getLateMinutes() {
        return this.lateMinutes;
    }

    public TimeEntry lateMinutes(Integer lateMinutes) {
        this.setLateMinutes(lateMinutes);
        return this;
    }

    public void setLateMinutes(Integer lateMinutes) {
        this.lateMinutes = lateMinutes;
    }

    public TimeEntrySource getSource() {
        return this.source;
    }

    public TimeEntry source(TimeEntrySource source) {
        this.setSource(source);
        return this;
    }

    public void setSource(TimeEntrySource source) {
        this.source = source;
    }

    public TimeEntryStatus getStatus() {
        return this.status;
    }

    public TimeEntry status(TimeEntryStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(TimeEntryStatus status) {
        this.status = status;
    }

    public String getAnomalyNote() {
        return this.anomalyNote;
    }

    public TimeEntry anomalyNote(String anomalyNote) {
        this.setAnomalyNote(anomalyNote);
        return this;
    }

    public void setAnomalyNote(String anomalyNote) {
        this.anomalyNote = anomalyNote;
    }

    public String getValidatedBy() {
        return this.validatedBy;
    }

    public TimeEntry validatedBy(String validatedBy) {
        this.setValidatedBy(validatedBy);
        return this;
    }

    public void setValidatedBy(String validatedBy) {
        this.validatedBy = validatedBy;
    }

    public Instant getValidatedAt() {
        return this.validatedAt;
    }

    public TimeEntry validatedAt(Instant validatedAt) {
        this.setValidatedAt(validatedAt);
        return this;
    }

    public void setValidatedAt(Instant validatedAt) {
        this.validatedAt = validatedAt;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public TimeEntry employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public UserProfile getValidatedByUser() {
        return this.validatedByUser;
    }

    public void setValidatedByUser(UserProfile userProfile) {
        this.validatedByUser = userProfile;
    }

    public TimeEntry validatedByUser(UserProfile userProfile) {
        this.setValidatedByUser(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TimeEntry)) {
            return false;
        }
        return getId() != null && getId().equals(((TimeEntry) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TimeEntry{" +
            "id=" + getId() +
            ", entryDate='" + getEntryDate() + "'" +
            ", checkIn='" + getCheckIn() + "'" +
            ", checkOut='" + getCheckOut() + "'" +
            ", workedHours=" + getWorkedHours() +
            ", overtimeHours=" + getOvertimeHours() +
            ", lateMinutes=" + getLateMinutes() +
            ", source='" + getSource() + "'" +
            ", status='" + getStatus() + "'" +
            ", anomalyNote='" + getAnomalyNote() + "'" +
            ", validatedBy='" + getValidatedBy() + "'" +
            ", validatedAt='" + getValidatedAt() + "'" +
            "}";
    }
}
