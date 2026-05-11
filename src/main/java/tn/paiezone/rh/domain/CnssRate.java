package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Taux CNSS
 */
@Entity
@Table(name = "cnss_rate")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")@Getter
@Setter
@NoArgsConstructor

public class CnssRate implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cnssRateSeq")
    @SequenceGenerator(name = "cnssRateSeq", sequenceName = "cnss_rate_seq", allocationSize = 1)
    private Long id;

    @Column(name = "year", nullable = false)
    private Integer year;

    // Plafond mensuel CNSS (ex: 2700 DT en 2024)
    @Column(name = "salary_ceiling", nullable = false, precision = 15, scale = 3)
    private BigDecimal salaryCeiling;

    // 9,18% = 0.0918
    @Column(name = "employee_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal employeeRate;

    // 16,57% = 0.1657
    @Column(name = "employer_rate", nullable = false, precision = 6, scale = 4)
    private BigDecimal employerRate;

    // CAVIS salarié 1% = 0.0100
    @Column(name = "cavis_employee", precision = 6, scale = 4)
    private BigDecimal cavisEmployee;

    // CAVIS patronal 1% = 0.0100
    @Column(name = "cavis_employer", precision = 6, scale = 4)
    private BigDecimal cavisEmployer;

    // SMIG mensuel (ex: 450 DT en 2024)
    @Column(name = "smig", precision = 15, scale = 3)
    private BigDecimal smig;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "companySubscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CnssRate id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getYear() {
        return this.year;
    }

    public CnssRate year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getSalaryCeiling() {
        return this.salaryCeiling;
    }

    public CnssRate salaryCeiling(BigDecimal salaryCeiling) {
        this.setSalaryCeiling(salaryCeiling);
        return this;
    }

    public void setSalaryCeiling(BigDecimal salaryCeiling) {
        this.salaryCeiling = salaryCeiling;
    }

    public BigDecimal getEmployeeRate() {
        return this.employeeRate;
    }

    public CnssRate employeeRate(BigDecimal employeeRate) {
        this.setEmployeeRate(employeeRate);
        return this;
    }

    public void setEmployeeRate(BigDecimal employeeRate) {
        this.employeeRate = employeeRate;
    }

    public BigDecimal getEmployerRate() {
        return this.employerRate;
    }

    public CnssRate employerRate(BigDecimal employerRate) {
        this.setEmployerRate(employerRate);
        return this;
    }

    public void setEmployerRate(BigDecimal employerRate) {
        this.employerRate = employerRate;
    }

    public BigDecimal getCavisEmployee() {
        return this.cavisEmployee;
    }

    public CnssRate cavisEmployee(BigDecimal cavisEmployee) {
        this.setCavisEmployee(cavisEmployee);
        return this;
    }

    public void setCavisEmployee(BigDecimal cavisEmployee) {
        this.cavisEmployee = cavisEmployee;
    }

    public BigDecimal getCavisEmployer() {
        return this.cavisEmployer;
    }

    public CnssRate cavisEmployer(BigDecimal cavisEmployer) {
        this.setCavisEmployer(cavisEmployer);
        return this;
    }

    public void setCavisEmployer(BigDecimal cavisEmployer) {
        this.cavisEmployer = cavisEmployer;
    }

    public BigDecimal getSmig() {
        return this.smig;
    }

    public CnssRate smig(BigDecimal smig) {
        this.setSmig(smig);
        return this;
    }

    public void setSmig(BigDecimal smig) {
        this.smig = smig;
    }

    public LocalDate getEffectiveFrom() {
        return this.effectiveFrom;
    }

    public CnssRate effectiveFrom(LocalDate effectiveFrom) {
        this.setEffectiveFrom(effectiveFrom);
        return this;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public CnssRate company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CnssRate)) {
            return false;
        }
        return getId() != null && getId().equals(((CnssRate) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CnssRate{" +
            "id=" + getId() +
            ", year=" + getYear() +
            ", salaryCeiling=" + getSalaryCeiling() +
            ", employeeRate=" + getEmployeeRate() +
            ", employerRate=" + getEmployerRate() +
            ", cavisEmployee=" + getCavisEmployee() +
            ", cavisEmployer=" + getCavisEmployer() +
            ", smig=" + getSmig() +
            ", effectiveFrom='" + getEffectiveFrom() + "'" +
            "}";
    }
}
