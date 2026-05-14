package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.TimeEntrySource;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;

public class TimeEntryDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate entryDate;

    private Instant checkIn;
    private Instant checkOut;
    private BigDecimal workedHours;
    private BigDecimal overtimeHours;
    private Integer lateMinutes;

    @NotNull
    private TimeEntrySource source;

    @NotNull
    private TimeEntryStatus status;

    private String anomalyNote;

    // ✅ validatedBy = String (login) — plus UserProfileDTO
    private String validatedBy;

    private Instant validatedAt;
    private String notes;

    // ✅ Relation ID (style JHipster)
    private Long employeeId;

    // ── Getters / Setters ──────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public Instant getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(Instant checkIn) {
        this.checkIn = checkIn;
    }

    public Instant getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(Instant checkOut) {
        this.checkOut = checkOut;
    }

    public BigDecimal getWorkedHours() {
        return workedHours;
    }

    public void setWorkedHours(BigDecimal workedHours) {
        this.workedHours = workedHours;
    }

    public BigDecimal getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public Integer getLateMinutes() {
        return lateMinutes;
    }

    public void setLateMinutes(Integer lateMinutes) {
        this.lateMinutes = lateMinutes;
    }

    public TimeEntrySource getSource() {
        return source;
    }

    public void setSource(TimeEntrySource source) {
        this.source = source;
    }

    public TimeEntryStatus getStatus() {
        return status;
    }

    public void setStatus(TimeEntryStatus status) {
        this.status = status;
    }

    public String getAnomalyNote() {
        return anomalyNote;
    }

    public void setAnomalyNote(String anomalyNote) {
        this.anomalyNote = anomalyNote;
    }

    public String getValidatedBy() {
        return validatedBy;
    }

    public void setValidatedBy(String validatedBy) {
        this.validatedBy = validatedBy;
    }

    public Instant getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(Instant validatedAt) {
        this.validatedAt = validatedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
        if (!(o instanceof TimeEntryDTO)) return false;
        return id != null && id.equals(((TimeEntryDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "TimeEntryDTO{id=" + id + ", entryDate=" + entryDate + ", status=" + status + "}";
    }
}
