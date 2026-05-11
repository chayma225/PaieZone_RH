package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

public class PaySlipDTO implements Serializable {

    private Long id;

    @NotNull @Min(1) @Max(12)
    private Integer month;

    @NotNull
    private Integer year;

    @NotNull private BigDecimal baseSalary;
    @NotNull private BigDecimal totalGains;
    @NotNull private BigDecimal totalDeductions;
    @NotNull private BigDecimal grossSalary;
    @NotNull private BigDecimal cnssSalaryAmount;

    private BigDecimal cavisAmount;

    /** NOUVEAU — CSS (Contribution Sociale de Solidarité 0,5%) */
    private BigDecimal cssAmount;

    @NotNull private BigDecimal taxableIncome;
    @NotNull private BigDecimal irppAmount;
    @NotNull private BigDecimal netSalary;
    @NotNull private BigDecimal employerCnss;

    private BigDecimal employerCavis;

    /** NOUVEAU — TFP charge patronale (1%) */
    private BigDecimal tfpAmount;

    @NotNull private BigDecimal totalEmployerCost;

    private BigDecimal bonusTotal;
    private BigDecimal advanceDeduction;

    /** NOUVEAU — Montant déduit pour congés non payés */
    private BigDecimal unpaidLeaveDeduction;

    /** NOUVEAU — Montant total des heures supplémentaires */
    private BigDecimal overtimeAmount;

    private Integer workedDays;
    private Integer paidLeaveDays;
    private Integer unpaidDays;
    private BigDecimal overtimeHours;

    @NotNull
    private PayrollStatus status;

    @Size(max = 500) private String pdfUrl;
    private Instant generatedAt;
    private Instant sentToEmployeeAt;
    @Size(max = 100) private String bankTransferRef;

    private Long employeeId;
    private Long payrollPeriodId;
    private Long contractId;

    // ── Getters / Setters ──────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public BigDecimal getTotalGains() { return totalGains; }
    public void setTotalGains(BigDecimal totalGains) { this.totalGains = totalGains; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getCnssSalaryAmount() { return cnssSalaryAmount; }
    public void setCnssSalaryAmount(BigDecimal cnssSalaryAmount) { this.cnssSalaryAmount = cnssSalaryAmount; }

    public BigDecimal getCavisAmount() { return cavisAmount; }
    public void setCavisAmount(BigDecimal cavisAmount) { this.cavisAmount = cavisAmount; }

    public BigDecimal getCssAmount() { return cssAmount; }
    public void setCssAmount(BigDecimal cssAmount) { this.cssAmount = cssAmount; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public void setTaxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; }

    public BigDecimal getIrppAmount() { return irppAmount; }
    public void setIrppAmount(BigDecimal irppAmount) { this.irppAmount = irppAmount; }

    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public BigDecimal getEmployerCnss() { return employerCnss; }
    public void setEmployerCnss(BigDecimal employerCnss) { this.employerCnss = employerCnss; }

    public BigDecimal getEmployerCavis() { return employerCavis; }
    public void setEmployerCavis(BigDecimal employerCavis) { this.employerCavis = employerCavis; }

    public BigDecimal getTfpAmount() { return tfpAmount; }
    public void setTfpAmount(BigDecimal tfpAmount) { this.tfpAmount = tfpAmount; }

    public BigDecimal getTotalEmployerCost() { return totalEmployerCost; }
    public void setTotalEmployerCost(BigDecimal totalEmployerCost) { this.totalEmployerCost = totalEmployerCost; }

    public BigDecimal getBonusTotal() { return bonusTotal; }
    public void setBonusTotal(BigDecimal bonusTotal) { this.bonusTotal = bonusTotal; }

    public BigDecimal getAdvanceDeduction() { return advanceDeduction; }
    public void setAdvanceDeduction(BigDecimal advanceDeduction) { this.advanceDeduction = advanceDeduction; }

    public BigDecimal getUnpaidLeaveDeduction() { return unpaidLeaveDeduction; }
    public void setUnpaidLeaveDeduction(BigDecimal unpaidLeaveDeduction) { this.unpaidLeaveDeduction = unpaidLeaveDeduction; }

    public BigDecimal getOvertimeAmount() { return overtimeAmount; }
    public void setOvertimeAmount(BigDecimal overtimeAmount) { this.overtimeAmount = overtimeAmount; }

    public Integer getWorkedDays() { return workedDays; }
    public void setWorkedDays(Integer workedDays) { this.workedDays = workedDays; }

    public Integer getPaidLeaveDays() { return paidLeaveDays; }
    public void setPaidLeaveDays(Integer paidLeaveDays) { this.paidLeaveDays = paidLeaveDays; }

    public Integer getUnpaidDays() { return unpaidDays; }
    public void setUnpaidDays(Integer unpaidDays) { this.unpaidDays = unpaidDays; }

    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

    public PayrollStatus getStatus() { return status; }
    public void setStatus(PayrollStatus status) { this.status = status; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public Instant getSentToEmployeeAt() { return sentToEmployeeAt; }
    public void setSentToEmployeeAt(Instant sentToEmployeeAt) { this.sentToEmployeeAt = sentToEmployeeAt; }

    public String getBankTransferRef() { return bankTransferRef; }
    public void setBankTransferRef(String bankTransferRef) { this.bankTransferRef = bankTransferRef; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getPayrollPeriodId() { return payrollPeriodId; }
    public void setPayrollPeriodId(Long payrollPeriodId) { this.payrollPeriodId = payrollPeriodId; }

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaySlipDTO)) return false;
        return Objects.equals(id, ((PaySlipDTO) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "PaySlipDTO{id=" + id + ", month=" + month + ", year=" + year +
            ", netSalary=" + netSalary + ", cssAmount=" + cssAmount +
            ", tfpAmount=" + tfpAmount + ", status=" + status + "}";
    }
}
