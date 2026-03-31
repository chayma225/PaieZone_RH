package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.BonusType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.Bonus} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class BonusDTO implements Serializable {

    private Long id;

    @NotNull
    private BonusType bonusType;

    @NotNull
    @Size(max = 150)
    private String label;

    @NotNull
    private BigDecimal amount;

    @NotNull
    private Boolean taxable;

    @NotNull
    @Min(value = 1)
    @Max(value = 12)
    private Integer month;

    @NotNull
    private Integer year;

    @Size(max = 500)
    private String notes;

    @NotNull
    private EmployeeDTO employee;

    private PaySlipDTO paySlip;

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

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public PaySlipDTO getPaySlip() {
        return paySlip;
    }

    public void setPaySlip(PaySlipDTO paySlip) {
        this.paySlip = paySlip;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof BonusDTO)) {
            return false;
        }

        BonusDTO bonusDTO = (BonusDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, bonusDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "BonusDTO{" +
            "id=" + getId() +
            ", bonusType='" + getBonusType() + "'" +
            ", label='" + getLabel() + "'" +
            ", amount=" + getAmount() +
            ", taxable='" + getTaxable() + "'" +
            ", month=" + getMonth() +
            ", year=" + getYear() +
            ", notes='" + getNotes() + "'" +
            ", employee=" + getEmployee() +
            ", paySlip=" + getPaySlip() +
            "}";
    }
}
