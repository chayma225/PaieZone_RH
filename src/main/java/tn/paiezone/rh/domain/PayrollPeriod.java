package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

/**
 * A PayrollPeriod.
 */
@Entity
@Table(name = "payroll_period")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PayrollPeriod implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Min(value = 1)
    @Max(value = 12)
    @Column(name = "month", nullable = false)
    private Integer month;

    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PayrollStatus status;

    @Column(name = "calculated_at")
    private Instant calculatedAt;

    @Column(name = "validated_at")
    private Instant validatedAt;

    @Column(name = "locked_at")
    private Instant lockedAt;

    @Lob
    @Column(name = "notes")
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile createdBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public PayrollPeriod id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMonth() {
        return this.month;
    }

    public PayrollPeriod month(Integer month) {
        this.setMonth(month);
        return this;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return this.year;
    }

    public PayrollPeriod year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public PayrollStatus getStatus() {
        return this.status;
    }

    public PayrollPeriod status(PayrollStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(PayrollStatus status) {
        this.status = status;
    }

    public Instant getCalculatedAt() {
        return this.calculatedAt;
    }

    public PayrollPeriod calculatedAt(Instant calculatedAt) {
        this.setCalculatedAt(calculatedAt);
        return this;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public Instant getValidatedAt() {
        return this.validatedAt;
    }

    public PayrollPeriod validatedAt(Instant validatedAt) {
        this.setValidatedAt(validatedAt);
        return this;
    }

    public void setValidatedAt(Instant validatedAt) {
        this.validatedAt = validatedAt;
    }

    public Instant getLockedAt() {
        return this.lockedAt;
    }

    public PayrollPeriod lockedAt(Instant lockedAt) {
        this.setLockedAt(lockedAt);
        return this;
    }

    public void setLockedAt(Instant lockedAt) {
        this.lockedAt = lockedAt;
    }

    public String getNotes() {
        return this.notes;
    }

    public PayrollPeriod notes(String notes) {
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
        this.company = company;
    }

    public PayrollPeriod company(Company company) {
        this.setCompany(company);
        return this;
    }

    public UserProfile getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(UserProfile userProfile) {
        this.createdBy = userProfile;
    }

    public PayrollPeriod createdBy(UserProfile userProfile) {
        this.setCreatedBy(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof PayrollPeriod)) {
            return false;
        }
        return getId() != null && getId().equals(((PayrollPeriod) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PayrollPeriod{" +
            "id=" + getId() +
            ", month=" + getMonth() +
            ", year=" + getYear() +
            ", status='" + getStatus() + "'" +
            ", calculatedAt='" + getCalculatedAt() + "'" +
            ", validatedAt='" + getValidatedAt() + "'" +
            ", lockedAt='" + getLockedAt() + "'" +
            ", notes='" + getNotes() + "'" +
            "}";
    }
}
