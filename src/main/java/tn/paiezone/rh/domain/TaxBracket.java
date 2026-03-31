package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Tranche IRPP
 */
@Entity
@Table(name = "tax_bracket")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TaxBracket implements Serializable {

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
    @Column(name = "min_income", precision = 21, scale = 2, nullable = false)
    private BigDecimal minIncome;

    @Column(name = "max_income", precision = 21, scale = 2)
    private BigDecimal maxIncome;

    @NotNull
    @Column(name = "rate", precision = 21, scale = 2, nullable = false)
    private BigDecimal rate;

    @NotNull
    @Column(name = "fixed_deduction", precision = 21, scale = 2, nullable = false)
    private BigDecimal fixedDeduction;

    @NotNull
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public TaxBracket id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return this.year;
    }

    public TaxBracket year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getMinIncome() {
        return this.minIncome;
    }

    public TaxBracket minIncome(BigDecimal minIncome) {
        this.setMinIncome(minIncome);
        return this;
    }

    public void setMinIncome(BigDecimal minIncome) {
        this.minIncome = minIncome;
    }

    public BigDecimal getMaxIncome() {
        return this.maxIncome;
    }

    public TaxBracket maxIncome(BigDecimal maxIncome) {
        this.setMaxIncome(maxIncome);
        return this;
    }

    public void setMaxIncome(BigDecimal maxIncome) {
        this.maxIncome = maxIncome;
    }

    public BigDecimal getRate() {
        return this.rate;
    }

    public TaxBracket rate(BigDecimal rate) {
        this.setRate(rate);
        return this;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getFixedDeduction() {
        return this.fixedDeduction;
    }

    public TaxBracket fixedDeduction(BigDecimal fixedDeduction) {
        this.setFixedDeduction(fixedDeduction);
        return this;
    }

    public void setFixedDeduction(BigDecimal fixedDeduction) {
        this.fixedDeduction = fixedDeduction;
    }

    public Integer getSortOrder() {
        return this.sortOrder;
    }

    public TaxBracket sortOrder(Integer sortOrder) {
        this.setSortOrder(sortOrder);
        return this;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public TaxBracket company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TaxBracket)) {
            return false;
        }
        return getId() != null && getId().equals(((TaxBracket) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TaxBracket{" +
            "id=" + getId() +
            ", year=" + getYear() +
            ", minIncome=" + getMinIncome() +
            ", maxIncome=" + getMaxIncome() +
            ", rate=" + getRate() +
            ", fixedDeduction=" + getFixedDeduction() +
            ", sortOrder=" + getSortOrder() +
            "}";
    }
}
