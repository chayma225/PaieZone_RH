package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.RubriqueType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.PaySlipLine} entity.
 */
@Schema(description = "Ligne de bulletin (détail rubrique par rubrique)")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PaySlipLineDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer sortOrder;

    @NotNull
    @Size(max = 20)
    private String rubriqueCode;

    @NotNull
    @Size(max = 150)
    private String rubriqueLabel;

    @NotNull
    private RubriqueType rubriqueType;

    private BigDecimal base;

    private BigDecimal rate;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private Boolean taxable;

    @NotNull
    private PaySlipDTO paySlip;

    private RubriqueDTO rubrique;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public String getRubriqueCode() {
        return rubriqueCode;
    }

    public void setRubriqueCode(String rubriqueCode) {
        this.rubriqueCode = rubriqueCode;
    }

    public String getRubriqueLabel() {
        return rubriqueLabel;
    }

    public void setRubriqueLabel(String rubriqueLabel) {
        this.rubriqueLabel = rubriqueLabel;
    }

    public RubriqueType getRubriqueType() {
        return rubriqueType;
    }

    public void setRubriqueType(RubriqueType rubriqueType) {
        this.rubriqueType = rubriqueType;
    }

    public BigDecimal getBase() {
        return base;
    }

    public void setBase(BigDecimal base) {
        this.base = base;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Boolean getTaxable() {
        return taxable;
    }

    public void setTaxable(Boolean taxable) {
        this.taxable = taxable;
    }

    public PaySlipDTO getPaySlip() {
        return paySlip;
    }

    public void setPaySlip(PaySlipDTO paySlip) {
        this.paySlip = paySlip;
    }

    public RubriqueDTO getRubrique() {
        return rubrique;
    }

    public void setRubrique(RubriqueDTO rubrique) {
        this.rubrique = rubrique;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PaySlipLineDTO)) {
            return false;
        }

        PaySlipLineDTO paySlipLineDTO = (PaySlipLineDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, paySlipLineDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PaySlipLineDTO{" +
            "id=" + getId() +
            ", sortOrder=" + getSortOrder() +
            ", rubriqueCode='" + getRubriqueCode() + "'" +
            ", rubriqueLabel='" + getRubriqueLabel() + "'" +
            ", rubriqueType='" + getRubriqueType() + "'" +
            ", base=" + getBase() +
            ", rate=" + getRate() +
            ", amount=" + getAmount() +
            ", taxable='" + getTaxable() + "'" +
            ", paySlip=" + getPaySlip() +
            ", rubrique=" + getRubrique() +
            "}";
    }
}
