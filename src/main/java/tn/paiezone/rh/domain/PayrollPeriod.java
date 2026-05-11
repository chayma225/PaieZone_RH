package tn.paiezone.rh.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(
    name = "payroll_period",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_period_company_month_year",
        columnNames = { "company_id", "month", "year" }
    )
)
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class PayrollPeriod implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Min(1) @Max(12)
    @Column(name = "month", nullable = false)
    private Integer month;

    @NotNull
    @Min(2000) @Max(2100)
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PayrollStatus status = PayrollStatus.DRAFT;

    @Column(name = "calculated_at")
    private Instant calculatedAt;

    @Column(name = "validated_at")
    private Instant validatedAt;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Size(max = 100)
    @Column(name = "closed_by", length = 100)
    private String closedBy;

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
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    // ── Getters / Setters + Fluent setters ──────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PayrollPeriod id(Long id) { this.id = id; return this; }

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public PayrollPeriod month(Integer month) { this.month = month; return this; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public PayrollPeriod year(Integer year) { this.year = year; return this; }

    public PayrollStatus getStatus() { return status; }
    public void setStatus(PayrollStatus status) { this.status = status; }
    public PayrollPeriod status(PayrollStatus status) { this.status = status; return this; }

    public Instant getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(Instant calculatedAt) { this.calculatedAt = calculatedAt; }
    public PayrollPeriod calculatedAt(Instant calculatedAt) { this.calculatedAt = calculatedAt; return this; }

    public Instant getValidatedAt() { return validatedAt; }
    public void setValidatedAt(Instant validatedAt) { this.validatedAt = validatedAt; }
    public PayrollPeriod validatedAt(Instant validatedAt) { this.validatedAt = validatedAt; return this; }

    public Instant getLockedAt() { return lockedAt; }
    public void setLockedAt(Instant lockedAt) { this.lockedAt = lockedAt; }
    public PayrollPeriod lockedAt(Instant lockedAt) { this.lockedAt = lockedAt; return this; }

    public String getClosedBy() { return closedBy; }
    public void setClosedBy(String closedBy) { this.closedBy = closedBy; }
    public PayrollPeriod closedBy(String closedBy) { this.closedBy = closedBy; return this; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public PayrollPeriod createdBy(String createdBy) { this.createdBy = createdBy; return this; }

    public Instant getCreatedDate() { return createdDate; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }
    public PayrollPeriod createdDate(Instant createdDate) { this.createdDate = createdDate; return this; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    public PayrollPeriod lastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; return this; }

    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }
    public PayrollPeriod lastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; return this; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public PayrollPeriod company(Company company) { this.company = company; return this; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PayrollPeriod)) return false;
        return getId() != null && getId().equals(((PayrollPeriod) o).getId());
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "PayrollPeriod{id=" + id + ", month=" + month
            + ", year=" + year + ", status=" + status + "}";
    }
}
