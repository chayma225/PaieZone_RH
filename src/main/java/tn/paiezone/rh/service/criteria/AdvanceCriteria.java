package tn.paiezone.rh.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.Advance} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.AdvanceResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /advances?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AdvanceCriteria implements Serializable, Criteria {

    /**
     * Class for filtering AdvanceStatus
     */
    public static class AdvanceStatusFilter extends Filter<AdvanceStatus> {

        public AdvanceStatusFilter() {}

        public AdvanceStatusFilter(AdvanceStatusFilter filter) {
            super(filter);
        }

        @Override
        public AdvanceStatusFilter copy() {
            return new AdvanceStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private LocalDateFilter requestDate;

    private BigDecimalFilter amount;

    private IntegerFilter deductionMonth;

    private IntegerFilter deductionYear;

    private AdvanceStatusFilter status;

    private StringFilter approvedBy;

    private StringFilter notes;

    private LongFilter employeeId;

    private LongFilter paySlipId;

    private LongFilter approvedByUserId;

    private Boolean distinct;

    public AdvanceCriteria() {}

    public AdvanceCriteria(AdvanceCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.requestDate = other.optionalRequestDate().map(LocalDateFilter::copy).orElse(null);
        this.amount = other.optionalAmount().map(BigDecimalFilter::copy).orElse(null);
        this.deductionMonth = other.optionalDeductionMonth().map(IntegerFilter::copy).orElse(null);
        this.deductionYear = other.optionalDeductionYear().map(IntegerFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(AdvanceStatusFilter::copy).orElse(null);
        this.approvedBy = other.optionalApprovedBy().map(StringFilter::copy).orElse(null);
        this.notes = other.optionalNotes().map(StringFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.paySlipId = other.optionalPaySlipId().map(LongFilter::copy).orElse(null);
        this.approvedByUserId = other.optionalApprovedByUserId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public AdvanceCriteria copy() {
        return new AdvanceCriteria(this);
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

    public LocalDateFilter getRequestDate() {
        return requestDate;
    }

    public Optional<LocalDateFilter> optionalRequestDate() {
        return Optional.ofNullable(requestDate);
    }

    public LocalDateFilter requestDate() {
        if (requestDate == null) {
            setRequestDate(new LocalDateFilter());
        }
        return requestDate;
    }

    public void setRequestDate(LocalDateFilter requestDate) {
        this.requestDate = requestDate;
    }

    public BigDecimalFilter getAmount() {
        return amount;
    }

    public Optional<BigDecimalFilter> optionalAmount() {
        return Optional.ofNullable(amount);
    }

    public BigDecimalFilter amount() {
        if (amount == null) {
            setAmount(new BigDecimalFilter());
        }
        return amount;
    }

    public void setAmount(BigDecimalFilter amount) {
        this.amount = amount;
    }

    public IntegerFilter getDeductionMonth() {
        return deductionMonth;
    }

    public Optional<IntegerFilter> optionalDeductionMonth() {
        return Optional.ofNullable(deductionMonth);
    }

    public IntegerFilter deductionMonth() {
        if (deductionMonth == null) {
            setDeductionMonth(new IntegerFilter());
        }
        return deductionMonth;
    }

    public void setDeductionMonth(IntegerFilter deductionMonth) {
        this.deductionMonth = deductionMonth;
    }

    public IntegerFilter getDeductionYear() {
        return deductionYear;
    }

    public Optional<IntegerFilter> optionalDeductionYear() {
        return Optional.ofNullable(deductionYear);
    }

    public IntegerFilter deductionYear() {
        if (deductionYear == null) {
            setDeductionYear(new IntegerFilter());
        }
        return deductionYear;
    }

    public void setDeductionYear(IntegerFilter deductionYear) {
        this.deductionYear = deductionYear;
    }

    public AdvanceStatusFilter getStatus() {
        return status;
    }

    public Optional<AdvanceStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public AdvanceStatusFilter status() {
        if (status == null) {
            setStatus(new AdvanceStatusFilter());
        }
        return status;
    }

    public void setStatus(AdvanceStatusFilter status) {
        this.status = status;
    }

    public StringFilter getApprovedBy() {
        return approvedBy;
    }

    public Optional<StringFilter> optionalApprovedBy() {
        return Optional.ofNullable(approvedBy);
    }

    public StringFilter approvedBy() {
        if (approvedBy == null) {
            setApprovedBy(new StringFilter());
        }
        return approvedBy;
    }

    public void setApprovedBy(StringFilter approvedBy) {
        this.approvedBy = approvedBy;
    }

    public StringFilter getNotes() {
        return notes;
    }

    public Optional<StringFilter> optionalNotes() {
        return Optional.ofNullable(notes);
    }

    public StringFilter notes() {
        if (notes == null) {
            setNotes(new StringFilter());
        }
        return notes;
    }

    public void setNotes(StringFilter notes) {
        this.notes = notes;
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

    public LongFilter getPaySlipId() {
        return paySlipId;
    }

    public Optional<LongFilter> optionalPaySlipId() {
        return Optional.ofNullable(paySlipId);
    }

    public LongFilter paySlipId() {
        if (paySlipId == null) {
            setPaySlipId(new LongFilter());
        }
        return paySlipId;
    }

    public void setPaySlipId(LongFilter paySlipId) {
        this.paySlipId = paySlipId;
    }

    public LongFilter getApprovedByUserId() {
        return approvedByUserId;
    }

    public Optional<LongFilter> optionalApprovedByUserId() {
        return Optional.ofNullable(approvedByUserId);
    }

    public LongFilter approvedByUserId() {
        if (approvedByUserId == null) {
            setApprovedByUserId(new LongFilter());
        }
        return approvedByUserId;
    }

    public void setApprovedByUserId(LongFilter approvedByUserId) {
        this.approvedByUserId = approvedByUserId;
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
        final AdvanceCriteria that = (AdvanceCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(requestDate, that.requestDate) &&
            Objects.equals(amount, that.amount) &&
            Objects.equals(deductionMonth, that.deductionMonth) &&
            Objects.equals(deductionYear, that.deductionYear) &&
            Objects.equals(status, that.status) &&
            Objects.equals(approvedBy, that.approvedBy) &&
            Objects.equals(notes, that.notes) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(paySlipId, that.paySlipId) &&
            Objects.equals(approvedByUserId, that.approvedByUserId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            requestDate,
            amount,
            deductionMonth,
            deductionYear,
            status,
            approvedBy,
            notes,
            employeeId,
            paySlipId,
            approvedByUserId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AdvanceCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalRequestDate().map(f -> "requestDate=" + f + ", ").orElse("") +
            optionalAmount().map(f -> "amount=" + f + ", ").orElse("") +
            optionalDeductionMonth().map(f -> "deductionMonth=" + f + ", ").orElse("") +
            optionalDeductionYear().map(f -> "deductionYear=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalApprovedBy().map(f -> "approvedBy=" + f + ", ").orElse("") +
            optionalNotes().map(f -> "notes=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalPaySlipId().map(f -> "paySlipId=" + f + ", ").orElse("") +
            optionalApprovedByUserId().map(f -> "approvedByUserId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
