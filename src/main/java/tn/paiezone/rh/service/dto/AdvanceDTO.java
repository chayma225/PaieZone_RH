package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;

public class AdvanceDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate requestDate;

    @NotNull
    private BigDecimal amount;

    private String reason;

    @Min(1)
    @Max(12)
    private Integer deductionMonth;

    private Integer deductionYear;

    @NotNull
    private AdvanceStatus status;

    @Size(max = 100)
    private String approvedBy;

    private Instant approvedAt;

    @Size(max = 500)
    private String notes;

    // ✅ Relations IDs (style JHipster)
    private Long employeeId;
    private Long paySlipId;

    // ── Getters / Setters ──────────────────────────────────────────

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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Long getPaySlipId() {
        return paySlipId;
    }

    public void setPaySlipId(Long paySlipId) {
        this.paySlipId = paySlipId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AdvanceDTO)) return false;
        return id != null && id.equals(((AdvanceDTO) o).id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "AdvanceDTO{id=" + id + ", amount=" + amount + ", status=" + status + "}";
    }
}
