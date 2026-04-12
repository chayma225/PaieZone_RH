package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

/**
 * A Advance.
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

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "employee", "payrollPeriod", "contract" }, allowSetters = true)
    private PaySlip paySlip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile approvedByUser;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Advance id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getRequestDate() {
        return this.requestDate;
    }

    public Advance requestDate(LocalDate requestDate) {
        this.setRequestDate(requestDate);
        return this;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public Advance amount(BigDecimal amount) {
        this.setAmount(amount);
        return this;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getDeductionMonth() {
        return this.deductionMonth;
    }

    public Advance deductionMonth(Integer deductionMonth) {
        this.setDeductionMonth(deductionMonth);
        return this;
    }

    public void setDeductionMonth(Integer deductionMonth) {
        this.deductionMonth = deductionMonth;
    }

    public Integer getDeductionYear() {
        return this.deductionYear;
    }

    public Advance deductionYear(Integer deductionYear) {
        this.setDeductionYear(deductionYear);
        return this;
    }

    public void setDeductionYear(Integer deductionYear) {
        this.deductionYear = deductionYear;
    }

    public AdvanceStatus getStatus() {
        return this.status;
    }

    public Advance status(AdvanceStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(AdvanceStatus status) {
        this.status = status;
    }

    public String getApprovedBy() {
        return this.approvedBy;
    }

    public Advance approvedBy(String approvedBy) {
        this.setApprovedBy(approvedBy);
        return this;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public String getNotes() {
        return this.notes;
    }

    public Advance notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Advance employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public PaySlip getPaySlip() {
        return this.paySlip;
    }

    public void setPaySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
    }

    public Advance paySlip(PaySlip paySlip) {
        this.setPaySlip(paySlip);
        return this;
    }

    public UserProfile getApprovedByUser() {
        return this.approvedByUser;
    }

    public void setApprovedByUser(UserProfile userProfile) {
        this.approvedByUser = userProfile;
    }

    public Advance approvedByUser(UserProfile userProfile) {
        this.setApprovedByUser(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Advance)) {
            return false;
        }
        return getId() != null && getId().equals(((Advance) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Advance{" +
            "id=" + getId() +
            ", requestDate='" + getRequestDate() + "'" +
            ", amount=" + getAmount() +
            ", deductionMonth=" + getDeductionMonth() +
            ", deductionYear=" + getDeductionYear() +
            ", status='" + getStatus() + "'" +
            ", approvedBy='" + getApprovedBy() + "'" +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
