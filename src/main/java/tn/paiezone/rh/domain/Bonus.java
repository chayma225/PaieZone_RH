package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.BonusType;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

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

    // ✅ Ajouté via 13_add_missing_entity_columns.xml (nullable car ajouté après coup)
    @Enumerated(EnumType.STRING)
    @Column(name = "bonus_type")
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

    // ✅ Champs audit présents dans votre DDL
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

    // ✅ pay_slip_id présent dans votre DDL bonus
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "employee", "payrollPeriod", "contract" }, allowSetters = true)
    private PaySlip paySlip;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() { return this.id; }
    public Bonus id(Long id) { this.id = id; return this; }
    public void setId(Long id) { this.id = id; }

    public BonusType getBonusType() { return this.bonusType; }
    public Bonus bonusType(BonusType bonusType) { this.bonusType = bonusType; return this; }
    public void setBonusType(BonusType bonusType) { this.bonusType = bonusType; }

    public String getLabel() { return this.label; }
    public Bonus label(String label) { this.label = label; return this; }
    public void setLabel(String label) { this.label = label; }

    public BigDecimal getAmount() { return this.amount; }
    public Bonus amount(BigDecimal amount) { this.amount = amount; return this; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Boolean getTaxable() { return this.taxable; }
    public Bonus taxable(Boolean taxable) { this.taxable = taxable; return this; }
    public void setTaxable(Boolean taxable) { this.taxable = taxable; }

    public Integer getMonth() { return this.month; }
    public Bonus month(Integer month) { this.month = month; return this; }
    public void setMonth(Integer month) { this.month = month; }

    public Integer getYear() { return this.year; }
    public Bonus year(Integer year) { this.year = year; return this; }
    public void setYear(Integer year) { this.year = year; }

    public String getNotes() { return this.notes; }
    public Bonus notes(String notes) { this.notes = notes; return this; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getCreatedBy() { return createdBy; }
    public Bonus createdBy(String createdBy) { this.createdBy = createdBy; return this; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedDate() { return createdDate; }
    public Bonus createdDate(Instant createdDate) { this.createdDate = createdDate; return this; }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public Bonus lastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; return this; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public Bonus lastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; return this; }
    public void setLastModifiedDate(Instant lastModifiedDate) { this.lastModifiedDate = lastModifiedDate; }

    public Employee getEmployee() { return this.employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public Bonus employee(Employee employee) { this.employee = employee; return this; }

    public PaySlip getPaySlip() { return this.paySlip; }
    public void setPaySlip(PaySlip paySlip) { this.paySlip = paySlip; }
    public Bonus paySlip(PaySlip paySlip) { this.paySlip = paySlip; return this; }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Bonus)) return false;
        return getId() != null && getId().equals(((Bonus) o).getId());
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

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
            "}";
    }
}

