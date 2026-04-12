package tn.paiezone.rh.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.TimeEntrySource;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.TimeEntry} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.TimeEntryResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /time-entries?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TimeEntryCriteria implements Serializable, Criteria {

    /**
     * Class for filtering TimeEntrySource
     */
    public static class TimeEntrySourceFilter extends Filter<TimeEntrySource> {

        public TimeEntrySourceFilter() {}

        public TimeEntrySourceFilter(TimeEntrySourceFilter filter) {
            super(filter);
        }

        @Override
        public TimeEntrySourceFilter copy() {
            return new TimeEntrySourceFilter(this);
        }
    }

    /**
     * Class for filtering TimeEntryStatus
     */
    public static class TimeEntryStatusFilter extends Filter<TimeEntryStatus> {

        public TimeEntryStatusFilter() {}

        public TimeEntryStatusFilter(TimeEntryStatusFilter filter) {
            super(filter);
        }

        @Override
        public TimeEntryStatusFilter copy() {
            return new TimeEntryStatusFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter entryDate;

    private InstantFilter checkIn;

    private InstantFilter checkOut;

    private BigDecimalFilter workedHours;

    private BigDecimalFilter overtimeHours;

    private IntegerFilter lateMinutes;

    private TimeEntrySourceFilter source;

    private TimeEntryStatusFilter status;

    private StringFilter anomalyNote;

    private StringFilter validatedBy;

    private InstantFilter validatedAt;

    private LongFilter employeeId;

    private LongFilter validatedByUserId;

    private Boolean distinct;

    public TimeEntryCriteria() {}

    public TimeEntryCriteria(TimeEntryCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.entryDate = other.optionalEntryDate().map(LocalDateFilter::copy).orElse(null);
        this.checkIn = other.optionalCheckIn().map(InstantFilter::copy).orElse(null);
        this.checkOut = other.optionalCheckOut().map(InstantFilter::copy).orElse(null);
        this.workedHours = other.optionalWorkedHours().map(BigDecimalFilter::copy).orElse(null);
        this.overtimeHours = other.optionalOvertimeHours().map(BigDecimalFilter::copy).orElse(null);
        this.lateMinutes = other.optionalLateMinutes().map(IntegerFilter::copy).orElse(null);
        this.source = other.optionalSource().map(TimeEntrySourceFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(TimeEntryStatusFilter::copy).orElse(null);
        this.anomalyNote = other.optionalAnomalyNote().map(StringFilter::copy).orElse(null);
        this.validatedBy = other.optionalValidatedBy().map(StringFilter::copy).orElse(null);
        this.validatedAt = other.optionalValidatedAt().map(InstantFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.validatedByUserId = other.optionalValidatedByUserId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public TimeEntryCriteria copy() {
        return new TimeEntryCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public LocalDateFilter getEntryDate() {
        return entryDate;
    }

    public Optional<LocalDateFilter> optionalEntryDate() {
        return Optional.ofNullable(entryDate);
    }

    public LocalDateFilter entryDate() {
        if (entryDate == null) {
            setEntryDate(new LocalDateFilter());
        }
        return entryDate;
    }

    public void setEntryDate(LocalDateFilter entryDate) {
        this.entryDate = entryDate;
    }

    public InstantFilter getCheckIn() {
        return checkIn;
    }

    public Optional<InstantFilter> optionalCheckIn() {
        return Optional.ofNullable(checkIn);
    }

    public InstantFilter checkIn() {
        if (checkIn == null) {
            setCheckIn(new InstantFilter());
        }
        return checkIn;
    }

    public void setCheckIn(InstantFilter checkIn) {
        this.checkIn = checkIn;
    }

    public InstantFilter getCheckOut() {
        return checkOut;
    }

    public Optional<InstantFilter> optionalCheckOut() {
        return Optional.ofNullable(checkOut);
    }

    public InstantFilter checkOut() {
        if (checkOut == null) {
            setCheckOut(new InstantFilter());
        }
        return checkOut;
    }

    public void setCheckOut(InstantFilter checkOut) {
        this.checkOut = checkOut;
    }

    public BigDecimalFilter getWorkedHours() {
        return workedHours;
    }

    public Optional<BigDecimalFilter> optionalWorkedHours() {
        return Optional.ofNullable(workedHours);
    }

    public BigDecimalFilter workedHours() {
        if (workedHours == null) {
            setWorkedHours(new BigDecimalFilter());
        }
        return workedHours;
    }

    public void setWorkedHours(BigDecimalFilter workedHours) {
        this.workedHours = workedHours;
    }

    public BigDecimalFilter getOvertimeHours() {
        return overtimeHours;
    }

    public Optional<BigDecimalFilter> optionalOvertimeHours() {
        return Optional.ofNullable(overtimeHours);
    }

    public BigDecimalFilter overtimeHours() {
        if (overtimeHours == null) {
            setOvertimeHours(new BigDecimalFilter());
        }
        return overtimeHours;
    }

    public void setOvertimeHours(BigDecimalFilter overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public IntegerFilter getLateMinutes() {
        return lateMinutes;
    }

    public Optional<IntegerFilter> optionalLateMinutes() {
        return Optional.ofNullable(lateMinutes);
    }

    public IntegerFilter lateMinutes() {
        if (lateMinutes == null) {
            setLateMinutes(new IntegerFilter());
        }
        return lateMinutes;
    }

    public void setLateMinutes(IntegerFilter lateMinutes) {
        this.lateMinutes = lateMinutes;
    }

    public TimeEntrySourceFilter getSource() {
        return source;
    }

    public Optional<TimeEntrySourceFilter> optionalSource() {
        return Optional.ofNullable(source);
    }

    public TimeEntrySourceFilter source() {
        if (source == null) {
            setSource(new TimeEntrySourceFilter());
        }
        return source;
    }

    public void setSource(TimeEntrySourceFilter source) {
        this.source = source;
    }

    public TimeEntryStatusFilter getStatus() {
        return status;
    }

    public Optional<TimeEntryStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public TimeEntryStatusFilter status() {
        if (status == null) {
            setStatus(new TimeEntryStatusFilter());
        }
        return status;
    }

    public void setStatus(TimeEntryStatusFilter status) {
        this.status = status;
    }

    public StringFilter getAnomalyNote() {
        return anomalyNote;
    }

    public Optional<StringFilter> optionalAnomalyNote() {
        return Optional.ofNullable(anomalyNote);
    }

    public StringFilter anomalyNote() {
        if (anomalyNote == null) {
            setAnomalyNote(new StringFilter());
        }
        return anomalyNote;
    }

    public void setAnomalyNote(StringFilter anomalyNote) {
        this.anomalyNote = anomalyNote;
    }

    public StringFilter getValidatedBy() {
        return validatedBy;
    }

    public Optional<StringFilter> optionalValidatedBy() {
        return Optional.ofNullable(validatedBy);
    }

    public StringFilter validatedBy() {
        if (validatedBy == null) {
            setValidatedBy(new StringFilter());
        }
        return validatedBy;
    }

    public void setValidatedBy(StringFilter validatedBy) {
        this.validatedBy = validatedBy;
    }

    public InstantFilter getValidatedAt() {
        return validatedAt;
    }

    public Optional<InstantFilter> optionalValidatedAt() {
        return Optional.ofNullable(validatedAt);
    }

    public InstantFilter validatedAt() {
        if (validatedAt == null) {
            setValidatedAt(new InstantFilter());
        }
        return validatedAt;
    }

    public void setValidatedAt(InstantFilter validatedAt) {
        this.validatedAt = validatedAt;
    }

    public LongFilter getEmployeeId() {
        return employeeId;
    }

    public Optional<LongFilter> optionalEmployeeId() {
        return Optional.ofNullable(employeeId);
    }

    public LongFilter employeeId() {
        if (employeeId == null) {
            setEmployeeId(new LongFilter());
        }
        return employeeId;
    }

    public void setEmployeeId(LongFilter employeeId) {
        this.employeeId = employeeId;
    }

    public LongFilter getValidatedByUserId() {
        return validatedByUserId;
    }

    public Optional<LongFilter> optionalValidatedByUserId() {
        return Optional.ofNullable(validatedByUserId);
    }

    public LongFilter validatedByUserId() {
        if (validatedByUserId == null) {
            setValidatedByUserId(new LongFilter());
        }
        return validatedByUserId;
    }

    public void setValidatedByUserId(LongFilter validatedByUserId) {
        this.validatedByUserId = validatedByUserId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final TimeEntryCriteria that = (TimeEntryCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(entryDate, that.entryDate) &&
            Objects.equals(checkIn, that.checkIn) &&
            Objects.equals(checkOut, that.checkOut) &&
            Objects.equals(workedHours, that.workedHours) &&
            Objects.equals(overtimeHours, that.overtimeHours) &&
            Objects.equals(lateMinutes, that.lateMinutes) &&
            Objects.equals(source, that.source) &&
            Objects.equals(status, that.status) &&
            Objects.equals(anomalyNote, that.anomalyNote) &&
            Objects.equals(validatedBy, that.validatedBy) &&
            Objects.equals(validatedAt, that.validatedAt) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(validatedByUserId, that.validatedByUserId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            entryDate,
            checkIn,
            checkOut,
            workedHours,
            overtimeHours,
            lateMinutes,
            source,
            status,
            anomalyNote,
            validatedBy,
            validatedAt,
            employeeId,
            validatedByUserId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TimeEntryCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalEntryDate().map(f -> "entryDate=" + f + ", ").orElse("") +
            optionalCheckIn().map(f -> "checkIn=" + f + ", ").orElse("") +
            optionalCheckOut().map(f -> "checkOut=" + f + ", ").orElse("") +
            optionalWorkedHours().map(f -> "workedHours=" + f + ", ").orElse("") +
            optionalOvertimeHours().map(f -> "overtimeHours=" + f + ", ").orElse("") +
            optionalLateMinutes().map(f -> "lateMinutes=" + f + ", ").orElse("") +
            optionalSource().map(f -> "source=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalAnomalyNote().map(f -> "anomalyNote=" + f + ", ").orElse("") +
            optionalValidatedBy().map(f -> "validatedBy=" + f + ", ").orElse("") +
            optionalValidatedAt().map(f -> "validatedAt=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalValidatedByUserId().map(f -> "validatedByUserId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
