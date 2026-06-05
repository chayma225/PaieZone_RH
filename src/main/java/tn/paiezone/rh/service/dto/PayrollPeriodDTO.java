package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;

public class PayrollPeriodDTO implements Serializable {

    private Long id;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    @NotNull
    @Min(2000)
    @Max(2100)
    private Integer year;

    @NotNull
    private PayrollStatus status;

    private Instant calculatedAt;
    private Instant validatedAt;
    private Instant lockedAt;
    private String closedBy;
    private Long companyId;
    private String companyName;

    // ── Agrégats calculés depuis les bulletins ───────────────────
    private java.math.BigDecimal totalGross;
    private java.math.BigDecimal totalNet;
    private Integer employeeCount;

    // ── Getters / Setters ────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer v) {
        this.month = v;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer v) {
        this.year = v;
    }

    public PayrollStatus getStatus() {
        return status;
    }

    public void setStatus(PayrollStatus v) {
        this.status = v;
    }

    public Instant getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(Instant v) {
        this.calculatedAt = v;
    }

    public Instant getValidatedAt() {
        return validatedAt;
    }

    public void setValidatedAt(Instant v) {
        this.validatedAt = v;
    }

    public Instant getLockedAt() {
        return lockedAt;
    }

    public void setLockedAt(Instant v) {
        this.lockedAt = v;
    }

    public String getClosedBy() {
        return closedBy;
    }

    public void setClosedBy(String v) {
        this.closedBy = v;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long v) {
        this.companyId = v;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String v) {
        this.companyName = v;
    }

    public java.math.BigDecimal getTotalGross() {
        return totalGross;
    }

    public void setTotalGross(java.math.BigDecimal v) {
        this.totalGross = v;
    }

    public java.math.BigDecimal getTotalNet() {
        return totalNet;
    }

    public void setTotalNet(java.math.BigDecimal v) {
        this.totalNet = v;
    }

    public Integer getEmployeeCount() {
        return employeeCount;
    }

    public void setEmployeeCount(Integer v) {
        this.employeeCount = v;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PayrollPeriodDTO)) return false;
        return id != null && id.equals(((PayrollPeriodDTO) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "PayrollPeriodDTO{id=" + id + ", month=" + month + ", year=" + year + ", status=" + status + "}";
    }
}
