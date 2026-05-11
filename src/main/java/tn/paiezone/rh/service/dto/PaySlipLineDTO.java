package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import tn.paiezone.rh.domain.enumeration.RubriqueType;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

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

    // ✅ Relations IDs (style JHipster)
    private Long paySlipId;
    private Long rubriqueId;

    // ── Getters / Setters ──────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public String getRubriqueCode() { return rubriqueCode; }
    public void setRubriqueCode(String rubriqueCode) { this.rubriqueCode = rubriqueCode; }

    public String getRubriqueLabel() { return rubriqueLabel; }
    public void setRubriqueLabel(String rubriqueLabel) { this.rubriqueLabel = rubriqueLabel; }

    public RubriqueType getRubriqueType() { return rubriqueType; }
    public void setRubriqueType(RubriqueType rubriqueType) { this.rubriqueType = rubriqueType; }

    public BigDecimal getBase() { return base; }
    public void setBase(BigDecimal base) { this.base = base; }

    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Boolean getTaxable() { return taxable; }
    public void setTaxable(Boolean taxable) { this.taxable = taxable; }

    public Long getPaySlipId() { return paySlipId; }
    public void setPaySlipId(Long paySlipId) { this.paySlipId = paySlipId; }

    public Long getRubriqueId() { return rubriqueId; }
    public void setRubriqueId(Long rubriqueId) { this.rubriqueId = rubriqueId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaySlipLineDTO)) return false;
        return Objects.equals(id, ((PaySlipLineDTO) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "PaySlipLineDTO{id=" + id + ", rubriqueCode='" + rubriqueCode +
            "', amount=" + amount + "}";
    }
}
