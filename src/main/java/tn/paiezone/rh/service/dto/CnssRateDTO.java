package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.CnssRate} entity.
 */
@Schema(description = "Taux CNSS")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CnssRateDTO implements Serializable {

    private Long id;

    @NotNull
    private Integer year;

    private BigDecimal salaryCeiling;

    @NotNull
    private BigDecimal employeeRate;

    @NotNull
    private BigDecimal employerRate;

    private BigDecimal cavisEmployee;

    private BigDecimal cavisEmployer;

    @NotNull
    private BigDecimal smig;

    @NotNull
    private LocalDate effectiveFrom;

    private CompanyDTO company;

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

    public BigDecimal getSalaryCeiling() {
        return salaryCeiling;
    }

    public void setSalaryCeiling(BigDecimal salaryCeiling) {
        this.salaryCeiling = salaryCeiling;
    }

    public BigDecimal getEmployeeRate() {
        return employeeRate;
    }

    public void setEmployeeRate(BigDecimal employeeRate) {
        this.employeeRate = employeeRate;
    }

    public BigDecimal getEmployerRate() {
        return employerRate;
    }

    public void setEmployerRate(BigDecimal employerRate) {
        this.employerRate = employerRate;
    }

    public BigDecimal getCavisEmployee() {
        return cavisEmployee;
    }

    public void setCavisEmployee(BigDecimal cavisEmployee) {
        this.cavisEmployee = cavisEmployee;
    }

    public BigDecimal getCavisEmployer() {
        return cavisEmployer;
    }

    public void setCavisEmployer(BigDecimal cavisEmployer) {
        this.cavisEmployer = cavisEmployer;
    }

    public BigDecimal getSmig() {
        return smig;
    }

    public void setSmig(BigDecimal smig) {
        this.smig = smig;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
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
        if (!(o instanceof CnssRateDTO)) {
            return false;
        }

        CnssRateDTO cnssRateDTO = (CnssRateDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, cnssRateDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CnssRateDTO{" +
            "id=" + getId() +
            ", year=" + getYear() +
            ", salaryCeiling=" + getSalaryCeiling() +
            ", employeeRate=" + getEmployeeRate() +
            ", employerRate=" + getEmployerRate() +
            ", cavisEmployee=" + getCavisEmployee() +
            ", cavisEmployer=" + getCavisEmployer() +
            ", smig=" + getSmig() +
            ", effectiveFrom='" + getEffectiveFrom() + "'" +
            ", company=" + getCompany() +
            "}";
    }
}
