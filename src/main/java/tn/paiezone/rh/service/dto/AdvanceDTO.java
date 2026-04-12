package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.Advance} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AdvanceDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate requestDate;

    @NotNull
    private BigDecimal amount;

    @Min(value = 1)
    @Max(value = 12)
    private Integer deductionMonth;

    private Integer deductionYear;

    @NotNull
    private AdvanceStatus status;

    @Size(max = 100)
    private String approvedBy;

    @Size(max = 500)
    private String notes;

    @NotNull
    private EmployeeDTO employee;

    private PaySlipDTO paySlip;

    private UserProfileDTO approvedByUser;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDate requestDate) {
        this.requestDate = requestDate;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Integer getDeductionMonth() {
        return deductionMonth;
    }

    public void setDeductionMonth(Integer deductionMonth) {
        this.deductionMonth = deductionMonth;
    }

    public Integer getDeductionYear() {
        return deductionYear;
    }

    public void setDeductionYear(Integer deductionYear) {
        this.deductionYear = deductionYear;
    }

    public AdvanceStatus getStatus() {
        return status;
    }

    public void setStatus(AdvanceStatus status) {
        this.status = status;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
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

    public UserProfileDTO getApprovedByUser() {
        return approvedByUser;
    }

    public void setApprovedByUser(UserProfileDTO approvedByUser) {
        this.approvedByUser = approvedByUser;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AdvanceDTO)) {
            return false;
        }

        AdvanceDTO advanceDTO = (AdvanceDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, advanceDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AdvanceDTO{" +
            "id=" + getId() +
            ", requestDate='" + getRequestDate() + "'" +
            ", amount=" + getAmount() +
            ", deductionMonth=" + getDeductionMonth() +
            ", deductionYear=" + getDeductionYear() +
            ", status='" + getStatus() + "'" +
            ", approvedBy='" + getApprovedBy() + "'" +
            ", notes='" + getNotes() + "'" +
            ", employee=" + getEmployee() +
            ", paySlip=" + getPaySlip() +
            ", approvedByUser=" + getApprovedByUser() +
            "}";
    }
}
