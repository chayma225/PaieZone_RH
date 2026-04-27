package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.DocumentType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.HrDocument} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HrDocumentDTO implements Serializable {

    private Long id;

    @NotNull
    private DocumentType documentType;

    @NotNull
    @Size(max = 200)
    private String title;

    @Size(max = 500)
    private String description;

    @Size(max = 500)
    private String fileUrl;

    private Long fileSize;

    @Size(max = 100)
    private String mimeType;

    private Instant uploadedAt;

    private LocalDate expiryDate;

    @NotNull
    private Boolean active;

    @NotNull
    private EmployeeDTO employee;

    private UserProfileDTO uploadedBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Instant getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public UserProfileDTO getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(UserProfileDTO uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HrDocumentDTO)) {
            return false;
        }

        HrDocumentDTO hrDocumentDTO = (HrDocumentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, hrDocumentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HrDocumentDTO{" +
            "id=" + getId() +
            ", documentType='" + getDocumentType() + "'" +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", fileUrl='" + getFileUrl() + "'" +
            ", fileSize=" + getFileSize() +
            ", mimeType='" + getMimeType() + "'" +
            ", uploadedAt='" + getUploadedAt() + "'" +
            ", expiryDate='" + getExpiryDate() + "'" +
            ", active='" + getActive() + "'" +
            ", employee=" + getEmployee() +
            ", uploadedBy=" + getUploadedBy() +
            "}";
    }
}
