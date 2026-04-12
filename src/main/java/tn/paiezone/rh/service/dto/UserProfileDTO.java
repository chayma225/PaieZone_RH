package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.AppRole;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.UserProfile} entity.
 */
@Schema(description = "Profil utilisateur étendu (lié au User JHipster)")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UserProfileDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 50)
    private String jhiUserId;

    @NotNull
    private AppRole role;

    @Size(max = 20)
    private String phoneNumber;

    @Size(max = 500)
    private String avatarUrl;

    @Size(max = 10)
    private String locale;

    private Instant lastLoginAt;

    private Boolean twoFactorEnabled;

    @Size(max = 100)
    private String twoFactorSecret;

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

    public String getJhiUserId() {
        return jhiUserId;
    }

    public void setJhiUserId(String jhiUserId) {
        this.jhiUserId = jhiUserId;
    }

    public AppRole getRole() {
        return role;
    }

    public void setRole(AppRole role) {
        this.role = role;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Boolean getTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(Boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }

    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
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
        if (!(o instanceof UserProfileDTO)) {
            return false;
        }

        UserProfileDTO userProfileDTO = (UserProfileDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, userProfileDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserProfileDTO{" +
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
            ", company=" + getCompany() +
            "}";
    }
}
