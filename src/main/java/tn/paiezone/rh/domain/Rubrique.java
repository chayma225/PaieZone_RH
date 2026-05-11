package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.RubriqueBase;
import tn.paiezone.rh.domain.enumeration.RubriqueType;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "rubrique")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Rubrique implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    // ✅ unique retiré ici — la contrainte DDL est sur (code, company_id)
    @Column(name = "code", length = 20, nullable = false)
    private String code;

    @NotNull
    @Size(max = 150)
    @Column(name = "label", length = 150, nullable = false)
    private String label;

    // ✅ Présent dans l'entité JHipster — colonne ajoutée par 12_add_rubrique_missing_columns.xml
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

    // ✅ Colonne ajoutée par 12_add_rubrique_missing_columns.xml
    @Size(max = 500)
    @Column(name = "formula", length = 500)
    private String formula;

    @NotNull
    @Column(name = "taxable", nullable = false)
    private Boolean taxable;

    // ✅ Colonne ajoutée par 12_add_rubrique_missing_columns.xml
    // Indique si la rubrique est soumise au CNSS salarié
    @NotNull
    @Column(name = "cnss_salary", nullable = false)
    private Boolean cnssSalary;

    // ✅ Colonne ajoutée par 12_add_rubrique_missing_columns.xml
    // Indique si la rubrique entre dans la base de calcul CNSS patronal
    @NotNull
    @Column(name = "cnss_employer", nullable = false)
    private Boolean cnssEmployer;

    @NotNull
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    // ✅ Ajouté — présent dans votre DDL (created_by varchar(50))
    @Column(name = "created_by", nullable = false, length = 50)
    private String createdBy;

    // ✅ Ajouté — présent dans votre DDL
    @Column(name = "created_date", nullable = false, updatable = false)
    private Instant createdDate;

    // ✅ Ajouté — présent dans votre DDL
    @Column(name = "last_modified_by", length = 50)
    private String lastModifiedBy;

    // ✅ Ajouté — présent dans votre DDL
    @Column(name = "last_modified_date")
    private Instant lastModifiedDate;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    // ── Getters & Setters ────────────────────────────────────────────

    public Long getId() { return id; }
    public Rubrique id(Long id) { this.id = id; return this; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public Rubrique code(String code) { this.code = code; return this; }
    public void setCode(String code) { this.code = code; }

    public String getLabel() { return label; }
    public Rubrique label(String label) { this.label = label; return this; }
    public void setLabel(String label) { this.label = label; }

    public String getLabelAr() { return labelAr; }
    public Rubrique labelAr(String labelAr) { this.labelAr = labelAr; return this; }
    public void setLabelAr(String labelAr) { this.labelAr = labelAr; }

    public RubriqueType getRubriqueType() { return rubriqueType; }
    public Rubrique rubriqueType(RubriqueType rubriqueType) {
        this.rubriqueType = rubriqueType; return this;
    }
    public void setRubriqueType(RubriqueType rubriqueType) { this.rubriqueType = rubriqueType; }

    public RubriqueBase getBase() { return base; }
    public Rubrique base(RubriqueBase base) { this.base = base; return this; }
    public void setBase(RubriqueBase base) { this.base = base; }

    public BigDecimal getRate() { return rate; }
    public Rubrique rate(BigDecimal rate) { this.rate = rate; return this; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public BigDecimal getFixedAmount() { return fixedAmount; }
    public Rubrique fixedAmount(BigDecimal fixedAmount) {
        this.fixedAmount = fixedAmount; return this;
    }
    public void setFixedAmount(BigDecimal fixedAmount) { this.fixedAmount = fixedAmount; }

    public String getFormula() { return formula; }
    public Rubrique formula(String formula) { this.formula = formula; return this; }
    public void setFormula(String formula) { this.formula = formula; }

    public Boolean getTaxable() { return taxable; }
    public Rubrique taxable(Boolean taxable) { this.taxable = taxable; return this; }
    public void setTaxable(Boolean taxable) { this.taxable = taxable; }

    public Boolean getCnssSalary() { return cnssSalary; }
    public Rubrique cnssSalary(Boolean cnssSalary) { this.cnssSalary = cnssSalary; return this; }
    public void setCnssSalary(Boolean cnssSalary) { this.cnssSalary = cnssSalary; }

    public Boolean getCnssEmployer() { return cnssEmployer; }
    public Rubrique cnssEmployer(Boolean cnssEmployer) {
        this.cnssEmployer = cnssEmployer; return this;
    }
    public void setCnssEmployer(Boolean cnssEmployer) { this.cnssEmployer = cnssEmployer; }

    public Integer getSortOrder() { return sortOrder; }
    public Rubrique sortOrder(Integer sortOrder) { this.sortOrder = sortOrder; return this; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Boolean getActive() { return active; }
    public Rubrique active(Boolean active) { this.active = active; return this; }
    public void setActive(Boolean active) { this.active = active; }

    // ✅ Nouveaux getters/setters pour les champs audit
    public String getCreatedBy() { return createdBy; }
    public Rubrique createdBy(String createdBy) { this.createdBy = createdBy; return this; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedDate() { return createdDate; }
    public Rubrique createdDate(Instant createdDate) {
        this.createdDate = createdDate; return this;
    }
    public void setCreatedDate(Instant createdDate) { this.createdDate = createdDate; }

    public String getLastModifiedBy() { return lastModifiedBy; }
    public Rubrique lastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy; return this;
    }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }

    public Instant getLastModifiedDate() { return lastModifiedDate; }
    public Rubrique lastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate; return this;
    }
    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }
    public Rubrique company(Company company) { this.company = company; return this; }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Rubrique)) return false;
        return getId() != null && getId().equals(((Rubrique) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Rubrique{" +
            "id=" + getId() +
            ", code='" + getCode() + "'" +
            ", label='" + getLabel() + "'" +
            ", rubriqueType='" + getRubriqueType() + "'" +
            ", base='" + getBase() + "'" +
            ", rate=" + getRate() +
            ", fixedAmount=" + getFixedAmount() +
            ", taxable='" + getTaxable() + "'" +
            ", cnssSalary='" + getCnssSalary() + "'" +
            ", cnssEmployer='" + getCnssEmployer() + "'" +
            ", sortOrder=" + getSortOrder() +
            ", active='" + getActive() + "'" +
            "}";
    }
}
