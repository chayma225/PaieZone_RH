package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.RubriqueType;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "pay_slip_line")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaySlipLine implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @NotNull
    @Size(max = 20)
    @Column(name = "rubrique_code", length = 20, nullable = false)
    private String rubriqueCode;

    @NotNull
    @Size(max = 150)
    @Column(name = "rubrique_label", length = 150, nullable = false)
    private String rubriqueLabel;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "rubrique_type", nullable = false)
    private RubriqueType rubriqueType;

    @Column(name = "base", precision = 21, scale = 2)
    private BigDecimal base;

    @Column(name = "rate", precision = 21, scale = 2)
    private BigDecimal rate;

    @NotNull
    @Column(name = "amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal amount;

    @NotNull
    @Column(name = "taxable", nullable = false)
    private Boolean taxable;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "employee", "payrollPeriod", "contract" }, allowSetters = true)
    private PaySlip paySlip;

    // ✅ FK vers rubrique — colonne rubrique_id ajoutée par 13_add_missing_entity_columns.xml
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private Rubrique rubrique;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() { return this.id; }
    public PaySlipLine id(Long id) { this.id = id; return this; }
    public void setId(Long id) { this.id = id; }

    public Integer getSortOrder() { return this.sortOrder; }
    public PaySlipLine sortOrder(Integer sortOrder) { this.sortOrder = sortOrder; return this; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getRubriqueCode() { return this.rubriqueCode; }
    public PaySlipLine rubriqueCode(String rubriqueCode) { this.rubriqueCode = rubriqueCode; return this; }
    public void setRubriqueCode(String rubriqueCode) { this.rubriqueCode = rubriqueCode; }

    public String getRubriqueLabel() { return this.rubriqueLabel; }
    public PaySlipLine rubriqueLabel(String rubriqueLabel) { this.rubriqueLabel = rubriqueLabel; return this; }
    public void setRubriqueLabel(String rubriqueLabel) { this.rubriqueLabel = rubriqueLabel; }

    public RubriqueType getRubriqueType() { return this.rubriqueType; }
    public PaySlipLine rubriqueType(RubriqueType rubriqueType) { this.rubriqueType = rubriqueType; return this; }
    public void setRubriqueType(RubriqueType rubriqueType) { this.rubriqueType = rubriqueType; }

    public BigDecimal getBase() { return this.base; }
    public PaySlipLine base(BigDecimal base) { this.base = base; return this; }
    public void setBase(BigDecimal base) { this.base = base; }

    public BigDecimal getRate() { return this.rate; }
    public PaySlipLine rate(BigDecimal rate) { this.rate = rate; return this; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public BigDecimal getAmount() { return this.amount; }
    public PaySlipLine amount(BigDecimal amount) { this.amount = amount; return this; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Boolean getTaxable() { return this.taxable; }
    public PaySlipLine taxable(Boolean taxable) { this.taxable = taxable; return this; }
    public void setTaxable(Boolean taxable) { this.taxable = taxable; }

    public PaySlip getPaySlip() { return this.paySlip; }
    public void setPaySlip(PaySlip paySlip) { this.paySlip = paySlip; }
    public PaySlipLine paySlip(PaySlip paySlip) { this.paySlip = paySlip; return this; }

    public Rubrique getRubrique() { return this.rubrique; }
    public void setRubrique(Rubrique rubrique) { this.rubrique = rubrique; }
    public PaySlipLine rubrique(Rubrique rubrique) { this.rubrique = rubrique; return this; }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaySlipLine)) return false;
        return getId() != null && getId().equals(((PaySlipLine) o).getId());
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "PaySlipLine{" +
            "id=" + getId() +
            ", sortOrder=" + getSortOrder() +
            ", rubriqueCode='" + getRubriqueCode() + "'" +
            ", rubriqueLabel='" + getRubriqueLabel() + "'" +
            ", rubriqueType='" + getRubriqueType() + "'" +
            ", base=" + getBase() +
            ", rate=" + getRate() +
            ", amount=" + getAmount() +
            ", taxable='" + getTaxable() + "'" +
            "}";
    }
}

