package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Entreprise = Tenant SaaS
 */
@Entity
@Table(name = "company")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Company implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(min = 2, max = 150)
    @Column(name = "name", length = 150, nullable = false)
    private String name;

    @Size(max = 150)
    @Column(name = "trade_name", length = 150)
    private String tradeName;

    @NotNull
    @Size(max = 20)
    @Column(name = "tax_id", length = 20, nullable = false, unique = true)
    private String taxId;

    @Size(max = 20)
    @Column(name = "cnss_id", length = 20)
    private String cnssId;

    @Size(max = 255)
    @Column(name = "address", length = 255)
    private String address;

    @Size(max = 100)
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 10)
    @Column(name = "postal_code", length = 10)
    private String postalCode;

    @Size(max = 20)
    @Column(name = "phone", length = 20)
    private String phone;

    @Size(max = 100)
    @Column(name = "email", length = 100)
    private String email;

    @Size(max = 500)
    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @NotNull
    @Size(max = 63)
    @Column(name = "tenant_schema", length = 63, nullable = false, unique = true)
    private String tenantSchema;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "trial_end")
    private LocalDate trialEnd;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(unique = true)
    private CompanySubscription companySubscription;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Company id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return this.name;
    }

    public Company name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTradeName() {
        return this.tradeName;
    }

    public Company tradeName(String tradeName) {
        this.setTradeName(tradeName);
        return this;
    }

    public void setTradeName(String tradeName) {
        this.tradeName = tradeName;
    }

    public String getTaxId() {
        return this.taxId;
    }

    public Company taxId(String taxId) {
        this.setTaxId(taxId);
        return this;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getCnssId() {
        return this.cnssId;
    }

    public Company cnssId(String cnssId) {
        this.setCnssId(cnssId);
        return this;
    }

    public void setCnssId(String cnssId) {
        this.cnssId = cnssId;
    }

    public String getAddress() {
        return this.address;
    }

    public Company address(String address) {
        this.setAddress(address);
        return this;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return this.city;
    }

    public Company city(String city) {
        this.setCity(city);
        return this;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return this.postalCode;
    }

    public Company postalCode(String postalCode) {
        this.setPostalCode(postalCode);
        return this;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getPhone() {
        return this.phone;
    }

    public Company phone(String phone) {
        this.setPhone(phone);
        return this;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return this.email;
    }

    public Company email(String email) {
        this.setEmail(email);
        return this;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogoUrl() {
        return this.logoUrl;
    }

    public Company logoUrl(String logoUrl) {
        this.setLogoUrl(logoUrl);
        return this;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getTenantSchema() {
        return this.tenantSchema;
    }

    public Company tenantSchema(String tenantSchema) {
        this.setTenantSchema(tenantSchema);
        return this;
    }

    public void setTenantSchema(String tenantSchema) {
        this.tenantSchema = tenantSchema;
    }

    public Boolean getActive() {
        return this.active;
    }

    public Company active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDate getTrialEnd() {
        return this.trialEnd;
    }

    public Company trialEnd(LocalDate trialEnd) {
        this.setTrialEnd(trialEnd);
        return this;
    }

    public void setTrialEnd(LocalDate trialEnd) {
        this.trialEnd = trialEnd;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Company createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public CompanySubscription getCompanySubscription() {
        return this.companySubscription;
    }

    public void setCompanySubscription(CompanySubscription companySubscription) {
        this.companySubscription = companySubscription;
    }

    public Company companySubscription(CompanySubscription companySubscription) {
        this.setCompanySubscription(companySubscription);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Company)) {
            return false;
        }
        return getId() != null && getId().equals(((Company) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Company{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", tradeName='" + getTradeName() + "'" +
            ", taxId='" + getTaxId() + "'" +
            ", cnssId='" + getCnssId() + "'" +
            ", address='" + getAddress() + "'" +
            ", city='" + getCity() + "'" +
            ", postalCode='" + getPostalCode() + "'" +
            ", phone='" + getPhone() + "'" +
            ", email='" + getEmail() + "'" +
            ", logoUrl='" + getLogoUrl() + "'" +
            ", tenantSchema='" + getTenantSchema() + "'" +
            ", active='" + getActive() + "'" +
            ", trialEnd='" + getTrialEnd() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
