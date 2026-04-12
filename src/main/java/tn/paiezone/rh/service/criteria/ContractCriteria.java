package tn.paiezone.rh.service.criteria;

import java.io.Serial;
import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.domain.enumeration.ContractType;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.Contract} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.ContractResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /contracts?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ContractCriteria implements Serializable, Criteria {

    /**
     * Class for filtering ContractType
     */
    public static class ContractTypeFilter extends Filter<ContractType> {

        public ContractTypeFilter() {}

        public ContractTypeFilter(ContractTypeFilter filter) {
            super(filter);
        }

        @Override
        public ContractTypeFilter copy() {
            return new ContractTypeFilter(this);
        }
    }

    /**
     * Class for filtering ContractStatus
     */
    public static class ContractStatusFilter extends Filter<ContractStatus> {

        public ContractStatusFilter() {}

        public ContractStatusFilter(ContractStatusFilter filter) {
            super(filter);
        }

        @Override
        public ContractStatusFilter copy() {
            return new ContractStatusFilter(this);
        }
    }

    @Serial
    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter reference;

    private ContractTypeFilter contractType;

    private ContractStatusFilter status;

    private LocalDateFilter startDate;

    private LocalDateFilter endDate;

    private LocalDateFilter signedDate;

    private BigDecimalFilter baseSalary;

    private IntegerFilter workingHoursWeek;

    private IntegerFilter workingDaysWeek;

    private StringFilter conventionCollective;

    private IntegerFilter trialPeriodMonths;

    private IntegerFilter renewalCount;

    private StringFilter documentUrl;

    private InstantFilter createdAt;

    private LongFilter employeeId;

    private LongFilter createdById;

    private Boolean distinct;

    public ContractCriteria() {}

    public ContractCriteria(ContractCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.reference = other.optionalReference().map(StringFilter::copy).orElse(null);
        this.contractType = other.optionalContractType().map(ContractTypeFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(ContractStatusFilter::copy).orElse(null);
        this.startDate = other.optionalStartDate().map(LocalDateFilter::copy).orElse(null);
        this.endDate = other.optionalEndDate().map(LocalDateFilter::copy).orElse(null);
        this.signedDate = other.optionalSignedDate().map(LocalDateFilter::copy).orElse(null);
        this.baseSalary = other.optionalBaseSalary().map(BigDecimalFilter::copy).orElse(null);
        this.workingHoursWeek = other.optionalWorkingHoursWeek().map(IntegerFilter::copy).orElse(null);
        this.workingDaysWeek = other.optionalWorkingDaysWeek().map(IntegerFilter::copy).orElse(null);
        this.conventionCollective = other.optionalConventionCollective().map(StringFilter::copy).orElse(null);
        this.trialPeriodMonths = other.optionalTrialPeriodMonths().map(IntegerFilter::copy).orElse(null);
        this.renewalCount = other.optionalRenewalCount().map(IntegerFilter::copy).orElse(null);
        this.documentUrl = other.optionalDocumentUrl().map(StringFilter::copy).orElse(null);
        this.createdAt = other.optionalCreatedAt().map(InstantFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.createdById = other.optionalCreatedById().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public ContractCriteria copy() {
        return new ContractCriteria(this);
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

    public StringFilter getReference() {
        return reference;
    }

    public Optional<StringFilter> optionalReference() {
        return Optional.ofNullable(reference);
    }

    public StringFilter reference() {
        if (reference == null) {
            setReference(new StringFilter());
        }
        return reference;
    }

    public void setReference(StringFilter reference) {
        this.reference = reference;
    }

    public ContractTypeFilter getContractType() {
        return contractType;
    }

    public Optional<ContractTypeFilter> optionalContractType() {
        return Optional.ofNullable(contractType);
    }

    public ContractTypeFilter contractType() {
        if (contractType == null) {
            setContractType(new ContractTypeFilter());
        }
        return contractType;
    }

    public void setContractType(ContractTypeFilter contractType) {
        this.contractType = contractType;
    }

    public ContractStatusFilter getStatus() {
        return status;
    }

    public Optional<ContractStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public ContractStatusFilter status() {
        if (status == null) {
            setStatus(new ContractStatusFilter());
        }
        return status;
    }

    public void setStatus(ContractStatusFilter status) {
        this.status = status;
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

    public LocalDateFilter getSignedDate() {
        return signedDate;
    }

    public Optional<LocalDateFilter> optionalSignedDate() {
        return Optional.ofNullable(signedDate);
    }

    public LocalDateFilter signedDate() {
        if (signedDate == null) {
            setSignedDate(new LocalDateFilter());
        }
        return signedDate;
    }

    public void setSignedDate(LocalDateFilter signedDate) {
        this.signedDate = signedDate;
    }

    public BigDecimalFilter getBaseSalary() {
        return baseSalary;
    }

    public Optional<BigDecimalFilter> optionalBaseSalary() {
        return Optional.ofNullable(baseSalary);
    }

    public BigDecimalFilter baseSalary() {
        if (baseSalary == null) {
            setBaseSalary(new BigDecimalFilter());
        }
        return baseSalary;
    }

    public void setBaseSalary(BigDecimalFilter baseSalary) {
        this.baseSalary = baseSalary;
    }

    public IntegerFilter getWorkingHoursWeek() {
        return workingHoursWeek;
    }

    public Optional<IntegerFilter> optionalWorkingHoursWeek() {
        return Optional.ofNullable(workingHoursWeek);
    }

    public IntegerFilter workingHoursWeek() {
        if (workingHoursWeek == null) {
            setWorkingHoursWeek(new IntegerFilter());
        }
        return workingHoursWeek;
    }

    public void setWorkingHoursWeek(IntegerFilter workingHoursWeek) {
        this.workingHoursWeek = workingHoursWeek;
    }

    public IntegerFilter getWorkingDaysWeek() {
        return workingDaysWeek;
    }

    public Optional<IntegerFilter> optionalWorkingDaysWeek() {
        return Optional.ofNullable(workingDaysWeek);
    }

    public IntegerFilter workingDaysWeek() {
        if (workingDaysWeek == null) {
            setWorkingDaysWeek(new IntegerFilter());
        }
        return workingDaysWeek;
    }

    public void setWorkingDaysWeek(IntegerFilter workingDaysWeek) {
        this.workingDaysWeek = workingDaysWeek;
    }

    public StringFilter getConventionCollective() {
        return conventionCollective;
    }

    public Optional<StringFilter> optionalConventionCollective() {
        return Optional.ofNullable(conventionCollective);
    }

    public StringFilter conventionCollective() {
        if (conventionCollective == null) {
            setConventionCollective(new StringFilter());
        }
        return conventionCollective;
    }

    public void setConventionCollective(StringFilter conventionCollective) {
        this.conventionCollective = conventionCollective;
    }

    public IntegerFilter getTrialPeriodMonths() {
        return trialPeriodMonths;
    }

    public Optional<IntegerFilter> optionalTrialPeriodMonths() {
        return Optional.ofNullable(trialPeriodMonths);
    }

    public IntegerFilter trialPeriodMonths() {
        if (trialPeriodMonths == null) {
            setTrialPeriodMonths(new IntegerFilter());
        }
        return trialPeriodMonths;
    }

    public void setTrialPeriodMonths(IntegerFilter trialPeriodMonths) {
        this.trialPeriodMonths = trialPeriodMonths;
    }

    public IntegerFilter getRenewalCount() {
        return renewalCount;
    }

    public Optional<IntegerFilter> optionalRenewalCount() {
        return Optional.ofNullable(renewalCount);
    }

    public IntegerFilter renewalCount() {
        if (renewalCount == null) {
            setRenewalCount(new IntegerFilter());
        }
        return renewalCount;
    }

    public void setRenewalCount(IntegerFilter renewalCount) {
        this.renewalCount = renewalCount;
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

    public InstantFilter getCreatedAt() {
        return createdAt;
    }

    public Optional<InstantFilter> optionalCreatedAt() {
        return Optional.ofNullable(createdAt);
    }

    public InstantFilter createdAt() {
        if (createdAt == null) {
            setCreatedAt(new InstantFilter());
        }
        return createdAt;
    }

    public void setCreatedAt(InstantFilter createdAt) {
        this.createdAt = createdAt;
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

    public LongFilter getCreatedById() {
        return createdById;
    }

    public Optional<LongFilter> optionalCreatedById() {
        return Optional.ofNullable(createdById);
    }

    public LongFilter createdById() {
        if (createdById == null) {
            setCreatedById(new LongFilter());
        }
        return createdById;
    }

    public void setCreatedById(LongFilter createdById) {
        this.createdById = createdById;
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
        final ContractCriteria that = (ContractCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(reference, that.reference) &&
            Objects.equals(contractType, that.contractType) &&
            Objects.equals(status, that.status) &&
            Objects.equals(startDate, that.startDate) &&
            Objects.equals(endDate, that.endDate) &&
            Objects.equals(signedDate, that.signedDate) &&
            Objects.equals(baseSalary, that.baseSalary) &&
            Objects.equals(workingHoursWeek, that.workingHoursWeek) &&
            Objects.equals(workingDaysWeek, that.workingDaysWeek) &&
            Objects.equals(conventionCollective, that.conventionCollective) &&
            Objects.equals(trialPeriodMonths, that.trialPeriodMonths) &&
            Objects.equals(renewalCount, that.renewalCount) &&
            Objects.equals(documentUrl, that.documentUrl) &&
            Objects.equals(createdAt, that.createdAt) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(createdById, that.createdById) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            reference,
            contractType,
            status,
            startDate,
            endDate,
            signedDate,
            baseSalary,
            workingHoursWeek,
            workingDaysWeek,
            conventionCollective,
            trialPeriodMonths,
            renewalCount,
            documentUrl,
            createdAt,
            employeeId,
            createdById,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ContractCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalReference().map(f -> "reference=" + f + ", ").orElse("") +
            optionalContractType().map(f -> "contractType=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalStartDate().map(f -> "startDate=" + f + ", ").orElse("") +
            optionalEndDate().map(f -> "endDate=" + f + ", ").orElse("") +
            optionalSignedDate().map(f -> "signedDate=" + f + ", ").orElse("") +
            optionalBaseSalary().map(f -> "baseSalary=" + f + ", ").orElse("") +
            optionalWorkingHoursWeek().map(f -> "workingHoursWeek=" + f + ", ").orElse("") +
            optionalWorkingDaysWeek().map(f -> "workingDaysWeek=" + f + ", ").orElse("") +
            optionalConventionCollective().map(f -> "conventionCollective=" + f + ", ").orElse("") +
            optionalTrialPeriodMonths().map(f -> "trialPeriodMonths=" + f + ", ").orElse("") +
            optionalRenewalCount().map(f -> "renewalCount=" + f + ", ").orElse("") +
            optionalDocumentUrl().map(f -> "documentUrl=" + f + ", ").orElse("") +
            optionalCreatedAt().map(f -> "createdAt=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalCreatedById().map(f -> "createdById=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
