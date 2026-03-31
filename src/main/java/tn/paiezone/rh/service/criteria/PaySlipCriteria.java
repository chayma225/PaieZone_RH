package tn.paiezone.rh.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.PaySlip} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.PaySlipResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /pay-slips?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaySlipCriteria implements Serializable, Criteria {

    /**
     * Class for filtering PayrollStatus
     */
    public static class PayrollStatusFilter extends Filter<PayrollStatus> {

        public PayrollStatusFilter() {}

        public PayrollStatusFilter(PayrollStatusFilter filter) {
            super(filter);
        }

        @Override
        public PayrollStatusFilter copy() {
            return new PayrollStatusFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private IntegerFilter month;

    private IntegerFilter year;

    private BigDecimalFilter baseSalary;

    private BigDecimalFilter totalGains;

    private BigDecimalFilter totalDeductions;

    private BigDecimalFilter grossSalary;

    private BigDecimalFilter cnssSalaryAmount;

    private BigDecimalFilter cavisAmount;

    private BigDecimalFilter taxableIncome;

    private BigDecimalFilter irppAmount;

    private BigDecimalFilter netSalary;

    private BigDecimalFilter employerCnss;

    private BigDecimalFilter employerCavis;

    private BigDecimalFilter totalEmployerCost;

    private IntegerFilter workedDays;

    private IntegerFilter paidLeaveDays;

    private IntegerFilter unpaidDays;

    private BigDecimalFilter overtimeHours;

    private PayrollStatusFilter status;

    private StringFilter pdfUrl;

    private InstantFilter generatedAt;

    private InstantFilter sentToEmployeeAt;

    private StringFilter bankTransferRef;

    private LongFilter employeeId;

    private LongFilter payrollPeriodId;

    private LongFilter contractId;

    private Boolean distinct;

    public PaySlipCriteria() {}

    public PaySlipCriteria(PaySlipCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.month = other.optionalMonth().map(IntegerFilter::copy).orElse(null);
        this.year = other.optionalYear().map(IntegerFilter::copy).orElse(null);
        this.baseSalary = other.optionalBaseSalary().map(BigDecimalFilter::copy).orElse(null);
        this.totalGains = other.optionalTotalGains().map(BigDecimalFilter::copy).orElse(null);
        this.totalDeductions = other.optionalTotalDeductions().map(BigDecimalFilter::copy).orElse(null);
        this.grossSalary = other.optionalGrossSalary().map(BigDecimalFilter::copy).orElse(null);
        this.cnssSalaryAmount = other.optionalCnssSalaryAmount().map(BigDecimalFilter::copy).orElse(null);
        this.cavisAmount = other.optionalCavisAmount().map(BigDecimalFilter::copy).orElse(null);
        this.taxableIncome = other.optionalTaxableIncome().map(BigDecimalFilter::copy).orElse(null);
        this.irppAmount = other.optionalIrppAmount().map(BigDecimalFilter::copy).orElse(null);
        this.netSalary = other.optionalNetSalary().map(BigDecimalFilter::copy).orElse(null);
        this.employerCnss = other.optionalEmployerCnss().map(BigDecimalFilter::copy).orElse(null);
        this.employerCavis = other.optionalEmployerCavis().map(BigDecimalFilter::copy).orElse(null);
        this.totalEmployerCost = other.optionalTotalEmployerCost().map(BigDecimalFilter::copy).orElse(null);
        this.workedDays = other.optionalWorkedDays().map(IntegerFilter::copy).orElse(null);
        this.paidLeaveDays = other.optionalPaidLeaveDays().map(IntegerFilter::copy).orElse(null);
        this.unpaidDays = other.optionalUnpaidDays().map(IntegerFilter::copy).orElse(null);
        this.overtimeHours = other.optionalOvertimeHours().map(BigDecimalFilter::copy).orElse(null);
        this.status = other.optionalStatus().map(PayrollStatusFilter::copy).orElse(null);
        this.pdfUrl = other.optionalPdfUrl().map(StringFilter::copy).orElse(null);
        this.generatedAt = other.optionalGeneratedAt().map(InstantFilter::copy).orElse(null);
        this.sentToEmployeeAt = other.optionalSentToEmployeeAt().map(InstantFilter::copy).orElse(null);
        this.bankTransferRef = other.optionalBankTransferRef().map(StringFilter::copy).orElse(null);
        this.employeeId = other.optionalEmployeeId().map(LongFilter::copy).orElse(null);
        this.payrollPeriodId = other.optionalPayrollPeriodId().map(LongFilter::copy).orElse(null);
        this.contractId = other.optionalContractId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public PaySlipCriteria copy() {
        return new PaySlipCriteria(this);
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

    public BigDecimalFilter getTotalGains() {
        return totalGains;
    }

    public Optional<BigDecimalFilter> optionalTotalGains() {
        return Optional.ofNullable(totalGains);
    }

    public BigDecimalFilter totalGains() {
        if (totalGains == null) {
            setTotalGains(new BigDecimalFilter());
        }
        return totalGains;
    }

    public void setTotalGains(BigDecimalFilter totalGains) {
        this.totalGains = totalGains;
    }

    public BigDecimalFilter getTotalDeductions() {
        return totalDeductions;
    }

    public Optional<BigDecimalFilter> optionalTotalDeductions() {
        return Optional.ofNullable(totalDeductions);
    }

    public BigDecimalFilter totalDeductions() {
        if (totalDeductions == null) {
            setTotalDeductions(new BigDecimalFilter());
        }
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimalFilter totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimalFilter getGrossSalary() {
        return grossSalary;
    }

    public Optional<BigDecimalFilter> optionalGrossSalary() {
        return Optional.ofNullable(grossSalary);
    }

    public BigDecimalFilter grossSalary() {
        if (grossSalary == null) {
            setGrossSalary(new BigDecimalFilter());
        }
        return grossSalary;
    }

    public void setGrossSalary(BigDecimalFilter grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimalFilter getCnssSalaryAmount() {
        return cnssSalaryAmount;
    }

    public Optional<BigDecimalFilter> optionalCnssSalaryAmount() {
        return Optional.ofNullable(cnssSalaryAmount);
    }

    public BigDecimalFilter cnssSalaryAmount() {
        if (cnssSalaryAmount == null) {
            setCnssSalaryAmount(new BigDecimalFilter());
        }
        return cnssSalaryAmount;
    }

    public void setCnssSalaryAmount(BigDecimalFilter cnssSalaryAmount) {
        this.cnssSalaryAmount = cnssSalaryAmount;
    }

    public BigDecimalFilter getCavisAmount() {
        return cavisAmount;
    }

    public Optional<BigDecimalFilter> optionalCavisAmount() {
        return Optional.ofNullable(cavisAmount);
    }

    public BigDecimalFilter cavisAmount() {
        if (cavisAmount == null) {
            setCavisAmount(new BigDecimalFilter());
        }
        return cavisAmount;
    }

    public void setCavisAmount(BigDecimalFilter cavisAmount) {
        this.cavisAmount = cavisAmount;
    }

    public BigDecimalFilter getTaxableIncome() {
        return taxableIncome;
    }

    public Optional<BigDecimalFilter> optionalTaxableIncome() {
        return Optional.ofNullable(taxableIncome);
    }

    public BigDecimalFilter taxableIncome() {
        if (taxableIncome == null) {
            setTaxableIncome(new BigDecimalFilter());
        }
        return taxableIncome;
    }

    public void setTaxableIncome(BigDecimalFilter taxableIncome) {
        this.taxableIncome = taxableIncome;
    }

    public BigDecimalFilter getIrppAmount() {
        return irppAmount;
    }

    public Optional<BigDecimalFilter> optionalIrppAmount() {
        return Optional.ofNullable(irppAmount);
    }

    public BigDecimalFilter irppAmount() {
        if (irppAmount == null) {
            setIrppAmount(new BigDecimalFilter());
        }
        return irppAmount;
    }

    public void setIrppAmount(BigDecimalFilter irppAmount) {
        this.irppAmount = irppAmount;
    }

    public BigDecimalFilter getNetSalary() {
        return netSalary;
    }

    public Optional<BigDecimalFilter> optionalNetSalary() {
        return Optional.ofNullable(netSalary);
    }

    public BigDecimalFilter netSalary() {
        if (netSalary == null) {
            setNetSalary(new BigDecimalFilter());
        }
        return netSalary;
    }

    public void setNetSalary(BigDecimalFilter netSalary) {
        this.netSalary = netSalary;
    }

    public BigDecimalFilter getEmployerCnss() {
        return employerCnss;
    }

    public Optional<BigDecimalFilter> optionalEmployerCnss() {
        return Optional.ofNullable(employerCnss);
    }

    public BigDecimalFilter employerCnss() {
        if (employerCnss == null) {
            setEmployerCnss(new BigDecimalFilter());
        }
        return employerCnss;
    }

    public void setEmployerCnss(BigDecimalFilter employerCnss) {
        this.employerCnss = employerCnss;
    }

    public BigDecimalFilter getEmployerCavis() {
        return employerCavis;
    }

    public Optional<BigDecimalFilter> optionalEmployerCavis() {
        return Optional.ofNullable(employerCavis);
    }

    public BigDecimalFilter employerCavis() {
        if (employerCavis == null) {
            setEmployerCavis(new BigDecimalFilter());
        }
        return employerCavis;
    }

    public void setEmployerCavis(BigDecimalFilter employerCavis) {
        this.employerCavis = employerCavis;
    }

    public BigDecimalFilter getTotalEmployerCost() {
        return totalEmployerCost;
    }

    public Optional<BigDecimalFilter> optionalTotalEmployerCost() {
        return Optional.ofNullable(totalEmployerCost);
    }

    public BigDecimalFilter totalEmployerCost() {
        if (totalEmployerCost == null) {
            setTotalEmployerCost(new BigDecimalFilter());
        }
        return totalEmployerCost;
    }

    public void setTotalEmployerCost(BigDecimalFilter totalEmployerCost) {
        this.totalEmployerCost = totalEmployerCost;
    }

    public IntegerFilter getWorkedDays() {
        return workedDays;
    }

    public Optional<IntegerFilter> optionalWorkedDays() {
        return Optional.ofNullable(workedDays);
    }

    public IntegerFilter workedDays() {
        if (workedDays == null) {
            setWorkedDays(new IntegerFilter());
        }
        return workedDays;
    }

    public void setWorkedDays(IntegerFilter workedDays) {
        this.workedDays = workedDays;
    }

    public IntegerFilter getPaidLeaveDays() {
        return paidLeaveDays;
    }

    public Optional<IntegerFilter> optionalPaidLeaveDays() {
        return Optional.ofNullable(paidLeaveDays);
    }

    public IntegerFilter paidLeaveDays() {
        if (paidLeaveDays == null) {
            setPaidLeaveDays(new IntegerFilter());
        }
        return paidLeaveDays;
    }

    public void setPaidLeaveDays(IntegerFilter paidLeaveDays) {
        this.paidLeaveDays = paidLeaveDays;
    }

    public IntegerFilter getUnpaidDays() {
        return unpaidDays;
    }

    public Optional<IntegerFilter> optionalUnpaidDays() {
        return Optional.ofNullable(unpaidDays);
    }

    public IntegerFilter unpaidDays() {
        if (unpaidDays == null) {
            setUnpaidDays(new IntegerFilter());
        }
        return unpaidDays;
    }

    public void setUnpaidDays(IntegerFilter unpaidDays) {
        this.unpaidDays = unpaidDays;
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

    public PayrollStatusFilter getStatus() {
        return status;
    }

    public Optional<PayrollStatusFilter> optionalStatus() {
        return Optional.ofNullable(status);
    }

    public PayrollStatusFilter status() {
        if (status == null) {
            setStatus(new PayrollStatusFilter());
        }
        return status;
    }

    public void setStatus(PayrollStatusFilter status) {
        this.status = status;
    }

    public StringFilter getPdfUrl() {
        return pdfUrl;
    }

    public Optional<StringFilter> optionalPdfUrl() {
        return Optional.ofNullable(pdfUrl);
    }

    public StringFilter pdfUrl() {
        if (pdfUrl == null) {
            setPdfUrl(new StringFilter());
        }
        return pdfUrl;
    }

    public void setPdfUrl(StringFilter pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public InstantFilter getGeneratedAt() {
        return generatedAt;
    }

    public Optional<InstantFilter> optionalGeneratedAt() {
        return Optional.ofNullable(generatedAt);
    }

    public InstantFilter generatedAt() {
        if (generatedAt == null) {
            setGeneratedAt(new InstantFilter());
        }
        return generatedAt;
    }

    public void setGeneratedAt(InstantFilter generatedAt) {
        this.generatedAt = generatedAt;
    }

    public InstantFilter getSentToEmployeeAt() {
        return sentToEmployeeAt;
    }

    public Optional<InstantFilter> optionalSentToEmployeeAt() {
        return Optional.ofNullable(sentToEmployeeAt);
    }

    public InstantFilter sentToEmployeeAt() {
        if (sentToEmployeeAt == null) {
            setSentToEmployeeAt(new InstantFilter());
        }
        return sentToEmployeeAt;
    }

    public void setSentToEmployeeAt(InstantFilter sentToEmployeeAt) {
        this.sentToEmployeeAt = sentToEmployeeAt;
    }

    public StringFilter getBankTransferRef() {
        return bankTransferRef;
    }

    public Optional<StringFilter> optionalBankTransferRef() {
        return Optional.ofNullable(bankTransferRef);
    }

    public StringFilter bankTransferRef() {
        if (bankTransferRef == null) {
            setBankTransferRef(new StringFilter());
        }
        return bankTransferRef;
    }

    public void setBankTransferRef(StringFilter bankTransferRef) {
        this.bankTransferRef = bankTransferRef;
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

    public LongFilter getPayrollPeriodId() {
        return payrollPeriodId;
    }

    public Optional<LongFilter> optionalPayrollPeriodId() {
        return Optional.ofNullable(payrollPeriodId);
    }

    public LongFilter payrollPeriodId() {
        if (payrollPeriodId == null) {
            setPayrollPeriodId(new LongFilter());
        }
        return payrollPeriodId;
    }

    public void setPayrollPeriodId(LongFilter payrollPeriodId) {
        this.payrollPeriodId = payrollPeriodId;
    }

    public LongFilter getContractId() {
        return contractId;
    }

    public Optional<LongFilter> optionalContractId() {
        return Optional.ofNullable(contractId);
    }

    public LongFilter contractId() {
        if (contractId == null) {
            setContractId(new LongFilter());
        }
        return contractId;
    }

    public void setContractId(LongFilter contractId) {
        this.contractId = contractId;
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
        final PaySlipCriteria that = (PaySlipCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(month, that.month) &&
            Objects.equals(year, that.year) &&
            Objects.equals(baseSalary, that.baseSalary) &&
            Objects.equals(totalGains, that.totalGains) &&
            Objects.equals(totalDeductions, that.totalDeductions) &&
            Objects.equals(grossSalary, that.grossSalary) &&
            Objects.equals(cnssSalaryAmount, that.cnssSalaryAmount) &&
            Objects.equals(cavisAmount, that.cavisAmount) &&
            Objects.equals(taxableIncome, that.taxableIncome) &&
            Objects.equals(irppAmount, that.irppAmount) &&
            Objects.equals(netSalary, that.netSalary) &&
            Objects.equals(employerCnss, that.employerCnss) &&
            Objects.equals(employerCavis, that.employerCavis) &&
            Objects.equals(totalEmployerCost, that.totalEmployerCost) &&
            Objects.equals(workedDays, that.workedDays) &&
            Objects.equals(paidLeaveDays, that.paidLeaveDays) &&
            Objects.equals(unpaidDays, that.unpaidDays) &&
            Objects.equals(overtimeHours, that.overtimeHours) &&
            Objects.equals(status, that.status) &&
            Objects.equals(pdfUrl, that.pdfUrl) &&
            Objects.equals(generatedAt, that.generatedAt) &&
            Objects.equals(sentToEmployeeAt, that.sentToEmployeeAt) &&
            Objects.equals(bankTransferRef, that.bankTransferRef) &&
            Objects.equals(employeeId, that.employeeId) &&
            Objects.equals(payrollPeriodId, that.payrollPeriodId) &&
            Objects.equals(contractId, that.contractId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            month,
            year,
            baseSalary,
            totalGains,
            totalDeductions,
            grossSalary,
            cnssSalaryAmount,
            cavisAmount,
            taxableIncome,
            irppAmount,
            netSalary,
            employerCnss,
            employerCavis,
            totalEmployerCost,
            workedDays,
            paidLeaveDays,
            unpaidDays,
            overtimeHours,
            status,
            pdfUrl,
            generatedAt,
            sentToEmployeeAt,
            bankTransferRef,
            employeeId,
            payrollPeriodId,
            contractId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PaySlipCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalMonth().map(f -> "month=" + f + ", ").orElse("") +
            optionalYear().map(f -> "year=" + f + ", ").orElse("") +
            optionalBaseSalary().map(f -> "baseSalary=" + f + ", ").orElse("") +
            optionalTotalGains().map(f -> "totalGains=" + f + ", ").orElse("") +
            optionalTotalDeductions().map(f -> "totalDeductions=" + f + ", ").orElse("") +
            optionalGrossSalary().map(f -> "grossSalary=" + f + ", ").orElse("") +
            optionalCnssSalaryAmount().map(f -> "cnssSalaryAmount=" + f + ", ").orElse("") +
            optionalCavisAmount().map(f -> "cavisAmount=" + f + ", ").orElse("") +
            optionalTaxableIncome().map(f -> "taxableIncome=" + f + ", ").orElse("") +
            optionalIrppAmount().map(f -> "irppAmount=" + f + ", ").orElse("") +
            optionalNetSalary().map(f -> "netSalary=" + f + ", ").orElse("") +
            optionalEmployerCnss().map(f -> "employerCnss=" + f + ", ").orElse("") +
            optionalEmployerCavis().map(f -> "employerCavis=" + f + ", ").orElse("") +
            optionalTotalEmployerCost().map(f -> "totalEmployerCost=" + f + ", ").orElse("") +
            optionalWorkedDays().map(f -> "workedDays=" + f + ", ").orElse("") +
            optionalPaidLeaveDays().map(f -> "paidLeaveDays=" + f + ", ").orElse("") +
            optionalUnpaidDays().map(f -> "unpaidDays=" + f + ", ").orElse("") +
            optionalOvertimeHours().map(f -> "overtimeHours=" + f + ", ").orElse("") +
            optionalStatus().map(f -> "status=" + f + ", ").orElse("") +
            optionalPdfUrl().map(f -> "pdfUrl=" + f + ", ").orElse("") +
            optionalGeneratedAt().map(f -> "generatedAt=" + f + ", ").orElse("") +
            optionalSentToEmployeeAt().map(f -> "sentToEmployeeAt=" + f + ", ").orElse("") +
            optionalBankTransferRef().map(f -> "bankTransferRef=" + f + ", ").orElse("") +
            optionalEmployeeId().map(f -> "employeeId=" + f + ", ").orElse("") +
            optionalPayrollPeriodId().map(f -> "payrollPeriodId=" + f + ", ").orElse("") +
            optionalContractId().map(f -> "contractId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
