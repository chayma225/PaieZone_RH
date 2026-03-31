package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

/**
 * Bulletin de paie
 */
@Entity
@Table(name = "pay_slip")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaySlip implements Serializable {

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
    @Column(name = "base_salary", precision = 21, scale = 2, nullable = false)
    private BigDecimal baseSalary;

    @NotNull
    @Column(name = "total_gains", precision = 21, scale = 2, nullable = false)
    private BigDecimal totalGains;

    @NotNull
    @Column(name = "total_deductions", precision = 21, scale = 2, nullable = false)
    private BigDecimal totalDeductions;

    @NotNull
    @Column(name = "gross_salary", precision = 21, scale = 2, nullable = false)
    private BigDecimal grossSalary;

    @NotNull
    @Column(name = "cnss_salary_amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal cnssSalaryAmount;

    @Column(name = "cavis_amount", precision = 21, scale = 2)
    private BigDecimal cavisAmount;

    @NotNull
    @Column(name = "taxable_income", precision = 21, scale = 2, nullable = false)
    private BigDecimal taxableIncome;

    @NotNull
    @Column(name = "irpp_amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal irppAmount;

    @NotNull
    @Column(name = "net_salary", precision = 21, scale = 2, nullable = false)
    private BigDecimal netSalary;

    @NotNull
    @Column(name = "employer_cnss", precision = 21, scale = 2, nullable = false)
    private BigDecimal employerCnss;

    @Column(name = "employer_cavis", precision = 21, scale = 2)
    private BigDecimal employerCavis;

    @NotNull
    @Column(name = "total_employer_cost", precision = 21, scale = 2, nullable = false)
    private BigDecimal totalEmployerCost;

    @Column(name = "worked_days")
    private Integer workedDays;

    @Column(name = "paid_leave_days")
    private Integer paidLeaveDays;

    @Column(name = "unpaid_days")
    private Integer unpaidDays;

    @Column(name = "overtime_hours", precision = 21, scale = 2)
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

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PaySlip id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMonth() {
        return this.month;
    }

    public PaySlip month(Integer month) {
        this.setMonth(month);
        return this;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return this.year;
    }

    public PaySlip year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getBaseSalary() {
        return this.baseSalary;
    }

    public PaySlip baseSalary(BigDecimal baseSalary) {
        this.setBaseSalary(baseSalary);
        return this;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public BigDecimal getTotalGains() {
        return this.totalGains;
    }

    public PaySlip totalGains(BigDecimal totalGains) {
        this.setTotalGains(totalGains);
        return this;
    }

    public void setTotalGains(BigDecimal totalGains) {
        this.totalGains = totalGains;
    }

    public BigDecimal getTotalDeductions() {
        return this.totalDeductions;
    }

    public PaySlip totalDeductions(BigDecimal totalDeductions) {
        this.setTotalDeductions(totalDeductions);
        return this;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getGrossSalary() {
        return this.grossSalary;
    }

    public PaySlip grossSalary(BigDecimal grossSalary) {
        this.setGrossSalary(grossSalary);
        return this;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getCnssSalaryAmount() {
        return this.cnssSalaryAmount;
    }

    public PaySlip cnssSalaryAmount(BigDecimal cnssSalaryAmount) {
        this.setCnssSalaryAmount(cnssSalaryAmount);
        return this;
    }

    public void setCnssSalaryAmount(BigDecimal cnssSalaryAmount) {
        this.cnssSalaryAmount = cnssSalaryAmount;
    }

    public BigDecimal getCavisAmount() {
        return this.cavisAmount;
    }

    public PaySlip cavisAmount(BigDecimal cavisAmount) {
        this.setCavisAmount(cavisAmount);
        return this;
    }

    public void setCavisAmount(BigDecimal cavisAmount) {
        this.cavisAmount = cavisAmount;
    }

    public BigDecimal getTaxableIncome() {
        return this.taxableIncome;
    }

    public PaySlip taxableIncome(BigDecimal taxableIncome) {
        this.setTaxableIncome(taxableIncome);
        return this;
    }

    public void setTaxableIncome(BigDecimal taxableIncome) {
        this.taxableIncome = taxableIncome;
    }

    public BigDecimal getIrppAmount() {
        return this.irppAmount;
    }

    public PaySlip irppAmount(BigDecimal irppAmount) {
        this.setIrppAmount(irppAmount);
        return this;
    }

    public void setIrppAmount(BigDecimal irppAmount) {
        this.irppAmount = irppAmount;
    }

    public BigDecimal getNetSalary() {
        return this.netSalary;
    }

    public PaySlip netSalary(BigDecimal netSalary) {
        this.setNetSalary(netSalary);
        return this;
    }

    public void setNetSalary(BigDecimal netSalary) {
        this.netSalary = netSalary;
    }

    public BigDecimal getEmployerCnss() {
        return this.employerCnss;
    }

    public PaySlip employerCnss(BigDecimal employerCnss) {
        this.setEmployerCnss(employerCnss);
        return this;
    }

    public void setEmployerCnss(BigDecimal employerCnss) {
        this.employerCnss = employerCnss;
    }

    public BigDecimal getEmployerCavis() {
        return this.employerCavis;
    }

    public PaySlip employerCavis(BigDecimal employerCavis) {
        this.setEmployerCavis(employerCavis);
        return this;
    }

    public void setEmployerCavis(BigDecimal employerCavis) {
        this.employerCavis = employerCavis;
    }

    public BigDecimal getTotalEmployerCost() {
        return this.totalEmployerCost;
    }

    public PaySlip totalEmployerCost(BigDecimal totalEmployerCost) {
        this.setTotalEmployerCost(totalEmployerCost);
        return this;
    }

    public void setTotalEmployerCost(BigDecimal totalEmployerCost) {
        this.totalEmployerCost = totalEmployerCost;
    }

    public Integer getWorkedDays() {
        return this.workedDays;
    }

    public PaySlip workedDays(Integer workedDays) {
        this.setWorkedDays(workedDays);
        return this;
    }

    public void setWorkedDays(Integer workedDays) {
        this.workedDays = workedDays;
    }

    public Integer getPaidLeaveDays() {
        return this.paidLeaveDays;
    }

    public PaySlip paidLeaveDays(Integer paidLeaveDays) {
        this.setPaidLeaveDays(paidLeaveDays);
        return this;
    }

    public void setPaidLeaveDays(Integer paidLeaveDays) {
        this.paidLeaveDays = paidLeaveDays;
    }

    public Integer getUnpaidDays() {
        return this.unpaidDays;
    }

    public PaySlip unpaidDays(Integer unpaidDays) {
        this.setUnpaidDays(unpaidDays);
        return this;
    }

    public void setUnpaidDays(Integer unpaidDays) {
        this.unpaidDays = unpaidDays;
    }

    public BigDecimal getOvertimeHours() {
        return this.overtimeHours;
    }

    public PaySlip overtimeHours(BigDecimal overtimeHours) {
        this.setOvertimeHours(overtimeHours);
        return this;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public PayrollStatus getStatus() {
        return this.status;
    }

    public PaySlip status(PayrollStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(PayrollStatus status) {
        this.status = status;
    }

    public String getPdfUrl() {
        return this.pdfUrl;
    }

    public PaySlip pdfUrl(String pdfUrl) {
        this.setPdfUrl(pdfUrl);
        return this;
    }

    public void setPdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public Instant getGeneratedAt() {
        return this.generatedAt;
    }

    public PaySlip generatedAt(Instant generatedAt) {
        this.setGeneratedAt(generatedAt);
        return this;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Instant getSentToEmployeeAt() {
        return this.sentToEmployeeAt;
    }

    public PaySlip sentToEmployeeAt(Instant sentToEmployeeAt) {
        this.setSentToEmployeeAt(sentToEmployeeAt);
        return this;
    }

    public void setSentToEmployeeAt(Instant sentToEmployeeAt) {
        this.sentToEmployeeAt = sentToEmployeeAt;
    }

    public String getBankTransferRef() {
        return this.bankTransferRef;
    }

    public PaySlip bankTransferRef(String bankTransferRef) {
        this.setBankTransferRef(bankTransferRef);
        return this;
    }

    public void setBankTransferRef(String bankTransferRef) {
        this.bankTransferRef = bankTransferRef;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public PaySlip employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public PayrollPeriod getPayrollPeriod() {
        return this.payrollPeriod;
    }

    public void setPayrollPeriod(PayrollPeriod payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
    }

    public PaySlip payrollPeriod(PayrollPeriod payrollPeriod) {
        this.setPayrollPeriod(payrollPeriod);
        return this;
    }

    public Contract getContract() {
        return this.contract;
    }

    public void setContract(Contract contract) {
        this.contract = contract;
    }

    public PaySlip contract(Contract contract) {
        this.setContract(contract);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PaySlip)) {
            return false;
        }
        return getId() != null && getId().equals(((PaySlip) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PaySlip{" +
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
            "}";
    }
}
