package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.RubriqueBase;
import tn.paiezone.rh.domain.enumeration.RubriqueType;

/**
 * A Rubrique.
 */
@Entity
@Table(name = "rubrique")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Rubrique implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "code", length = 20, nullable = false, unique = true)
    private String code;

    @NotNull
    @Size(max = 150)
    @Column(name = "label", length = 150, nullable = false)
    private String label;

    @Size(max = 150)
    @Column(name = "label_ar", length = 150)
    private String labelAr;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "rubrique_type", nullable = false)
    private RubriqueType rubriqueType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "base", nullable = false)
    private RubriqueBase base;

    @Column(name = "rate", precision = 21, scale = 2)
    private BigDecimal rate;

    @Column(name = "fixed_amount", precision = 21, scale = 2)
    private BigDecimal fixedAmount;

    @Size(max = 500)
    @Column(name = "formula", length = 500)
    private String formula;

    @NotNull
    @Column(name = "taxable", nullable = false)
    private Boolean taxable;

    @NotNull
    @Column(name = "cnss_salary", nullable = false)
    private Boolean cnssSalary;

    @NotNull
    @Column(name = "cnss_employer", nullable = false)
    private Boolean cnssEmployer;

    @NotNull
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Rubrique id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return this.code;
    }

    public Rubrique code(String code) {
        this.setCode(code);
        return this;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLabel() {
        return this.label;
    }

    public Rubrique label(String label) {
        this.setLabel(label);
        return this;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getLabelAr() {
        return this.labelAr;
    }

    public Rubrique labelAr(String labelAr) {
        this.setLabelAr(labelAr);
        return this;
    }

    public void setLabelAr(String labelAr) {
        this.labelAr = labelAr;
    }

    public RubriqueType getRubriqueType() {
        return this.rubriqueType;
    }

    public Rubrique rubriqueType(RubriqueType rubriqueType) {
        this.setRubriqueType(rubriqueType);
        return this;
    }

    public void setRubriqueType(RubriqueType rubriqueType) {
        this.rubriqueType = rubriqueType;
    }

    public RubriqueBase getBase() {
        return this.base;
    }

    public Rubrique base(RubriqueBase base) {
        this.setBase(base);
        return this;
    }

    public void setBase(RubriqueBase base) {
        this.base = base;
    }

    public BigDecimal getRate() {
        return this.rate;
    }

    public Rubrique rate(BigDecimal rate) {
        this.setRate(rate);
        return this;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getFixedAmount() {
        return this.fixedAmount;
    }

    public Rubrique fixedAmount(BigDecimal fixedAmount) {
        this.setFixedAmount(fixedAmount);
        return this;
    }

    public void setFixedAmount(BigDecimal fixedAmount) {
        this.fixedAmount = fixedAmount;
    }

    public String getFormula() {
        return this.formula;
    }

    public Rubrique formula(String formula) {
        this.setFormula(formula);
        return this;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }

    public Boolean getTaxable() {
        return this.taxable;
    }

    public Rubrique taxable(Boolean taxable) {
        this.setTaxable(taxable);
        return this;
    }

    public void setTaxable(Boolean taxable) {
        this.taxable = taxable;
    }

    public Boolean getCnssSalary() {
        return this.cnssSalary;
    }

    public Rubrique cnssSalary(Boolean cnssSalary) {
        this.setCnssSalary(cnssSalary);
        return this;
    }

    public void setCnssSalary(Boolean cnssSalary) {
        this.cnssSalary = cnssSalary;
    }

    public Boolean getCnssEmployer() {
        return this.cnssEmployer;
    }

    public Rubrique cnssEmployer(Boolean cnssEmployer) {
        this.setCnssEmployer(cnssEmployer);
        return this;
    }

    public void setCnssEmployer(Boolean cnssEmployer) {
        this.cnssEmployer = cnssEmployer;
    }

    public Integer getSortOrder() {
        return this.sortOrder;
    }

    public Rubrique sortOrder(Integer sortOrder) {
        this.setSortOrder(sortOrder);
        return this;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getActive() {
        return this.active;
    }

    public Rubrique active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Rubrique company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Rubrique)) {
            return false;
        }
        return getId() != null && getId().equals(((Rubrique) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Rubrique{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", label='" + getLabel() + "'" +
            ", labelAr='" + getLabelAr() + "'" +
            ", rubriqueType='" + getRubriqueType() + "'" +
            ", base='" + getBase() + "'" +
            ", rate=" + getRate() +
            ", fixedAmount=" + getFixedAmount() +
            ", formula='" + getFormula() + "'" +
            ", taxable='" + getTaxable() + "'" +
            ", cnssSalary='" + getCnssSalary() + "'" +
            ", cnssEmployer='" + getCnssEmployer() + "'" +
            ", sortOrder=" + getSortOrder() +
            ", active='" + getActive() + "'" +
            "}";
    }
}
