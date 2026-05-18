package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

/**
 * Une avance sur salaire demandée par un employé.
 */
@Entity
@Table(name = "advance")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Advance implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "request_date", nullable = false)
    private LocalDate requestDate;

    @NotNull
    @Column(name = "amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal amount;

    @jakarta.persistence.Transient
    private String reason;

    @Min(value = 1)
    @Max(value = 12)
    @Column(name = "deduction_month")
    private Integer deductionMonth;

    @Column(name = "deduction_year")
    private Integer deductionYear;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AdvanceStatus status;

    @Size(max = 100)
    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "employee", "payrollPeriod", "contract" }, allowSetters = true)
    private PaySlip paySlip;

    // ── Getters / Setters Standard ──────────────────────────────────

    public Long getId() {
        return this.id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Advance id(Long id) {
        this.id = id;
        return this;
    }

    public LocalDate getRequestDate() {
        return this.requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public Advance requestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
        return this;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Advance amount(BigDecimal amount) {
        this.amount = amount;
        return this;
    }

    public String getReason() {
        return this.reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Advance reason(String reason) {
        this.reason = reason;
        return this;
    }

    public Integer getDeductionMonth() {
        return this.deductionMonth;
    }

    public void setDeductionMonth(Integer deductionMonth) {
        this.deductionMonth = deductionMonth;
    }

    public Advance deductionMonth(Integer deductionMonth) {
        this.deductionMonth = deductionMonth;
        return this;
    }

    public Integer getDeductionYear() {
        return this.deductionYear;
    }

    public void setDeductionYear(Integer deductionYear) {
        this.deductionYear = deductionYear;
    }

    public Advance deductionYear(Integer deductionYear) {
        this.deductionYear = deductionYear;
        return this;
    }

    public AdvanceStatus getStatus() {
        return this.status;
    }

    public void setStatus(AdvanceStatus status) {
        this.status = status;
    }

    public Advance status(AdvanceStatus status) {
        this.status = status;
        return this;
    }

    public String getApprovedBy() {
        return this.approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public Advance approvedBy(String approvedBy) {
        this.approvedBy = approvedBy;
        return this;
    }

    public Instant getApprovedAt() {
        return this.approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public Advance approvedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
        return this;
    }

    public String getNotes() {
        return this.notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Advance notes(String notes) {
        this.notes = notes;
        return this;
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

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Advance employee(Employee employee) {
        this.employee = employee;
        return this;
    }

    public PaySlip getPaySlip() {
        return this.paySlip;
    }

    public void setPaySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
    }

    public Advance paySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
        return this;
    }

    // ── Overrides ──────────────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Advance)) return false;
        return getId() != null && getId().equals(((Advance) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return (
            "Advance{" +
            "id=" +
            getId() +
            ", requestDate='" +
            getRequestDate() +
            "'" +
            ", amount=" +
            getAmount() +
            ", status='" +
            getStatus() +
            "'" +
            ", approvedBy='" +
            getApprovedBy() +
            "'" +
            "}"
        );
    }

    @Deprecated
    public Object getApprovedByUser() {
        return null;
    }

    @Deprecated
    public void setApprovedByUser(Object userProfile) {}

    @Deprecated
    public Advance approvedByUser(Object userProfile) {
        return this;
    }
}
