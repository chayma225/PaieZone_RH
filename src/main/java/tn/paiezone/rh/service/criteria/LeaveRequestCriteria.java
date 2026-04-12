package tn.paiezone.rh.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.LeaveRequest} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.LeaveRequestResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /leave-requests?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveRequestCriteria implements Serializable, Criteria {

    /**
     * Class for filtering LeaveStatus
     */
    public static class LeaveStatusFilter extends Filter<LeaveStatus> {

        public LeaveStatusFilter() {}

        public LeaveStatusFilter(LeaveStatusFilter filter) {
            super(filter);
        }

        @Override
        public LeaveStatusFilter copy() {
            return new LeaveStatusFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter startDate;

    private LocalDateFilter endDate;

    private IntegerFilter numberOfDays;

    private LeaveStatusFilter status;

    private InstantFilter requestedAt;

    private InstantFilter processedAt;

    private StringFilter managerComment;

    private StringFilter employeeComment;

    private StringFilter documentUrl;

    private LongFilter employeeId;

    private LongFilter leaveTypeId;

    private LongFilter approvedById;

    private Boolean distinct;

    public LeaveRequestCriteria() {}

    public LeaveRequestCriteria(LeaveRequestCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.startDate = other.optionalStartDate().map(LocalDateFilter::copy).orElse(null);
        this.endDate = other.optionalEndDate().map(LocalDateFilter::copy).orElse(null);
        this.numberOfDays = other.optionalNumberOfDays().map(IntegerFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(LeaveStatusFilter::copy).orElse(null);
        this.requestedAt = other.optionalRequestedAt().map(InstantFilter::copy).orElse(null);
        this.processedAt = other.optionalProcessedAt().map(InstantFilter::copy).orElse(null);
        this.managerComment = other.optionalManagerComment().map(StringFilter::copy).orElse(null);
        this.employeeComment = other.optionalEmployeeComment().map(StringFilter::copy).orElse(null);
        this.documentUrl = other.optionalDocumentUrl().map(StringFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.leaveTypeId = other.optionalLeaveTypeId().map(LongFilter::copy).orElse(null);
        this.approvedById = other.optionalApprovedById().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public LeaveRequestCriteria copy() {
        return new LeaveRequestCriteria(this);
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

    public LocalDateFilter getStartDate() {
        return startDate;
    }

    public Optional<LocalDateFilter> optionalStartDate() {
        return Optional.ofNullable(startDate);
    }

    public LocalDateFilter startDate() {
        if (startDate == null) {
            setStartDate(new LocalDateFilter());
        }
        return startDate;
    }

    public void setStartDate(LocalDateFilter startDate) {
        this.startDate = startDate;
    }

    public LocalDateFilter getEndDate() {
        return endDate;
    }

    public Optional<LocalDateFilter> optionalEndDate() {
        return Optional.ofNullable(endDate);
    }

    public LocalDateFilter endDate() {
        if (endDate == null) {
            setEndDate(new LocalDateFilter());
        }
        return endDate;
    }

    public void setEndDate(LocalDateFilter endDate) {
        this.endDate = endDate;
    }

    public IntegerFilter getNumberOfDays() {
        return numberOfDays;
    }

    public Optional<IntegerFilter> optionalNumberOfDays() {
        return Optional.ofNullable(numberOfDays);
    }

    public IntegerFilter numberOfDays() {
        if (numberOfDays == null) {
            setNumberOfDays(new IntegerFilter());
        }
        return numberOfDays;
    }

    public void setNumberOfDays(IntegerFilter numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public LeaveStatusFilter getStatus() {
        return status;
    }

    public Optional<LeaveStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public LeaveStatusFilter status() {
        if (status == null) {
            setStatus(new LeaveStatusFilter());
        }
        return status;
    }

    public void setStatus(LeaveStatusFilter status) {
        this.status = status;
    }

    public InstantFilter getRequestedAt() {
        return requestedAt;
    }

    public Optional<InstantFilter> optionalRequestedAt() {
        return Optional.ofNullable(requestedAt);
    }

    public InstantFilter requestedAt() {
        if (requestedAt == null) {
            setRequestedAt(new InstantFilter());
        }
        return requestedAt;
    }

    public void setRequestedAt(InstantFilter requestedAt) {
        this.requestedAt = requestedAt;
    }

    public InstantFilter getProcessedAt() {
        return processedAt;
    }

    public Optional<InstantFilter> optionalProcessedAt() {
        return Optional.ofNullable(processedAt);
    }

    public InstantFilter processedAt() {
        if (processedAt == null) {
            setProcessedAt(new InstantFilter());
        }
        return processedAt;
    }

    public void setProcessedAt(InstantFilter processedAt) {
        this.processedAt = processedAt;
    }

    public StringFilter getManagerComment() {
        return managerComment;
    }

    public Optional<StringFilter> optionalManagerComment() {
        return Optional.ofNullable(managerComment);
    }

    public StringFilter managerComment() {
        if (managerComment == null) {
            setManagerComment(new StringFilter());
        }
        return managerComment;
    }

    public void setManagerComment(StringFilter managerComment) {
        this.managerComment = managerComment;
    }

    public StringFilter getEmployeeComment() {
        return employeeComment;
    }

    public Optional<StringFilter> optionalEmployeeComment() {
        return Optional.ofNullable(employeeComment);
    }

    public StringFilter employeeComment() {
        if (employeeComment == null) {
            setEmployeeComment(new StringFilter());
        }
        return employeeComment;
    }

    public void setEmployeeComment(StringFilter employeeComment) {
        this.employeeComment = employeeComment;
    }

    public StringFilter getDocumentUrl() {
        return documentUrl;
    }

    public Optional<StringFilter> optionalDocumentUrl() {
        return Optional.ofNullable(documentUrl);
    }

    public StringFilter documentUrl() {
        if (documentUrl == null) {
            setDocumentUrl(new StringFilter());
        }
        return documentUrl;
    }

    public void setDocumentUrl(StringFilter documentUrl) {
        this.documentUrl = documentUrl;
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

    public LongFilter getLeaveTypeId() {
        return leaveTypeId;
    }

    public Optional<LongFilter> optionalLeaveTypeId() {
        return Optional.ofNullable(leaveTypeId);
    }

    public LongFilter leaveTypeId() {
        if (leaveTypeId == null) {
            setLeaveTypeId(new LongFilter());
        }
        return leaveTypeId;
    }

    public void setLeaveTypeId(LongFilter leaveTypeId) {
        this.leaveTypeId = leaveTypeId;
    }

    public LongFilter getApprovedById() {
        return approvedById;
    }

    public Optional<LongFilter> optionalApprovedById() {
        return Optional.ofNullable(approvedById);
    }

    public LongFilter approvedById() {
        if (approvedById == null) {
            setApprovedById(new LongFilter());
        }
        return approvedById;
    }

    public void setApprovedById(LongFilter approvedById) {
        this.approvedById = approvedById;
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
        final LeaveRequestCriteria that = (LeaveRequestCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(startDate, that.startDate) &&
            Objects.equals(endDate, that.endDate) &&
            Objects.equals(numberOfDays, that.numberOfDays) &&
            Objects.equals(status, that.status) &&
            Objects.equals(requestedAt, that.requestedAt) &&
            Objects.equals(processedAt, that.processedAt) &&
            Objects.equals(managerComment, that.managerComment) &&
            Objects.equals(employeeComment, that.employeeComment) &&
            Objects.equals(documentUrl, that.documentUrl) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(leaveTypeId, that.leaveTypeId) &&
            Objects.equals(approvedById, that.approvedById) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            startDate,
            endDate,
            numberOfDays,
            status,
            requestedAt,
            processedAt,
            managerComment,
            employeeComment,
            documentUrl,
            employeeId,
            leaveTypeId,
            approvedById,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveRequestCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalStartDate().map(f -> "startDate=" + f + ", ").orElse("") +
            optionalEndDate().map(f -> "endDate=" + f + ", ").orElse("") +
            optionalNumberOfDays().map(f -> "numberOfDays=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalRequestedAt().map(f -> "requestedAt=" + f + ", ").orElse("") +
            optionalProcessedAt().map(f -> "processedAt=" + f + ", ").orElse("") +
            optionalManagerComment().map(f -> "managerComment=" + f + ", ").orElse("") +
            optionalEmployeeComment().map(f -> "employeeComment=" + f + ", ").orElse("") +
            optionalDocumentUrl().map(f -> "documentUrl=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalLeaveTypeId().map(f -> "leaveTypeId=" + f + ", ").orElse("") +
            optionalApprovedById().map(f -> "approvedById=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
