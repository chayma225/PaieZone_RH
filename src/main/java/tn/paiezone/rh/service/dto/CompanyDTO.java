package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Schema(description = "Entreprise = Tenant SaaS")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CompanyDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 2, max = 150)
    private String name;

    @Size(max = 150)
    private String tradeName;

    @NotNull
    @Size(max = 20)
    private String taxId;

    @Size(max = 20)
    private String cnssId;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 10)
    private String postalCode;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String email;

    @Size(max = 500)
    private String logoUrl;

    // ✅ @NotNull supprimé — généré automatiquement par le backend
    @Size(max = 63)
    private String tenantSchema;

    // ✅ @NotNull supprimé — géré automatiquement par le backend
    private Boolean active;

    private LocalDate trialEnd;

    // ✅ @NotNull supprimé — généré automatiquement par le backend
    private Instant createdAt;

    private CompanySubscriptionDTO companySubscription;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTradeName() {
        return tradeName;
    }

    public void setTradeName(String tradeName) {
        this.tradeName = tradeName;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getCnssId() {
        return cnssId;
    }

    public void setCnssId(String cnssId) {
        this.cnssId = cnssId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public String getTenantSchema() {
        return tenantSchema;
    }

    public void setTenantSchema(String tenantSchema) {
        this.tenantSchema = tenantSchema;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDate getTrialEnd() {
        return trialEnd;
    }

    public void setTrialEnd(LocalDate trialEnd) {
        this.trialEnd = trialEnd;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public CompanySubscriptionDTO getCompanySubscription() {
        return companySubscription;
    }

    public void setCompanySubscription(CompanySubscriptionDTO companySubscription) {
        this.companySubscription = companySubscription;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CompanyDTO)) return false;
        CompanyDTO companyDTO = (CompanyDTO) o;
        if (this.id == null) return false;
        return Objects.equals(this.id, companyDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    @Override
    public String toString() {
        return "CompanyDTO{" +
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
            ", companySubscription=" + getCompanySubscription() +
            "}";
    }
}
