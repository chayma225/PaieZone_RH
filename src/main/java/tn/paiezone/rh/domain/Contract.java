package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.domain.enumeration.ContractType;

/**
 * Contrat de travail
 */
@Entity
@Table(name = "contract")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Contract implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "reference", length = 50, nullable = false, unique = true)
    private String reference;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", nullable = false)
    private ContractType contractType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContractStatus status;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "signed_date")
    private LocalDate signedDate;

    @NotNull
    @Column(name = "base_salary", precision = 21, scale = 2, nullable = false)
    private BigDecimal baseSalary;

    @NotNull
    @Min(value = 1)
    @Max(value = 48)
    @Column(name = "working_hours_week", nullable = false)
    private Integer workingHoursWeek;

    @NotNull
    @Min(value = 1)
    @Max(value = 7)
    @Column(name = "working_days_week", nullable = false)
    private Integer workingDaysWeek;

    @Size(max = 100)
    @Column(name = "convention_collective", length = 100)
    private String conventionCollective;

    @Min(value = 0)
    @Max(value = 12)
    @Column(name = "trial_period_months")
    private Integer trialPeriodMonths;

    @Min(value = 0)
    @Column(name = "renewal_count")
    private Integer renewalCount;

    @Size(max = 500)
    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Lob
    @Column(name = "notes")
    private String notes;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile createdBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Contract id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReference() {
        return this.reference;
    }

    public Contract reference(String reference) {
        this.setReference(reference);
        return this;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public ContractType getContractType() {
        return this.contractType;
    }

    public Contract contractType(ContractType contractType) {
        this.setContractType(contractType);
        return this;
    }

    public void setContractType(ContractType contractType) {
        this.contractType = contractType;
    }

    public ContractStatus getStatus() {
        return this.status;
    }

    public Contract status(ContractStatus status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }

    public Contract startDate(LocalDate startDate) {
        this.setStartDate(startDate);
        return this;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return this.endDate;
    }

    public Contract endDate(LocalDate endDate) {
        this.setEndDate(endDate);
        return this;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalDate getSignedDate() {
        return this.signedDate;
    }

    public Contract signedDate(LocalDate signedDate) {
        this.setSignedDate(signedDate);
        return this;
    }

    public void setSignedDate(LocalDate signedDate) {
        this.signedDate = signedDate;
    }

    public BigDecimal getBaseSalary() {
        return this.baseSalary;
    }

    public Contract baseSalary(BigDecimal baseSalary) {
        this.setBaseSalary(baseSalary);
        return this;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public Integer getWorkingHoursWeek() {
        return this.workingHoursWeek;
    }

    public Contract workingHoursWeek(Integer workingHoursWeek) {
        this.setWorkingHoursWeek(workingHoursWeek);
        return this;
    }

    public void setWorkingHoursWeek(Integer workingHoursWeek) {
        this.workingHoursWeek = workingHoursWeek;
    }

    public Integer getWorkingDaysWeek() {
        return this.workingDaysWeek;
    }

    public Contract workingDaysWeek(Integer workingDaysWeek) {
        this.setWorkingDaysWeek(workingDaysWeek);
        return this;
    }

    public void setWorkingDaysWeek(Integer workingDaysWeek) {
        this.workingDaysWeek = workingDaysWeek;
    }

    public String getConventionCollective() {
        return this.conventionCollective;
    }

    public Contract conventionCollective(String conventionCollective) {
        this.setConventionCollective(conventionCollective);
        return this;
    }

    public void setConventionCollective(String conventionCollective) {
        this.conventionCollective = conventionCollective;
    }

    public Integer getTrialPeriodMonths() {
        return this.trialPeriodMonths;
    }

    public Contract trialPeriodMonths(Integer trialPeriodMonths) {
        this.setTrialPeriodMonths(trialPeriodMonths);
        return this;
    }

    public void setTrialPeriodMonths(Integer trialPeriodMonths) {
        this.trialPeriodMonths = trialPeriodMonths;
    }

    public Integer getRenewalCount() {
        return this.renewalCount;
    }

    public Contract renewalCount(Integer renewalCount) {
        this.setRenewalCount(renewalCount);
        return this;
    }

    public void setRenewalCount(Integer renewalCount) {
        this.renewalCount = renewalCount;
    }

    public String getDocumentUrl() {
        return this.documentUrl;
    }

    public Contract documentUrl(String documentUrl) {
        this.setDocumentUrl(documentUrl);
        return this;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getNotes() {
        return this.notes;
    }

    public Contract notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Contract createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public Contract employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public UserProfile getCreatedBy() {
        return this.createdBy;
    }

    public void setCreatedBy(UserProfile userProfile) {
        this.createdBy = userProfile;
    }

    public Contract createdBy(UserProfile userProfile) {
        this.setCreatedBy(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Contract)) {
            return false;
        }
        return getId() != null && getId().equals(((Contract) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Contract{" +
            "id=" + getId() +
            ", reference='" + getReference() + "'" +
            ", contractType='" + getContractType() + "'" +
            ", status='" + getStatus() + "'" +
            ", startDate='" + getStartDate() + "'" +
            ", endDate='" + getEndDate() + "'" +
            ", signedDate='" + getSignedDate() + "'" +
            ", baseSalary=" + getBaseSalary() +
            ", workingHoursWeek=" + getWorkingHoursWeek() +
            ", workingDaysWeek=" + getWorkingDaysWeek() +
            ", conventionCollective='" + getConventionCollective() + "'" +
            ", trialPeriodMonths=" + getTrialPeriodMonths() +
            ", renewalCount=" + getRenewalCount() +
            ", documentUrl='" + getDocumentUrl() + "'" +
            ", notes='" + getNotes() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
