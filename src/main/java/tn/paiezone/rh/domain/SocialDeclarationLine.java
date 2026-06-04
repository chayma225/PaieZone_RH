package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Ligne détaillée par employé dans une déclaration sociale
 */
@Entity
@Table(name = "social_declaration_line")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SocialDeclarationLine implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Size(max = 50)
    @Column(name = "matricule", length = 50)
    private String matricule;

    @Size(max = 200)
    @Column(name = "employee_full_name", length = 200)
    private String employeeFullName;

    @Size(max = 50)
    @Column(name = "cnss_number", length = 50)
    private String cnssNumber;

    @Column(name = "gross_salary", precision = 21, scale = 3)
    private BigDecimal grossSalary;

    @Column(name = "ceiling_applied", precision = 21, scale = 3)
    private BigDecimal ceilingApplied;

    @Column(name = "employee_contrib", precision = 21, scale = 3)
    private BigDecimal employeeContrib;

    @Column(name = "employer_contrib", precision = 21, scale = 3)
    private BigDecimal employerContrib;

    @Column(name = "taxable_income", precision = 21, scale = 3)
    private BigDecimal taxableIncome;

    @Column(name = "irpp_amount", precision = 21, scale = 3)
    private BigDecimal irppAmount;

    @Column(name = "cavis_employee", precision = 21, scale = 3)
    private BigDecimal cavisEmployee;

    @Column(name = "cavis_employer", precision = 21, scale = 3)
    private BigDecimal cavisEmployer;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "lines" }, allowSetters = true)
    private SocialDeclaration socialDeclaration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "employee", "payrollPeriod", "contract" }, allowSetters = true)
    private PaySlip paySlip;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SocialDeclarationLine id(Long id) {
        this.id = id;
        return this;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public String getEmployeeFullName() {
        return employeeFullName;
    }

    public void setEmployeeFullName(String employeeFullName) {
        this.employeeFullName = employeeFullName;
    }

    public String getCnssNumber() {
        return cnssNumber;
    }

    public void setCnssNumber(String cnssNumber) {
        this.cnssNumber = cnssNumber;
    }

    public BigDecimal getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getCeilingApplied() {
        return ceilingApplied;
    }

    public void setCeilingApplied(BigDecimal ceilingApplied) {
        this.ceilingApplied = ceilingApplied;
    }

    public BigDecimal getEmployeeContrib() {
        return employeeContrib;
    }

    public void setEmployeeContrib(BigDecimal employeeContrib) {
        this.employeeContrib = employeeContrib;
    }

    public BigDecimal getEmployerContrib() {
        return employerContrib;
    }

    public void setEmployerContrib(BigDecimal employerContrib) {
        this.employerContrib = employerContrib;
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

    public BigDecimal getCavisEmployee() {
        return cavisEmployee;
    }

    public void setCavisEmployee(BigDecimal cavisEmployee) {
        this.cavisEmployee = cavisEmployee;
    }

    public BigDecimal getCavisEmployer() {
        return cavisEmployer;
    }

    public void setCavisEmployer(BigDecimal cavisEmployer) {
        this.cavisEmployer = cavisEmployer;
    }

    public SocialDeclaration getSocialDeclaration() {
        return socialDeclaration;
    }

    public void setSocialDeclaration(SocialDeclaration socialDeclaration) {
        this.socialDeclaration = socialDeclaration;
    }

    public SocialDeclarationLine socialDeclaration(SocialDeclaration socialDeclaration) {
        this.socialDeclaration = socialDeclaration;
        return this;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public SocialDeclarationLine employee(Employee employee) {
        this.employee = employee;
        return this;
    }

    public PaySlip getPaySlip() {
        return paySlip;
    }

    public void setPaySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
    }

    public SocialDeclarationLine paySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SocialDeclarationLine)) return false;
        return id != null && id.equals(((SocialDeclarationLine) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "SocialDeclarationLine{id=" + id + ", matricule='" + matricule + "', grossSalary=" + grossSalary + "}";
    }
}
