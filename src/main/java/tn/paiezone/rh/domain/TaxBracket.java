package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

/**
 * Tranche IRPP
 */
@Entity
@Table(name = "tax_bracket")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
@Getter
@Setter
@NoArgsConstructor

public class TaxBracket implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "taxBracketSeq")
    @SequenceGenerator(name = "taxBracketSeq", sequenceName = "tax_bracket_seq", allocationSize = 1)
    private Long id;

    @Column(name = "year", nullable = false)
    private Integer year;

    // Borne inférieure (ex: 5000.000)
    @Column(name = "min_income", nullable = false, precision = 15, scale = 3)
    private BigDecimal minIncome;

    // Borne supérieure — null = dernière tranche (illimitée)
    @Column(name = "max_income", precision = 15, scale = 3)
    private BigDecimal maxIncome;

    // Taux (ex: 0.2600 = 26%)
    @Column(name = "rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal rate;

    /**
     * Déduction forfaitaire globale.
     * FORMULE OFFICIELLE : Impôt = (Revenu × rate) - fixedDeduction
     * S'applique sur le REVENU TOTAL, PAS tranche par tranche.
     */
    @Column(name = "fixed_deduction", nullable = false, precision = 15, scale = 3)
    private BigDecimal fixedDeduction;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
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
