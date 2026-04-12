package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.LeaveTypeName;

/**
 * A LeaveType.
 */
@Entity
@Table(name = "leave_type")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveType implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false)
    private LeaveTypeName name;

    @NotNull
    @Size(max = 100)
    @Column(name = "label", length = 100, nullable = false)
    private String label;

    @NotNull
    @Column(name = "max_days_per_year", nullable = false)
    private Integer maxDaysPerYear;

    @NotNull
    @Min(value = 0)
    @Column(name = "carry_over_days", nullable = false)
    private Integer carryOverDays;

    @NotNull
    @Column(name = "paid", nullable = false)
    private Boolean paid;

    @NotNull
    @Column(name = "requires_medical", nullable = false)
    private Boolean requiresMedical;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public LeaveType id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LeaveTypeName getName() {
        return this.name;
    }

    public LeaveType name(LeaveTypeName name) {
        this.setName(name);
        return this;
    }

    public void setName(LeaveTypeName name) {
        this.name = name;
    }

    public String getLabel() {
        return this.label;
    }

    public LeaveType label(String label) {
        this.setLabel(label);
        return this;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Integer getMaxDaysPerYear() {
        return this.maxDaysPerYear;
    }

    public LeaveType maxDaysPerYear(Integer maxDaysPerYear) {
        this.setMaxDaysPerYear(maxDaysPerYear);
        return this;
    }

    public void setMaxDaysPerYear(Integer maxDaysPerYear) {
        this.maxDaysPerYear = maxDaysPerYear;
    }

    public Integer getCarryOverDays() {
        return this.carryOverDays;
    }

    public LeaveType carryOverDays(Integer carryOverDays) {
        this.setCarryOverDays(carryOverDays);
        return this;
    }

    public void setCarryOverDays(Integer carryOverDays) {
        this.carryOverDays = carryOverDays;
    }

    public Boolean getPaid() {
        return this.paid;
    }

    public LeaveType paid(Boolean paid) {
        this.setPaid(paid);
        return this;
    }

    public void setPaid(Boolean paid) {
        this.paid = paid;
    }

    public Boolean getRequiresMedical() {
        return this.requiresMedical;
    }

    public LeaveType requiresMedical(Boolean requiresMedical) {
        this.setRequiresMedical(requiresMedical);
        return this;
    }

    public void setRequiresMedical(Boolean requiresMedical) {
        this.requiresMedical = requiresMedical;
    }

    public Boolean getActive() {
        return this.active;
    }

    public LeaveType active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public LeaveType company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LeaveType)) {
            return false;
        }
        return getId() != null && getId().equals(((LeaveType) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveType{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", label='" + getLabel() + "'" +
            ", maxDaysPerYear=" + getMaxDaysPerYear() +
            ", carryOverDays=" + getCarryOverDays() +
            ", paid='" + getPaid() + "'" +
            ", requiresMedical='" + getRequiresMedical() + "'" +
            ", active='" + getActive() + "'" +
            "}";
    }
}
