package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.PlanType;
import tn.paiezone.rh.domain.enumeration.SubscriptionStatus;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.CompanySubscription} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CompanySubscriptionDTO implements Serializable {

    private Long id;

    @NotNull
    private PlanType plan;

    @NotNull
    private SubscriptionStatus status;

    @NotNull
    private Integer maxEmployees;

    @NotNull
    private BigDecimal priceHT;

    @NotNull
    private Integer billingDay;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate renewalDate;

    @Size(max = 500)
    private String notes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PlanType getPlan() {
        return plan;
    }

    public void setPlan(PlanType plan) {
        this.plan = plan;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
    }

    public Integer getMaxEmployees() {
        return maxEmployees;
    }

    public void setMaxEmployees(Integer maxEmployees) {
        this.maxEmployees = maxEmployees;
    }

    public BigDecimal getPriceHT() {
        return priceHT;
    }

    public void setPriceHT(BigDecimal priceHT) {
        this.priceHT = priceHT;
    }

    public Integer getBillingDay() {
        return billingDay;
    }

    public void setBillingDay(Integer billingDay) {
        this.billingDay = billingDay;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getRenewalDate() {
        return renewalDate;
    }

    public void setRenewalDate(LocalDate renewalDate) {
        this.renewalDate = renewalDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CompanySubscriptionDTO)) {
            return false;
        }

        CompanySubscriptionDTO companySubscriptionDTO = (CompanySubscriptionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, companySubscriptionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CompanySubscriptionDTO{" +
            "id=" + getId() +
            ", plan='" + getPlan() + "'" +
            ", status='" + getStatus() + "'" +
            ", maxEmployees=" + getMaxEmployees() +
            ", priceHT=" + getPriceHT() +
            ", billingDay=" + getBillingDay() +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", renewalDate='" + getRenewalDate() + "'" +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
