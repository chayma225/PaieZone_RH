package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.PaySlip} entity.
 */
@Schema(description = "Bulletin de paie")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaySlipDTO implements Serializable {

    private Long id;

    @NotNull
    @Min(value = 1)
    @Max(value = 12)
    private Integer month;

    @NotNull
    private Integer year;

    @NotNull
    private BigDecimal baseSalary;

    @NotNull
    private BigDecimal totalGains;

    @NotNull
    private BigDecimal totalDeductions;

    @NotNull
    private BigDecimal grossSalary;

    @NotNull
    private BigDecimal cnssSalaryAmount;

    private BigDecimal cavisAmount;

    @NotNull
    private BigDecimal taxableIncome;

    @NotNull
    private BigDecimal irppAmount;

    @NotNull
    private BigDecimal netSalary;

    @NotNull
    private BigDecimal employerCnss;

    private BigDecimal employerCavis;

    @NotNull
    private BigDecimal totalEmployerCost;

    private Integer workedDays;

    private Integer paidLeaveDays;

    private Integer unpaidDays;

    private BigDecimal overtimeHours;

    @NotNull
    private PayrollStatus status;

    @Size(max = 500)
    private String pdfUrl;

    private Instant generatedAt;

    private Instant sentToEmployeeAt;

    @Size(max = 100)
    private String bankTransferRef;

    @NotNull
    private EmployeeDTO employee;

    @NotNull
    private PayrollPeriodDTO payrollPeriod;

    @NotNull
    private ContractDTO contract;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public BigDecimal getTotalGains() {
        return totalGains;
    }

    public void setTotalGains(BigDecimal totalGains) {
        this.totalGains = totalGains;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getCnssSalaryAmount() {
        return cnssSalaryAmount;
    }

    public void setCnssSalaryAmount(BigDecimal cnssSalaryAmount) {
        this.cnssSalaryAmount = cnssSalaryAmount;
    }

    public BigDecimal getCavisAmount() {
        return cavisAmount;
    }

    public void setCavisAmount(BigDecimal cavisAmount) {
        this.cavisAmount = cavisAmount;
    }

    public BigDecimal getTaxableIncome() {
        return taxableIncome;
    }

    public void setTaxableIncome(BigDecimal taxableIncome) {
        this.taxableIncome = taxableIncome;
    }

    public BigDecimal getIrppAmount() {
        return irppAmount;
    }

    public void setIrppAmount(BigDecimal irppAmount) {
        this.irppAmount = irppAmount;
    }

    public BigDecimal getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(BigDecimal netSalary) {
        this.netSalary = netSalary;
    }

    public BigDecimal getEmployerCnss() {
        return employerCnss;
    }

    public void setEmployerCnss(BigDecimal employerCnss) {
        this.employerCnss = employerCnss;
    }

    public BigDecimal getEmployerCavis() {
        return employerCavis;
    }

    public void setEmployerCavis(BigDecimal employerCavis) {
        this.employerCavis = employerCavis;
    }

    public BigDecimal getTotalEmployerCost() {
        return totalEmployerCost;
    }

    public void setTotalEmployerCost(BigDecimal totalEmployerCost) {
        this.totalEmployerCost = totalEmployerCost;
    }

    public Integer getWorkedDays() {
        return workedDays;
    }

    public void setWorkedDays(Integer workedDays) {
        this.workedDays = workedDays;
    }

    public Integer getPaidLeaveDays() {
        return paidLeaveDays;
    }

    public void setPaidLeaveDays(Integer paidLeaveDays) {
        this.paidLeaveDays = paidLeaveDays;
    }

    public Integer getUnpaidDays() {
        return unpaidDays;
    }

    public void setUnpaidDays(Integer unpaidDays) {
        this.unpaidDays = unpaidDays;
    }

    public BigDecimal getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public PayrollStatus getStatus() {
        return status;
    }

    public void setStatus(PayrollStatus status) {
        this.status = status;
    }

    public String getPdfUrl() {
        return pdfUrl;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Instant getSentToEmployeeAt() {
        return sentToEmployeeAt;
    }

    public void setSentToEmployeeAt(Instant sentToEmployeeAt) {
        this.sentToEmployeeAt = sentToEmployeeAt;
    }

    public String getBankTransferRef() {
        return bankTransferRef;
    }

    public void setBankTransferRef(String bankTransferRef) {
        this.bankTransferRef = bankTransferRef;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public PayrollPeriodDTO getPayrollPeriod() {
        return payrollPeriod;
    }

    public void setPayrollPeriod(PayrollPeriodDTO payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
    }

    public ContractDTO getContract() {
        return contract;
    }

    public void setContract(ContractDTO contract) {
        this.contract = contract;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PaySlipDTO)) {
            return false;
        }

        PaySlipDTO paySlipDTO = (PaySlipDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, paySlipDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PaySlipDTO{" +
            "id=" + getId() +
            ", month=" + getMonth() +
            ", year=" + getYear() +
            ", baseSalary=" + getBaseSalary() +
            ", totalGains=" + getTotalGains() +
            ", totalDeductions=" + getTotalDeductions() +
            ", grossSalary=" + getGrossSalary() +
            ", cnssSalaryAmount=" + getCnssSalaryAmount() +
            ", cavisAmount=" + getCavisAmount() +
            ", taxableIncome=" + getTaxableIncome() +
            ", irppAmount=" + getIrppAmount() +
            ", netSalary=" + getNetSalary() +
            ", employerCnss=" + getEmployerCnss() +
            ", employerCavis=" + getEmployerCavis() +
            ", totalEmployerCost=" + getTotalEmployerCost() +
            ", workedDays=" + getWorkedDays() +
            ", paidLeaveDays=" + getPaidLeaveDays() +
            ", unpaidDays=" + getUnpaidDays() +
            ", overtimeHours=" + getOvertimeHours() +
            ", status='" + getStatus() + "'" +
            ", pdfUrl='" + getPdfUrl() + "'" +
            ", generatedAt='" + getGeneratedAt() + "'" +
            ", sentToEmployeeAt='" + getSentToEmployeeAt() + "'" +
            ", bankTransferRef='" + getBankTransferRef() + "'" +
            ", employee=" + getEmployee() +
            ", payrollPeriod=" + getPayrollPeriod() +
            ", contract=" + getContract() +
            "}";
    }
}
