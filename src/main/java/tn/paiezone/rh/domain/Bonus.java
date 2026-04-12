package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.BonusType;

/**
 * A Bonus.
 */
@Entity
@Table(name = "bonus")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Bonus implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "bonus_type", nullable = false)
    private BonusType bonusType;

    @NotNull
    @Size(max = 150)
    @Column(name = "label", length = 150, nullable = false)
    private String label;

    @NotNull
    @Column(name = "amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotNull
    @Column(name = "taxable", nullable = false)
    private Boolean taxable;

    @NotNull
    @Min(value = 1)
    @Max(value = 12)
    @Column(name = "month", nullable = false)
    private Integer month;

    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

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

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Bonus id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BonusType getBonusType() {
        return this.bonusType;
    }

    public Bonus bonusType(BonusType bonusType) {
        this.setBonusType(bonusType);
        return this;
    }

    public void setBonusType(BonusType bonusType) {
        this.bonusType = bonusType;
    }

    public String getLabel() {
        return this.label;
    }

    public Bonus label(String label) {
        this.setLabel(label);
        return this;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public Bonus amount(BigDecimal amount) {
        this.setAmount(amount);
        return this;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Boolean getTaxable() {
        return this.taxable;
    }

    public Bonus taxable(Boolean taxable) {
        this.setTaxable(taxable);
        return this;
    }

    public void setTaxable(Boolean taxable) {
        this.taxable = taxable;
    }

    public Integer getMonth() {
        return this.month;
    }

    public Bonus month(Integer month) {
        this.setMonth(month);
        return this;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return this.year;
    }

    public Bonus year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getNotes() {
        return this.notes;
    }

    public Bonus notes(String notes) {
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

    public Bonus employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public PaySlip getPaySlip() {
        return this.paySlip;
    }

    public void setPaySlip(PaySlip paySlip) {
        this.paySlip = paySlip;
    }

    public Bonus paySlip(PaySlip paySlip) {
        this.setPaySlip(paySlip);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Bonus)) {
            return false;
        }
        return getId() != null && getId().equals(((Bonus) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Bonus{" +
            "id=" + getId() +
            ", bonusType='" + getBonusType() + "'" +
            ", label='" + getLabel() + "'" +
            ", amount=" + getAmount() +
            ", taxable='" + getTaxable() + "'" +
            ", month=" + getMonth() +
            ", year=" + getYear() +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
