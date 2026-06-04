package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.DeclarationStatus;
import tn.paiezone.rh.domain.enumeration.DeclarationType;

/**
 * Déclaration sociale périodique (CNSS salarié/employeur, CAVIS, IRPP)
 */
@Entity
@Table(
    name = "social_declaration",
    uniqueConstraints = @UniqueConstraint(columnNames = { "company_id", "declaration_type", "month", "year" })
)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class SocialDeclaration implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "declaration_type", nullable = false)
    private DeclarationType declarationType;

    @NotNull
    @Min(1)
    @Max(12)
    @Column(name = "month", nullable = false)
    private Integer month;

    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeclarationStatus status;

    @Column(name = "total_employees_count")
    private Integer totalEmployeesCount;

    @Column(name = "total_gross_amount", precision = 21, scale = 3)
    private BigDecimal totalGrossAmount;

    @Column(name = "total_employee_contrib", precision = 21, scale = 3)
    private BigDecimal totalEmployeeContrib;

    @Column(name = "total_employer_contrib", precision = 21, scale = 3)
    private BigDecimal totalEmployerContrib;

    @Column(name = "total_tax_amount", precision = 21, scale = 3)
    private BigDecimal totalTaxAmount;

    @Column(name = "generated_at")
    private Instant generatedAt;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Size(max = 100)
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Size(max = 500)
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @Size(max = 50)
    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "created_date")
    private Instant createdDate;

    @Size(max = 50)
    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    @Column(name = "last_modified_date")
    private Instant lastModifiedDate;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private PayrollPeriod payrollPeriod;

    @OneToMany(mappedBy = "socialDeclaration", cascade = CascadeType.ALL, orphanRemoval = true)
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "socialDeclaration" }, allowSetters = true)
    private List<SocialDeclarationLine> lines = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SocialDeclaration id(Long id) {
        this.id = id;
        return this;
    }

    public DeclarationType getDeclarationType() {
        return declarationType;
    }

    public void setDeclarationType(DeclarationType declarationType) {
        this.declarationType = declarationType;
    }

    public SocialDeclaration declarationType(DeclarationType declarationType) {
        this.declarationType = declarationType;
        return this;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public SocialDeclaration month(Integer month) {
        this.month = month;
        return this;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public SocialDeclaration year(Integer year) {
        this.year = year;
        return this;
    }

    public DeclarationStatus getStatus() {
        return status;
    }

    public void setStatus(DeclarationStatus status) {
        this.status = status;
    }

    public SocialDeclaration status(DeclarationStatus status) {
        this.status = status;
        return this;
    }

    public Integer getTotalEmployeesCount() {
        return totalEmployeesCount;
    }

    public void setTotalEmployeesCount(Integer totalEmployeesCount) {
        this.totalEmployeesCount = totalEmployeesCount;
    }

    public BigDecimal getTotalGrossAmount() {
        return totalGrossAmount;
    }

    public void setTotalGrossAmount(BigDecimal totalGrossAmount) {
        this.totalGrossAmount = totalGrossAmount;
    }

    public BigDecimal getTotalEmployeeContrib() {
        return totalEmployeeContrib;
    }

    public void setTotalEmployeeContrib(BigDecimal totalEmployeeContrib) {
        this.totalEmployeeContrib = totalEmployeeContrib;
    }

    public BigDecimal getTotalEmployerContrib() {
        return totalEmployerContrib;
    }

    public void setTotalEmployerContrib(BigDecimal totalEmployerContrib) {
        this.totalEmployerContrib = totalEmployerContrib;
    }

    public BigDecimal getTotalTaxAmount() {
        return totalTaxAmount;
    }

    public void setTotalTaxAmount(BigDecimal totalTaxAmount) {
        this.totalTaxAmount = totalTaxAmount;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Instant getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(Instant submittedAt) {
        this.submittedAt = submittedAt;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public SocialDeclaration company(Company company) {
        this.company = company;
        return this;
    }

    public PayrollPeriod getPayrollPeriod() {
        return payrollPeriod;
    }

    public void setPayrollPeriod(PayrollPeriod payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
    }

    public SocialDeclaration payrollPeriod(PayrollPeriod payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
        return this;
    }

    public List<SocialDeclarationLine> getLines() {
        return lines;
    }

    public void setLines(List<SocialDeclarationLine> lines) {
        this.lines = lines;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SocialDeclaration)) return false;
        return id != null && id.equals(((SocialDeclaration) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "SocialDeclaration{id=" + id + ", type=" + declarationType + ", month=" + month + ", year=" + year + ", status=" + status + "}"
        );
    }
}
