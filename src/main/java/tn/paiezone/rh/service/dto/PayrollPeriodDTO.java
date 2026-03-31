package tn.paiezone.rh.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.PayrollPeriod} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PayrollPeriodDTO implements Serializable {

    private Long id;

    @NotNull
    @Min(value = 1)
    @Max(value = 12)
    private Integer month;

    @NotNull
    private Integer year;

    @NotNull
    private PayrollStatus status;

    private Instant calculatedAt;

    private Instant validatedAt;

    private Instant lockedAt;

    @Lob
    private String notes;

    @NotNull
    private CompanyDTO company;

    private UserProfileDTO createdBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public PayrollStatus getStatus() {
        return status;
    }

    public void setStatus(PayrollStatus status) {
        this.status = status;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant calculatedAt) {
        this.calculatedAt = calculatedAt;
    }

    public Instant getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(Instant validatedAt) {
        this.validatedAt = validatedAt;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public void setLockedAt(Instant lockedAt) {
        this.lockedAt = lockedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public CompanyDTO getCompany() {
        return company;
    }

    public void setCompany(CompanyDTO company) {
        this.company = company;
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
        if (!(o instanceof PayrollPeriodDTO)) {
            return false;
        }

        PayrollPeriodDTO payrollPeriodDTO = (PayrollPeriodDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, payrollPeriodDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PayrollPeriodDTO{" +
            "id=" + getId() +
            ", month=" + getMonth() +
            ", year=" + getYear() +
            ", status='" + getStatus() + "'" +
            ", calculatedAt='" + getCalculatedAt() + "'" +
            ", validatedAt='" + getValidatedAt() + "'" +
            ", lockedAt='" + getLockedAt() + "'" +
            ", notes='" + getNotes() + "'" +
            ", company=" + getCompany() +
            ", createdBy=" + getCreatedBy() +
            "}";
    }
}
