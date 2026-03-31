package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.AppRole;

/**
 * Profil utilisateur étendu (lié au User JHipster)
 */
@Entity
@Table(name = "user_profile")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 50)
    @Column(name = "jhi_user_id", length = 50, nullable = false, unique = true)
    private String jhiUserId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private AppRole role;

    @Size(max = 20)
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Size(max = 500)
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Size(max = 10)
    @Column(name = "locale", length = 10)
    private String locale;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled;

    @Size(max = 100)
    @Column(name = "two_factor_secret", length = 100)
    private String twoFactorSecret;

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

    public UserProfile id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getJhiUserId() {
        return this.jhiUserId;
    }

    public UserProfile jhiUserId(String jhiUserId) {
        this.setJhiUserId(jhiUserId);
        return this;
    }

    public void setJhiUserId(String jhiUserId) {
        this.jhiUserId = jhiUserId;
    }

    public AppRole getRole() {
        return this.role;
    }

    public UserProfile role(AppRole role) {
        this.setRole(role);
        return this;
    }

    public void setRole(AppRole role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    public UserProfile phoneNumber(String phoneNumber) {
        this.setPhoneNumber(phoneNumber);
        return this;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAvatarUrl() {
        return this.avatarUrl;
    }

    public UserProfile avatarUrl(String avatarUrl) {
        this.setAvatarUrl(avatarUrl);
        return this;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getLocale() {
        return this.locale;
    }

    public UserProfile locale(String locale) {
        this.setLocale(locale);
        return this;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public Instant getLastLoginAt() {
        return this.lastLoginAt;
    }

    public UserProfile lastLoginAt(Instant lastLoginAt) {
        this.setLastLoginAt(lastLoginAt);
        return this;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Boolean getTwoFactorEnabled() {
        return this.twoFactorEnabled;
    }

    public UserProfile twoFactorEnabled(Boolean twoFactorEnabled) {
        this.setTwoFactorEnabled(twoFactorEnabled);
        return this;
    }

    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getTwoFactorSecret() {
        return this.twoFactorSecret;
    }

    public UserProfile twoFactorSecret(String twoFactorSecret) {
        this.setTwoFactorSecret(twoFactorSecret);
        return this;
    }

    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }

    public Boolean getActive() {
        return this.active;
    }

    public UserProfile active(Boolean active) {
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

    public UserProfile company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserProfile)) {
            return false;
        }
        return getId() != null && getId().equals(((UserProfile) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserProfile{" +
            "id=" + getId() +
            ", jhiUserId='" + getJhiUserId() + "'" +
            ", role='" + getRole() + "'" +
            ", phoneNumber='" + getPhoneNumber() + "'" +
            ", avatarUrl='" + getAvatarUrl() + "'" +
            ", locale='" + getLocale() + "'" +
            ", lastLoginAt='" + getLastLoginAt() + "'" +
            ", twoFactorEnabled='" + getTwoFactorEnabled() + "'" +
            ", twoFactorSecret='" + getTwoFactorSecret() + "'" +
            ", active='" + getActive() + "'" +
            "}";
    }
}
