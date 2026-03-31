package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Plan comptable de l'entreprise
 */
@Entity
@Table(name = "account_plan")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class AccountPlan implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "account_code", length = 20, nullable = false)
    private String accountCode;

    @NotNull
    @Size(max = 200)
    @Column(name = "account_label", length = 200, nullable = false)
    private String accountLabel;

    @Size(max = 200)
    @Column(name = "account_label_ar", length = 200)
    private String accountLabelAr;

    @Size(max = 50)
    @Column(name = "account_type", length = 50)
    private String accountType;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public AccountPlan id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountCode() {
        return this.accountCode;
    }

    public AccountPlan accountCode(String accountCode) {
        this.setAccountCode(accountCode);
        return this;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public String getAccountLabel() {
        return this.accountLabel;
    }

    public AccountPlan accountLabel(String accountLabel) {
        this.setAccountLabel(accountLabel);
        return this;
    }

    public void setAccountLabel(String accountLabel) {
        this.accountLabel = accountLabel;
    }

    public String getAccountLabelAr() {
        return this.accountLabelAr;
    }

    public AccountPlan accountLabelAr(String accountLabelAr) {
        this.setAccountLabelAr(accountLabelAr);
        return this;
    }

    public void setAccountLabelAr(String accountLabelAr) {
        this.accountLabelAr = accountLabelAr;
    }

    public String getAccountType() {
        return this.accountType;
    }

    public AccountPlan accountType(String accountType) {
        this.setAccountType(accountType);
        return this;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Boolean getActive() {
        return this.active;
    }

    public AccountPlan active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public AccountPlan company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof AccountPlan)) {
            return false;
        }
        return getId() != null && getId().equals(((AccountPlan) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "AccountPlan{" +
            "id=" + getId() +
            ", accountCode='" + getAccountCode() + "'" +
            ", accountLabel='" + getAccountLabel() + "'" +
            ", accountLabelAr='" + getAccountLabelAr() + "'" +
            ", accountType='" + getAccountType() + "'" +
            ", active='" + getActive() + "'" +
            "}";
    }
}
