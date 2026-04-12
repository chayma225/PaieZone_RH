package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.AccountPlan} entity.
 */
@Schema(description = "Plan comptable de l'entreprise")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AccountPlanDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 20)
    private String accountCode;

    @NotNull
    @Size(max = 200)
    private String accountLabel;

    @Size(max = 200)
    private String accountLabelAr;

    @Size(max = 50)
    private String accountType;

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

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public String getAccountLabel() {
        return accountLabel;
    }

    public void setAccountLabel(String accountLabel) {
        this.accountLabel = accountLabel;
    }

    public String getAccountLabelAr() {
        return accountLabelAr;
    }

    public void setAccountLabelAr(String accountLabelAr) {
        this.accountLabelAr = accountLabelAr;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
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
        if (!(o instanceof AccountPlanDTO)) {
            return false;
        }

        AccountPlanDTO accountPlanDTO = (AccountPlanDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, accountPlanDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AccountPlanDTO{" +
            "id=" + getId() +
            ", accountCode='" + getAccountCode() + "'" +
            ", accountLabel='" + getAccountLabel() + "'" +
            ", accountLabelAr='" + getAccountLabelAr() + "'" +
            ", accountType='" + getAccountType() + "'" +
            ", active='" + getActive() + "'" +
            ", company=" + getCompany() +
            "}";
    }
}
