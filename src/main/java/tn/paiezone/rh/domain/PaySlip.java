package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pay_slip")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaySlip implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Min(value = 1)
    @Max(value = 12)
    @Column(name = "month", nullable = false)
    private Integer month;

    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Column(name = "base_salary", precision = 21, scale = 3, nullable = false)
    private BigDecimal baseSalary;

    @NotNull
    @Column(name = "total_gains", precision = 21, scale = 3, nullable = false)
    private BigDecimal totalGains;

    @NotNull
    @Column(name = "total_deductions", precision = 21, scale = 3, nullable = false)
    private BigDecimal totalDeductions;

    @NotNull
    @Column(name = "gross_salary", precision = 21, scale = 3, nullable = false)
    private BigDecimal grossSalary;

    @NotNull
    @Column(name = "cnss_salary_amount", precision = 21, scale = 3, nullable = false)
    private BigDecimal cnssSalaryAmount;

    @Column(name = "cavis_amount", precision = 21, scale = 3)
    private BigDecimal cavisAmount;

    // ── NOUVEAU : CSS (Contribution Sociale de Solidarité 0,5%) ──
    @Column(name = "css_amount", precision = 21, scale = 3)
    private BigDecimal cssAmount;

    @NotNull
    @Column(name = "taxable_income", precision = 21, scale = 3, nullable = false)
    private BigDecimal taxableIncome;

    @NotNull
    @Column(name = "irpp_amount", precision = 21, scale = 3, nullable = false)
    private BigDecimal irppAmount;

    @NotNull
    @Column(name = "net_salary", precision = 21, scale = 3, nullable = false)
    private BigDecimal netSalary;

    @NotNull
    @Column(name = "employer_cnss", precision = 21, scale = 3, nullable = false)
    private BigDecimal employerCnss;

    @Column(name = "employer_cavis", precision = 21, scale = 3)
    private BigDecimal employerCavis;

    // ── NOUVEAU : TFP — charge patronale (1%) ────────────────────
    @Column(name = "tfp_amount", precision = 21, scale = 3)
    private BigDecimal tfpAmount;

    @NotNull
    @Column(name = "total_employer_cost", precision = 21, scale = 3, nullable = false)
    private BigDecimal totalEmployerCost;

    @Column(name = "bonus_total", precision = 21, scale = 3)
    private BigDecimal bonusTotal;

    @Column(name = "advance_deduction", precision = 21, scale = 3)
    private BigDecimal advanceDeduction;

    // ── NOUVEAU : Montant déduit pour congés non payés ───────────
    @Column(name = "unpaid_leave_deduction", precision = 21, scale = 3)
    private BigDecimal unpaidLeaveDeduction;

    // ── NOUVEAU : Montant total des heures supplémentaires ────────
    @Column(name = "overtime_amount", precision = 21, scale = 3)
    private BigDecimal overtimeAmount;

    @Column(name = "worked_days")
    private Integer workedDays;

    @Column(name = "paid_leave_days")
    private Integer paidLeaveDays;

    @Column(name = "unpaid_days")
    private Integer unpaidDays;

    @Column(name = "overtime_hours", precision = 21, scale = 3)
    private BigDecimal overtimeHours;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PayrollStatus status;

    @Size(max = 500)
    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "generated_at")
    private Instant generatedAt;

    @Column(name = "sent_to_employee_at")
    private Instant sentToEmployeeAt;

    @Size(max = 100)
    @Column(name = "bank_transfer_ref", length = 100)
    private String bankTransferRef;

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

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "createdBy" }, allowSetters = true)
    private PayrollPeriod payrollPeriod;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "employee", "createdBy" }, allowSetters = true)
    private Contract contract;

    // ── Getters / Setters ─────────────────────────────────────────

    public Long getId() { return id; }
    public PaySlip id(Long id) { this.id = id; return this; }
    public void setId(Long id) { this.id = id; }

    public Integer getMonth() { return month; }
    public PaySlip month(Integer month) { this.month = month; return this; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return year; }
    public PaySlip year(Integer year) { this.year = year; return this; }
    public void setYear(Integer year) { this.year = year; }

    public BigDecimal getBaseSalary() { return baseSalary; }
    public PaySlip baseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; return this; }
    public void setBaseSalary(BigDecimal baseSalary) { this.baseSalary = baseSalary; }

    public BigDecimal getTotalGains() { return totalGains; }
    public PaySlip totalGains(BigDecimal totalGains) { this.totalGains = totalGains; return this; }
    public void setTotalGains(BigDecimal totalGains) { this.totalGains = totalGains; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public PaySlip totalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; return this; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public PaySlip grossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; return this; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getCnssSalaryAmount() { return cnssSalaryAmount; }
    public PaySlip cnssSalaryAmount(BigDecimal cnssSalaryAmount) { this.cnssSalaryAmount = cnssSalaryAmount; return this; }
    public void setCnssSalaryAmount(BigDecimal cnssSalaryAmount) { this.cnssSalaryAmount = cnssSalaryAmount; }

    public BigDecimal getCavisAmount() { return cavisAmount; }
    public PaySlip cavisAmount(BigDecimal cavisAmount) { this.cavisAmount = cavisAmount; return this; }
    public void setCavisAmount(BigDecimal cavisAmount) { this.cavisAmount = cavisAmount; }

    public BigDecimal getCssAmount() { return cssAmount; }
    public PaySlip cssAmount(BigDecimal cssAmount) { this.cssAmount = cssAmount; return this; }
    public void setCssAmount(BigDecimal cssAmount) { this.cssAmount = cssAmount; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public PaySlip taxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; return this; }
    public void setTaxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; }

    public BigDecimal getIrppAmount() { return irppAmount; }
    public PaySlip irppAmount(BigDecimal irppAmount) { this.irppAmount = irppAmount; return this; }
    public void setIrppAmount(BigDecimal irppAmount) { this.irppAmount = irppAmount; }

    public BigDecimal getNetSalary() { return netSalary; }
    public PaySlip netSalary(BigDecimal netSalary) { this.netSalary = netSalary; return this; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }

    public BigDecimal getEmployerCnss() { return employerCnss; }
    public PaySlip employerCnss(BigDecimal employerCnss) { this.employerCnss = employerCnss; return this; }
    public void setEmployerCnss(BigDecimal employerCnss) { this.employerCnss = employerCnss; }

    public BigDecimal getEmployerCavis() { return employerCavis; }
    public PaySlip employerCavis(BigDecimal employerCavis) { this.employerCavis = employerCavis; return this; }
    public void setEmployerCavis(BigDecimal employerCavis) { this.employerCavis = employerCavis; }

    public BigDecimal getTfpAmount() { return tfpAmount; }
    public PaySlip tfpAmount(BigDecimal tfpAmount) { this.tfpAmount = tfpAmount; return this; }
    public void setTfpAmount(BigDecimal tfpAmount) { this.tfpAmount = tfpAmount; }

    public BigDecimal getTotalEmployerCost() { return totalEmployerCost; }
    public PaySlip totalEmployerCost(BigDecimal totalEmployerCost) { this.totalEmployerCost = totalEmployerCost; return this; }
    public void setTotalEmployerCost(BigDecimal totalEmployerCost) { this.totalEmployerCost = totalEmployerCost; }

    public BigDecimal getBonusTotal() { return bonusTotal; }
    public PaySlip bonusTotal(BigDecimal bonusTotal) { this.bonusTotal = bonusTotal; return this; }
    public void setBonusTotal(BigDecimal bonusTotal) { this.bonusTotal = bonusTotal; }

    public BigDecimal getAdvanceDeduction() { return advanceDeduction; }
    public PaySlip advanceDeduction(BigDecimal advanceDeduction) { this.advanceDeduction = advanceDeduction; return this; }
    public void setAdvanceDeduction(BigDecimal advanceDeduction) { this.advanceDeduction = advanceDeduction; }

    public BigDecimal getUnpaidLeaveDeduction() { return unpaidLeaveDeduction; }
    public PaySlip unpaidLeaveDeduction(BigDecimal unpaidLeaveDeduction) { this.unpaidLeaveDeduction = unpaidLeaveDeduction; return this; }
    public void setUnpaidLeaveDeduction(BigDecimal unpaidLeaveDeduction) { this.unpaidLeaveDeduction = unpaidLeaveDeduction; }

    public BigDecimal getOvertimeAmount() { return overtimeAmount; }
    public PaySlip overtimeAmount(BigDecimal overtimeAmount) { this.overtimeAmount = overtimeAmount; return this; }
    public void setOvertimeAmount(BigDecimal overtimeAmount) { this.overtimeAmount = overtimeAmount; }

    public Integer getWorkedDays() { return workedDays; }
    public PaySlip workedDays(Integer workedDays) { this.workedDays = workedDays; return this; }
    public void setWorkedDays(Integer workedDays) { this.workedDays = workedDays; }

    public Integer getPaidLeaveDays() { return paidLeaveDays; }
    public PaySlip paidLeaveDays(Integer paidLeaveDays) { this.paidLeaveDays = paidLeaveDays; return this; }
    public void setPaidLeaveDays(Integer paidLeaveDays) { this.paidLeaveDays = paidLeaveDays; }

    public Integer getUnpaidDays() { return unpaidDays; }
    public PaySlip unpaidDays(Integer unpaidDays) { this.unpaidDays = unpaidDays; return this; }
    public void setUnpaidDays(Integer unpaidDays) { this.unpaidDays = unpaidDays; }

    public BigDecimal getOvertimeHours() { return overtimeHours; }
    public PaySlip overtimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; return this; }
    public void setOvertimeHours(BigDecimal overtimeHours) { this.overtimeHours = overtimeHours; }

    public PayrollStatus getStatus() { return status; }
    public PaySlip status(PayrollStatus status) { this.status = status; return this; }
    public void setStatus(PayrollStatus status) { this.status = status; }

    public String getPdfUrl() { return pdfUrl; }
    public PaySlip pdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; return this; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public Instant getGeneratedAt() { return generatedAt; }
    public PaySlip generatedAt(Instant generatedAt) { this.generatedAt = generatedAt; return this; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }

    public Instant getSentToEmployeeAt() { return sentToEmployeeAt; }
    public PaySlip sentToEmployeeAt(Instant sentToEmployeeAt) { this.sentToEmployeeAt = sentToEmployeeAt; return this; }
    public void setSentToEmployeeAt(Instant sentToEmployeeAt) { this.sentToEmployeeAt = sentToEmployeeAt; }

    public String getBankTransferRef() { return bankTransferRef; }
    public PaySlip bankTransferRef(String bankTransferRef) { this.bankTransferRef = bankTransferRef; return this; }
    public void setBankTransferRef(String bankTransferRef) { this.bankTransferRef = bankTransferRef; }

    public String getCreatedBy() { return createdBy; }
    public PaySlip createdBy(String createdBy) { this.createdBy = createdBy; return this; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedDate() { return createdDate; }
    public PaySlip createdDate(Instant createdDate) { this.createdDate = createdDate; return this; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public PaySlip lastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; return this; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public PaySlip lastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; return this; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public PaySlip employee(Employee employee) { this.employee = employee; return this; }

    public PayrollPeriod getPayrollPeriod() { return payrollPeriod; }
    public void setPayrollPeriod(PayrollPeriod payrollPeriod) { this.payrollPeriod = payrollPeriod; }
    public PaySlip payrollPeriod(PayrollPeriod payrollPeriod) { this.payrollPeriod = payrollPeriod; return this; }

    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
    public PaySlip contract(Contract contract) { this.contract = contract; return this; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaySlip)) return false;
        return getId() != null && getId().equals(((PaySlip) o).getId());
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "PaySlip{id=" + getId() + ", month=" + getMonth() + ", year=" + getYear() +
            ", baseSalary=" + getBaseSalary() + ", grossSalary=" + getGrossSalary() +
            ", cnssSalaryAmount=" + getCnssSalaryAmount() + ", cssAmount=" + getCssAmount() +
            ", irppAmount=" + getIrppAmount() + ", netSalary=" + getNetSalary() +
            ", tfpAmount=" + getTfpAmount() + ", status='" + getStatus() + "'}";
    }
}
