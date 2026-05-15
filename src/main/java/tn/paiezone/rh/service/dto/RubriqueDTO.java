package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.RubriqueBase;
import tn.paiezone.rh.domain.enumeration.RubriqueType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.Rubrique} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RubriqueDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 20)
    private String code;

    @NotNull
    @Size(max = 150)
    private String label;

    @Size(max = 150)
    private String labelAr;

    @NotNull
    private RubriqueType rubriqueType;

    @NotNull
    private RubriqueBase base;

    private BigDecimal rate;

    private BigDecimal fixedAmount;

    @Size(max = 500)
    private String formula;

    @NotNull
    private Boolean taxable;

    @NotNull
    private Boolean cnssSalary;

    @NotNull
    private Boolean cnssEmployer;

    @NotNull
    private Integer sortOrder;

    @NotNull
    private Boolean active;

    private CompanyDTO company;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getLabelAr() {
        return labelAr;
    }

    public void setLabelAr(String labelAr) {
        this.labelAr = labelAr;
    }

    public RubriqueType getRubriqueType() {
        return rubriqueType;
    }

    public void setRubriqueType(RubriqueType rubriqueType) {
        this.rubriqueType = rubriqueType;
    }

    public RubriqueBase getBase() {
        return base;
    }

    public void setBase(RubriqueBase base) {
        this.base = base;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getFixedAmount() {
        return fixedAmount;
    }

    public void setFixedAmount(BigDecimal fixedAmount) {
        this.fixedAmount = fixedAmount;
    }

    public String getFormula() {
        return formula;
    }

    public void setFormula(String formula) {
        this.formula = formula;
    }

    public Boolean getTaxable() {
        return taxable;
    }

    public void setTaxable(Boolean taxable) {
        this.taxable = taxable;
    }

    public Boolean getCnssSalary() {
        return cnssSalary;
    }

    public void setCnssSalary(Boolean cnssSalary) {
        this.cnssSalary = cnssSalary;
    }

    public Boolean getCnssEmployer() {
        return cnssEmployer;
    }

    public void setCnssEmployer(Boolean cnssEmployer) {
        this.cnssEmployer = cnssEmployer;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public CompanyDTO getCompany() {
        return company;
    }

    public void setCompany(CompanyDTO company) {
        this.company = company;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RubriqueDTO)) {
            return false;
        }

        RubriqueDTO rubriqueDTO = (RubriqueDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, rubriqueDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RubriqueDTO{" +
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
            ", company=" + getCompany() +
            "}";
    }
}
