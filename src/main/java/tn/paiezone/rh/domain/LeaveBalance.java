package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Solde de congés par employé et par type
 */
@Entity
@Table(name = "leave_balance")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveBalance implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Column(name = "entitled", precision = 21, scale = 2, nullable = false)
    private BigDecimal entitled;

    @NotNull
    @Column(name = "taken", precision = 21, scale = 2, nullable = false)
    private BigDecimal taken;

    @NotNull
    @Column(name = "pending", precision = 21, scale = 2, nullable = false)
    private BigDecimal pending;

    @NotNull
    @Column(name = "carry_over", precision = 21, scale = 2, nullable = false)
    private BigDecimal carryOver;

    @NotNull
    @Column(name = "remaining", precision = 21, scale = 2, nullable = false)
    private BigDecimal remaining;

    @NotNull
    @Column(name = "last_updated_at", nullable = false)
    private Instant lastUpdatedAt;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private LeaveType leaveType;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LeaveBalance id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return this.year;
    }

    public LeaveBalance year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getEntitled() {
        return this.entitled;
    }

    public LeaveBalance entitled(BigDecimal entitled) {
        this.setEntitled(entitled);
        return this;
    }

    public void setEntitled(BigDecimal entitled) {
        this.entitled = entitled;
    }

    public BigDecimal getTaken() {
        return this.taken;
    }

    public LeaveBalance taken(BigDecimal taken) {
        this.setTaken(taken);
        return this;
    }

    public void setTaken(BigDecimal taken) {
        this.taken = taken;
    }

    public BigDecimal getPending() {
        return this.pending;
    }

    public LeaveBalance pending(BigDecimal pending) {
        this.setPending(pending);
        return this;
    }

    public void setPending(BigDecimal pending) {
        this.pending = pending;
    }

    public BigDecimal getCarryOver() {
        return this.carryOver;
    }

    public LeaveBalance carryOver(BigDecimal carryOver) {
        this.setCarryOver(carryOver);
        return this;
    }

    public void setCarryOver(BigDecimal carryOver) {
        this.carryOver = carryOver;
    }

    public BigDecimal getRemaining() {
        return this.remaining;
    }

    public LeaveBalance remaining(BigDecimal remaining) {
        this.setRemaining(remaining);
        return this;
    }

    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }

    public Instant getLastUpdatedAt() {
        return this.lastUpdatedAt;
    }

    public LeaveBalance lastUpdatedAt(Instant lastUpdatedAt) {
        this.setLastUpdatedAt(lastUpdatedAt);
        return this;
    }

    public void setLastUpdatedAt(Instant lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public LeaveBalance employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public LeaveType getLeaveType() {
        return this.leaveType;
    }

    public void setLeaveType(LeaveType leaveType) {
        this.leaveType = leaveType;
    }

    public LeaveBalance leaveType(LeaveType leaveType) {
        this.setLeaveType(leaveType);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LeaveBalance)) {
            return false;
        }
        return getId() != null && getId().equals(((LeaveBalance) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveBalance{" +
            "id=" + getId() +
            ", year=" + getYear() +
            ", entitled=" + getEntitled() +
            ", taken=" + getTaken() +
            ", pending=" + getPending() +
            ", carryOver=" + getCarryOver() +
            ", remaining=" + getRemaining() +
            ", lastUpdatedAt='" + getLastUpdatedAt() + "'" +
            "}";
    }
}
