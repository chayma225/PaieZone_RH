package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.LeaveBalance} entity.
 */
@Schema(description = "Solde de congés par employé et par type")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class LeaveBalanceDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer year;

    @NotNull
    private BigDecimal entitled;

    @NotNull
    private BigDecimal taken;

    @NotNull
    private BigDecimal pending;

    @NotNull
    private BigDecimal carryOver;

    @NotNull
    private BigDecimal remaining;

    @NotNull
    private Instant lastUpdatedAt;

    @NotNull
    private EmployeeDTO employee;

    @NotNull
    private LeaveTypeDTO leaveType;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getEntitled() {
        return entitled;
    }

    public void setEntitled(BigDecimal entitled) {
        this.entitled = entitled;
    }

    public BigDecimal getTaken() {
        return taken;
    }

    public void setTaken(BigDecimal taken) {
        this.taken = taken;
    }

    public BigDecimal getPending() {
        return pending;
    }

    public void setPending(BigDecimal pending) {
        this.pending = pending;
    }

    public BigDecimal getCarryOver() {
        return carryOver;
    }

    public void setCarryOver(BigDecimal carryOver) {
        this.carryOver = carryOver;
    }

    public BigDecimal getRemaining() {
        return remaining;
    }

    public void setRemaining(BigDecimal remaining) {
        this.remaining = remaining;
    }

    public Instant getLastUpdatedAt() {
        return lastUpdatedAt;
    }

    public void setLastUpdatedAt(Instant lastUpdatedAt) {
        this.lastUpdatedAt = lastUpdatedAt;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public LeaveTypeDTO getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(LeaveTypeDTO leaveType) {
        this.leaveType = leaveType;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof LeaveBalanceDTO)) {
            return false;
        }

        LeaveBalanceDTO leaveBalanceDTO = (LeaveBalanceDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, leaveBalanceDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "LeaveBalanceDTO{" +
            "id=" + getId() +
            ", year=" + getYear() +
            ", entitled=" + getEntitled() +
            ", taken=" + getTaken() +
            ", pending=" + getPending() +
            ", carryOver=" + getCarryOver() +
            ", remaining=" + getRemaining() +
            ", lastUpdatedAt='" + getLastUpdatedAt() + "'" +
            ", employee=" + getEmployee() +
            ", leaveType=" + getLeaveType() +
            "}";
    }
}
