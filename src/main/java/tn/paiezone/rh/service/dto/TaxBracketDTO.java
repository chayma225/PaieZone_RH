package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.TaxBracket} entity.
 */
@Schema(description = "Tranche IRPP")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class TaxBracketDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer year;

    @NotNull
    private BigDecimal minIncome;

    private BigDecimal maxIncome;

    @NotNull
    private BigDecimal rate;

    @NotNull
    private BigDecimal fixedDeduction;

    @NotNull
    private Integer sortOrder;

    private CompanyDTO company;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getMinIncome() {
        return minIncome;
    }

    public void setMinIncome(BigDecimal minIncome) {
        this.minIncome = minIncome;
    }

    public BigDecimal getMaxIncome() {
        return maxIncome;
    }

    public void setMaxIncome(BigDecimal maxIncome) {
        this.maxIncome = maxIncome;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getFixedDeduction() {
        return fixedDeduction;
    }

    public void setFixedDeduction(BigDecimal fixedDeduction) {
        this.fixedDeduction = fixedDeduction;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
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
        if (!(o instanceof TaxBracketDTO)) {
            return false;
        }

        TaxBracketDTO taxBracketDTO = (TaxBracketDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, taxBracketDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TaxBracketDTO{" +
            "id=" + getId() +
            ", year=" + getYear() +
            ", minIncome=" + getMinIncome() +
            ", maxIncome=" + getMaxIncome() +
            ", rate=" + getRate() +
            ", fixedDeduction=" + getFixedDeduction() +
            ", sortOrder=" + getSortOrder() +
            ", company=" + getCompany() +
            "}";
    }
}
