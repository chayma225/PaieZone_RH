package tn.paiezone.rh.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.BonusType;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.Bonus} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.BonusResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /bonuses?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BonusCriteria implements Serializable, Criteria {

    /**
     * Class for filtering BonusType
     */
    public static class BonusTypeFilter extends Filter<BonusType> {

        public BonusTypeFilter() {}

        public BonusTypeFilter(BonusTypeFilter filter) {
            super(filter);
        }

        @Override
        public BonusTypeFilter copy() {
            return new BonusTypeFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private BonusTypeFilter bonusType;

    private StringFilter label;

    private BigDecimalFilter amount;

    private BooleanFilter taxable;

    private IntegerFilter month;

    private IntegerFilter year;

    private StringFilter notes;

    private LongFilter employeeId;

    private LongFilter paySlipId;

    private Boolean distinct;

    public BonusCriteria() {}

    public BonusCriteria(BonusCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.bonusType = other.optionalBonusType().map(BonusTypeFilter::copy).orElse(null);
        this.label = other.optionalLabel().map(StringFilter::copy).orElse(null);
        this.amount = other.optionalAmount().map(BigDecimalFilter::copy).orElse(null);
        this.taxable = other.optionalTaxable().map(BooleanFilter::copy).orElse(null);
        this.month = other.optionalMonth().map(IntegerFilter::copy).orElse(null);
        this.year = other.optionalYear().map(IntegerFilter::copy).orElse(null);
        this.notes = other.optionalNotes().map(StringFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.paySlipId = other.optionalPaySlipId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public BonusCriteria copy() {
        return new BonusCriteria(this);
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

    public BonusTypeFilter getBonusType() {
        return bonusType;
    }

    public Optional<BonusTypeFilter> optionalBonusType() {
        return Optional.ofNullable(bonusType);
    }

    public BonusTypeFilter bonusType() {
        if (bonusType == null) {
            setBonusType(new BonusTypeFilter());
        }
        return bonusType;
    }

    public void setBonusType(BonusTypeFilter bonusType) {
        this.bonusType = bonusType;
    }

    public StringFilter getLabel() {
        return label;
    }

    public Optional<StringFilter> optionalLabel() {
        return Optional.ofNullable(label);
    }

    public StringFilter label() {
        if (label == null) {
            setLabel(new StringFilter());
        }
        return label;
    }

    public void setLabel(StringFilter label) {
        this.label = label;
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

    public BooleanFilter getTaxable() {
        return taxable;
    }

    public Optional<BooleanFilter> optionalTaxable() {
        return Optional.ofNullable(taxable);
    }

    public BooleanFilter taxable() {
        if (taxable == null) {
            setTaxable(new BooleanFilter());
        }
        return taxable;
    }

    public void setTaxable(BooleanFilter taxable) {
        this.taxable = taxable;
    }

    public IntegerFilter getMonth() {
        return month;
    }

    public Optional<IntegerFilter> optionalMonth() {
        return Optional.ofNullable(month);
    }

    public IntegerFilter month() {
        if (month == null) {
            setMonth(new IntegerFilter());
        }
        return month;
    }

    public void setMonth(IntegerFilter month) {
        this.month = month;
    }

    public IntegerFilter getYear() {
        return year;
    }

    public Optional<IntegerFilter> optionalYear() {
        return Optional.ofNullable(year);
    }

    public IntegerFilter year() {
        if (year == null) {
            setYear(new IntegerFilter());
        }
        return year;
    }

    public void setYear(IntegerFilter year) {
        this.year = year;
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
        final BonusCriteria that = (BonusCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(bonusType, that.bonusType) &&
            Objects.equals(label, that.label) &&
            Objects.equals(amount, that.amount) &&
            Objects.equals(taxable, that.taxable) &&
            Objects.equals(month, that.month) &&
            Objects.equals(year, that.year) &&
            Objects.equals(notes, that.notes) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(paySlipId, that.paySlipId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, bonusType, label, amount, taxable, month, year, notes, employeeId, paySlipId, distinct);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BonusCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalBonusType().map(f -> "bonusType=" + f + ", ").orElse("") +
            optionalLabel().map(f -> "label=" + f + ", ").orElse("") +
            optionalAmount().map(f -> "amount=" + f + ", ").orElse("") +
            optionalTaxable().map(f -> "taxable=" + f + ", ").orElse("") +
            optionalMonth().map(f -> "month=" + f + ", ").orElse("") +
            optionalYear().map(f -> "year=" + f + ", ").orElse("") +
            optionalNotes().map(f -> "notes=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalPaySlipId().map(f -> "paySlipId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
