package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.BonusType;

public class BonusDTO implements Serializable {

    private Long id;

    private BonusType bonusType;

    @NotNull
    @Size(max = 150)
    private String label;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private Boolean taxable;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    @NotNull
    private Integer year;

    @Size(max = 500)
    private String notes;

    // ✅ Relations IDs (style JHipster)
    private Long employeeId;
    private Long paySlipId;

    // ── Getters / Setters ──────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BonusType getBonusType() {
        return bonusType;
    }

    public void setBonusType(BonusType bonusType) {
        this.bonusType = bonusType;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
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

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getPaySlipId() {
        return paySlipId;
    }

    public void setPaySlipId(Long paySlipId) {
        this.paySlipId = paySlipId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BonusDTO)) return false;
        return id != null && id.equals(((BonusDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "BonusDTO{id=" + id + ", label='" + label + "', amount=" + amount + ", month=" + month + ", year=" + year + "}";
    }
}
