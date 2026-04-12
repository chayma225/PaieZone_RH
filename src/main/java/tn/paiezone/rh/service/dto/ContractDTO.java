package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.domain.enumeration.ContractType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.Contract} entity.
 */
@Schema(description = "Contrat de travail")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ContractDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 50)
    private String reference;

    @NotNull
    private ContractType contractType;

    @NotNull
    private ContractStatus status;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate signedDate;

    @NotNull
    private BigDecimal baseSalary;

    @NotNull
    @Min(value = 1)
    @Max(value = 48)
    private Integer workingHoursWeek;

    @NotNull
    @Min(value = 1)
    @Max(value = 7)
    private Integer workingDaysWeek;

    @Size(max = 100)
    private String conventionCollective;

    @Min(value = 0)
    @Max(value = 12)
    private Integer trialPeriodMonths;

    @Min(value = 0)
    private Integer renewalCount;

    @Size(max = 500)
    private String documentUrl;

    @Lob
    private String notes;

    @NotNull
    private Instant createdAt;

    @NotNull
    private EmployeeDTO employee;

    private UserProfileDTO createdBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public ContractType getContractType() {
        return contractType;
    }

    public void setContractType(ContractType contractType) {
        this.contractType = contractType;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
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

    public LocalDate getSignedDate() {
        return signedDate;
    }

    public void setSignedDate(LocalDate signedDate) {
        this.signedDate = signedDate;
    }

    public BigDecimal getBaseSalary() {
        return baseSalary;
    }

    public void setBaseSalary(BigDecimal baseSalary) {
        this.baseSalary = baseSalary;
    }

    public Integer getWorkingHoursWeek() {
        return workingHoursWeek;
    }

    public void setWorkingHoursWeek(Integer workingHoursWeek) {
        this.workingHoursWeek = workingHoursWeek;
    }

    public Integer getWorkingDaysWeek() {
        return workingDaysWeek;
    }

    public void setWorkingDaysWeek(Integer workingDaysWeek) {
        this.workingDaysWeek = workingDaysWeek;
    }

    public String getConventionCollective() {
        return conventionCollective;
    }

    public void setConventionCollective(String conventionCollective) {
        this.conventionCollective = conventionCollective;
    }

    public Integer getTrialPeriodMonths() {
        return trialPeriodMonths;
    }

    public void setTrialPeriodMonths(Integer trialPeriodMonths) {
        this.trialPeriodMonths = trialPeriodMonths;
    }

    public Integer getRenewalCount() {
        return renewalCount;
    }

    public void setRenewalCount(Integer renewalCount) {
        this.renewalCount = renewalCount;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public UserProfileDTO getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserProfileDTO createdBy) {
        this.createdBy = createdBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ContractDTO)) {
            return false;
        }

        ContractDTO contractDTO = (ContractDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, contractDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ContractDTO{" +
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
            ", employee=" + getEmployee() +
            ", createdBy=" + getCreatedBy() +
            "}";
    }
}
