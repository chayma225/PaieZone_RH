package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.LeaveTypeName;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.LeaveType} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveTypeDTO implements Serializable {

    private Long id;

    @NotNull
    private LeaveTypeName name;

    @NotNull
    @Size(max = 100)
    private String label;

    @NotNull
    private Integer maxDaysPerYear;

    @NotNull
    @Min(value = 0)
    private Integer carryOverDays;

    @NotNull
    private Boolean paid;

    @NotNull
    private Boolean requiresMedical;

    @NotNull
    private Boolean active;

    @NotNull
    private CompanyDTO company;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LeaveTypeName getName() {
        return name;
    }

    public void setName(LeaveTypeName name) {
        this.name = name;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public Integer getMaxDaysPerYear() {
        return maxDaysPerYear;
    }

    public void setMaxDaysPerYear(Integer maxDaysPerYear) {
        this.maxDaysPerYear = maxDaysPerYear;
    }

    public Integer getCarryOverDays() {
        return carryOverDays;
    }

    public void setCarryOverDays(Integer carryOverDays) {
        this.carryOverDays = carryOverDays;
    }

    public Boolean getPaid() {
        return paid;
    }

    public void setPaid(Boolean paid) {
        this.paid = paid;
    }

    public Boolean getRequiresMedical() {
        return requiresMedical;
    }

    public void setRequiresMedical(Boolean requiresMedical) {
        this.requiresMedical = requiresMedical;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public CompanyDTO getCompany() {
        return company;
    }

    public void setCompany(CompanyDTO company) {
        this.company = company;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LeaveTypeDTO)) {
            return false;
        }

        LeaveTypeDTO leaveTypeDTO = (LeaveTypeDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, leaveTypeDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveTypeDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", label='" + getLabel() + "'" +
            ", maxDaysPerYear=" + getMaxDaysPerYear() +
            ", carryOverDays=" + getCarryOverDays() +
            ", paid='" + getPaid() + "'" +
            ", requiresMedical='" + getRequiresMedical() + "'" +
            ", active='" + getActive() + "'" +
            ", company=" + getCompany() +
            "}";
    }
}
