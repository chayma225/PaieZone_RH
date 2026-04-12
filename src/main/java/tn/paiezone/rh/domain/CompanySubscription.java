package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.CompanySubscriptionStatus;
import tn.paiezone.rh.domain.enumeration.PlanType;

/**
 * A CompanySubscription.
 */
@Entity
@Table(name = "company_subscription")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CompanySubscription implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "plan", nullable = false)
    private PlanType plan;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CompanySubscriptionStatus status;

    @NotNull
    @Column(name = "max_employees", nullable = false)
    private Integer maxEmployees;

    @NotNull
    @Column(name = "price_ht", precision = 21, scale = 2, nullable = false)
    private BigDecimal priceHT;

    @NotNull
    @Column(name = "billing_day", nullable = false)
    private Integer billingDay;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "renewal_date")
    private LocalDate renewalDate;

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY, mappedBy = "companySubscription")
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CompanySubscription id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PlanType getPlan() {
        return this.plan;
    }

    public CompanySubscription plan(PlanType plan) {
        this.setPlan(plan);
        return this;
    }

    public void setPlan(PlanType plan) {
        this.plan = plan;
    }

    public CompanySubscriptionStatus getStatus() {
        return this.status;
    }

    public CompanySubscription status(CompanySubscriptionStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(CompanySubscriptionStatus status) {
        this.status = status;
    }

    public Integer getMaxEmployees() {
        return this.maxEmployees;
    }

    public CompanySubscription maxEmployees(Integer maxEmployees) {
        this.setMaxEmployees(maxEmployees);
        return this;
    }

    public void setMaxEmployees(Integer maxEmployees) {
        this.maxEmployees = maxEmployees;
    }

    public BigDecimal getPriceHT() {
        return this.priceHT;
    }

    public CompanySubscription priceHT(BigDecimal priceHT) {
        this.setPriceHT(priceHT);
        return this;
    }

    public void setPriceHT(BigDecimal priceHT) {
        this.priceHT = priceHT;
    }

    public Integer getBillingDay() {
        return this.billingDay;
    }

    public CompanySubscription billingDay(Integer billingDay) {
        this.setBillingDay(billingDay);
        return this;
    }

    public void setBillingDay(Integer billingDay) {
        this.billingDay = billingDay;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }

    public CompanySubscription startDate(LocalDate startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return this.endDate;
    }

    public CompanySubscription endDate(LocalDate endDate) {
        this.setEndDate(endDate);
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getRenewalDate() {
        return this.renewalDate;
    }

    public CompanySubscription renewalDate(LocalDate renewalDate) {
        this.setRenewalDate(renewalDate);
        return this;
    }

    public void setRenewalDate(LocalDate renewalDate) {
        this.renewalDate = renewalDate;
    }

    public String getNotes() {
        return this.notes;
    }

    public CompanySubscription notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        if (this.company != null) {
            this.company.setCompanySubscription(null);
        }
        if (company != null) {
            company.setCompanySubscription(this);
        }
        this.company = company;
    }

    public CompanySubscription company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CompanySubscription)) {
            return false;
        }
        return getId() != null && getId().equals(((CompanySubscription) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CompanySubscription{" +
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
