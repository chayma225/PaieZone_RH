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
import tn.paiezone.rh.domain.enumeration.AccountingEntryType;

/**
 * A AccountingEntry.
 */
@Entity
@Table(name = "accounting_entry")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AccountingEntry implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @NotNull
    @Size(max = 50)
    @Column(name = "journal_ref", length = 50, nullable = false)
    private String journalRef;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "entry_type", nullable = false)
    private AccountingEntryType entryType;

    @NotNull
    @Size(max = 300)
    @Column(name = "description", length = 300, nullable = false)
    private String description;

    @NotNull
    @Size(max = 20)
    @Column(name = "debit_account", length = 20, nullable = false)
    private String debitAccount;

    @NotNull
    @Size(max = 20)
    @Column(name = "credit_account", length = 20, nullable = false)
    private String creditAccount;

    @NotNull
    @Column(name = "amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "exported_at")
    private Instant exportedAt;

    @Size(max = 50)
    @Column(name = "export_format", length = 50)
    private String exportFormat;

    @Size(max = 100)
    @Column(name = "export_ref", length = 100)
    private String exportRef;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company", "createdBy" }, allowSetters = true)
    private PayrollPeriod payrollPeriod;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AccountingEntry id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEntryDate() {
        return this.entryDate;
    }

    public AccountingEntry entryDate(LocalDate entryDate) {
        this.setEntryDate(entryDate);
        return this;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getJournalRef() {
        return this.journalRef;
    }

    public AccountingEntry journalRef(String journalRef) {
        this.setJournalRef(journalRef);
        return this;
    }

    public void setJournalRef(String journalRef) {
        this.journalRef = journalRef;
    }

    public AccountingEntryType getEntryType() {
        return this.entryType;
    }

    public AccountingEntry entryType(AccountingEntryType entryType) {
        this.setEntryType(entryType);
        return this;
    }

    public void setEntryType(AccountingEntryType entryType) {
        this.entryType = entryType;
    }

    public String getDescription() {
        return this.description;
    }

    public AccountingEntry description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDebitAccount() {
        return this.debitAccount;
    }

    public AccountingEntry debitAccount(String debitAccount) {
        this.setDebitAccount(debitAccount);
        return this;
    }

    public void setDebitAccount(String debitAccount) {
        this.debitAccount = debitAccount;
    }

    public String getCreditAccount() {
        return this.creditAccount;
    }

    public AccountingEntry creditAccount(String creditAccount) {
        this.setCreditAccount(creditAccount);
        return this;
    }

    public void setCreditAccount(String creditAccount) {
        this.creditAccount = creditAccount;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public AccountingEntry amount(BigDecimal amount) {
        this.setAmount(amount);
        return this;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getExportedAt() {
        return this.exportedAt;
    }

    public AccountingEntry exportedAt(Instant exportedAt) {
        this.setExportedAt(exportedAt);
        return this;
    }

    public void setExportedAt(Instant exportedAt) {
        this.exportedAt = exportedAt;
    }

    public String getExportFormat() {
        return this.exportFormat;
    }

    public AccountingEntry exportFormat(String exportFormat) {
        this.setExportFormat(exportFormat);
        return this;
    }

    public void setExportFormat(String exportFormat) {
        this.exportFormat = exportFormat;
    }

    public String getExportRef() {
        return this.exportRef;
    }

    public AccountingEntry exportRef(String exportRef) {
        this.setExportRef(exportRef);
        return this;
    }

    public void setExportRef(String exportRef) {
        this.exportRef = exportRef;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public AccountingEntry company(Company company) {
        this.setCompany(company);
        return this;
    }

    public PayrollPeriod getPayrollPeriod() {
        return this.payrollPeriod;
    }

    public void setPayrollPeriod(PayrollPeriod payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
    }

    public AccountingEntry payrollPeriod(PayrollPeriod payrollPeriod) {
        this.setPayrollPeriod(payrollPeriod);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AccountingEntry)) {
            return false;
        }
        return getId() != null && getId().equals(((AccountingEntry) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AccountingEntry{" +
            "id=" + getId() +
            ", entryDate='" + getEntryDate() + "'" +
            ", journalRef='" + getJournalRef() + "'" +
            ", entryType='" + getEntryType() + "'" +
            ", description='" + getDescription() + "'" +
            ", debitAccount='" + getDebitAccount() + "'" +
            ", creditAccount='" + getCreditAccount() + "'" +
            ", amount=" + getAmount() +
            ", exportedAt='" + getExportedAt() + "'" +
            ", exportFormat='" + getExportFormat() + "'" +
            ", exportRef='" + getExportRef() + "'" +
            "}";
    }
}
