package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.AccountingEntryType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.AccountingEntry} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AccountingEntryDTO implements Serializable {

    private Long id;

    @NotNull
    private LocalDate entryDate;

    @NotNull
    @Size(max = 50)
    private String journalRef;

    @NotNull
    private AccountingEntryType entryType;

    @NotNull
    @Size(max = 300)
    private String description;

    @NotNull
    @Size(max = 20)
    private String debitAccount;

    @NotNull
    @Size(max = 20)
    private String creditAccount;

    @NotNull
    private BigDecimal amount;

    private Instant exportedAt;

    @Size(max = 50)
    private String exportFormat;

    @Size(max = 100)
    private String exportRef;

    @NotNull
    private CompanyDTO company;

    private PayrollPeriodDTO payrollPeriod;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(LocalDate entryDate) {
        this.entryDate = entryDate;
    }

    public String getJournalRef() {
        return journalRef;
    }

    public void setJournalRef(String journalRef) {
        this.journalRef = journalRef;
    }

    public AccountingEntryType getEntryType() {
        return entryType;
    }

    public void setEntryType(AccountingEntryType entryType) {
        this.entryType = entryType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDebitAccount() {
        return debitAccount;
    }

    public void setDebitAccount(String debitAccount) {
        this.debitAccount = debitAccount;
    }

    public String getCreditAccount() {
        return creditAccount;
    }

    public void setCreditAccount(String creditAccount) {
        this.creditAccount = creditAccount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getExportedAt() {
        return exportedAt;
    }

    public void setExportedAt(Instant exportedAt) {
        this.exportedAt = exportedAt;
    }

    public String getExportFormat() {
        return exportFormat;
    }

    public void setExportFormat(String exportFormat) {
        this.exportFormat = exportFormat;
    }

    public String getExportRef() {
        return exportRef;
    }

    public void setExportRef(String exportRef) {
        this.exportRef = exportRef;
    }

    public CompanyDTO getCompany() {
        return company;
    }

    public void setCompany(CompanyDTO company) {
        this.company = company;
    }

    public PayrollPeriodDTO getPayrollPeriod() {
        return payrollPeriod;
    }

    public void setPayrollPeriod(PayrollPeriodDTO payrollPeriod) {
        this.payrollPeriod = payrollPeriod;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AccountingEntryDTO)) {
            return false;
        }

        AccountingEntryDTO accountingEntryDTO = (AccountingEntryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, accountingEntryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AccountingEntryDTO{" +
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
            ", company=" + getCompany() +
            ", payrollPeriod=" + getPayrollPeriod() +
            "}";
    }
}
