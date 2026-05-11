package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tn.paiezone.rh.domain.enumeration.TimeEntrySource;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "time_entry")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TimeEntry implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    // Ajout du logger pour éviter l'erreur "cannot find symbol: variable log"
    private static final Logger log = LoggerFactory.getLogger(TimeEntry.class);

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

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    @Column(name = "created_date", nullable = false, updatable = false)
    private Instant createdDate;

    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private Instant lastModifiedDate;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    // --- GETTERS & SETTERS ---

    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public TimeEntry id(Long id) { this.id = id; return this; }

    public LocalDate getEntryDate() { return this.entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public TimeEntry entryDate(LocalDate entryDate) { this.entryDate = entryDate; return this; }

    public Instant getCheckIn() { return this.checkIn; }
    public void setCheckIn(Instant checkIn) { this.checkIn = checkIn; }
    public TimeEntry checkIn(Instant checkIn) { this.checkIn = checkIn; return this; }

    public Instant getCheckOut() { return this.checkOut; }
    public void setCheckOut(Instant checkOut) { this.checkOut = checkOut; }
    public TimeEntry checkOut(Instant checkOut) { this.checkOut = checkOut; return this; }

    public BigDecimal getWorkedHours() { return this.workedHours; }
    public void setWorkedHours(BigDecimal workedHours) { this.workedHours = workedHours; }
    public TimeEntry workedHours(BigDecimal workedHours) { this.workedHours = workedHours; return this; }

    public BigDecimal getOvertimeHours() { return this.overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }
    public TimeEntry overtimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; return this; }

    public Integer getLateMinutes() { return this.lateMinutes; }
    public void setLateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; }
    public TimeEntry lateMinutes(Integer lateMinutes) { this.lateMinutes = lateMinutes; return this; }

    public TimeEntrySource getSource() { return this.source; }
    public void setSource(TimeEntrySource source) { this.source = source; }
    public TimeEntry source(TimeEntrySource source) { this.source = source; return this; }

    public TimeEntryStatus getStatus() { return this.status; }
    public void setStatus(TimeEntryStatus status) { this.status = status; }
    public TimeEntry status(TimeEntryStatus status) { this.status = status; return this; }

    public String getAnomalyNote() { return this.anomalyNote; }
    public void setAnomalyNote(String anomalyNote) { this.anomalyNote = anomalyNote; }
    public TimeEntry anomalyNote(String anomalyNote) { this.anomalyNote = anomalyNote; return this; }

    public String getValidatedBy() { return this.validatedBy; }
    public void setValidatedBy(String validatedBy) { this.validatedBy = validatedBy; }
    public TimeEntry validatedBy(String validatedBy) { this.validatedBy = validatedBy; return this; }

    public Instant getValidatedAt() { return this.validatedAt; }
    public void setValidatedAt(Instant validatedAt) { this.validatedAt = validatedAt; }
    public TimeEntry validatedAt(Instant validatedAt) { this.validatedAt = validatedAt; return this; }

    public String getNotes() { return this.notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public TimeEntry notes(String notes) { this.notes = notes; return this; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedDate() { return createdDate; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public Employee getEmployee() { return this.employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public TimeEntry employee(Employee employee) { this.employee = employee; return this; }

    // --- COMPATIBILITÉ (DEPRECATED) ---

    @Deprecated
    public void setValidatedByUser(Object userProfile) {
        if (userProfile != null) {
            log.warn("setValidatedByUser ignoré - le champ est désormais une String (validated_by)");
        }
    }

    @Deprecated
    public TimeEntry validatedByUser(Object userProfile) {
        return this;
    }

    // --- STANDARDS ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TimeEntry)) return false;
        return getId() != null && getId().equals(((TimeEntry) o).getId());
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "TimeEntry{" +
            "id=" + getId() +
            ", entryDate='" + getEntryDate() + "'" +
            ", status='" + getStatus() + "'" +
            ", validatedBy='" + getValidatedBy() + "'" +
            "}";
    }

    @Deprecated
    public Object getValidatedByUser() { return null; }
}
