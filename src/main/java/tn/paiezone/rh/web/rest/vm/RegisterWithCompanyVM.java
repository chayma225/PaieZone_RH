package tn.paiezone.rh.web.rest.vm;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import tn.paiezone.rh.domain.enumeration.PlanType;

/**
 * VM for the full registration flow: admin account + company in one request.
 */
public class RegisterWithCompanyVM extends ManagedUserVM {

    // ── Company fields ────────────────────────────────────────────────────────

    @NotBlank
    @Size(min = 2, max = 150)
    private String companyName;

    @NotBlank
    @Size(max = 20)
    private String taxId;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String companyEmail;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String gouvernorat;

    @Size(max = 100)
    private String city;

    @Size(max = 10)
    private String postalCode;

    private PlanType plan;

    public PlanType getPlan() {
        return plan;
    }

    public void setPlan(PlanType plan) {
        this.plan = plan;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getTaxId() {
        return taxId;
    }

    public void setTaxId(String taxId) {
        this.taxId = taxId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGouvernorat() {
        return gouvernorat;
    }

    public void setGouvernorat(String gouvernorat) {
        this.gouvernorat = gouvernorat;
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
}
