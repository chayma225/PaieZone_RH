package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;
import tn.paiezone.rh.domain.enumeration.OfficialDocType;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.OfficialDocument} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class OfficialDocumentDTO implements Serializable {

    private Long id;

    @NotNull
    private OfficialDocType docType;

    @NotNull
    @Size(max = 200)
    private String title;

    @Min(value = 1)
    @Max(value = 12)
    private Integer month;

    @NotNull
    private Integer year;

    private Instant generatedAt;

    @Size(max = 500)
    private String fileUrl;

    @Size(max = 100)
    private String signedBy;

    private Instant sentAt;

    @Size(max = 500)
    private String notes;

    @NotNull
    private CompanyDTO company;

    private EmployeeDTO employee;

    private UserProfileDTO generatedBy;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OfficialDocType getDocType() {
        return docType;
    }

    public void setDocType(OfficialDocType docType) {
        this.docType = docType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getSignedBy() {
        return signedBy;
    }

    public void setSignedBy(String signedBy) {
        this.signedBy = signedBy;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public CompanyDTO getCompany() {
        return company;
    }

    public void setCompany(CompanyDTO company) {
        this.company = company;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    public UserProfileDTO getGeneratedBy() {
        return generatedBy;
    }

    public void setGeneratedBy(UserProfileDTO generatedBy) {
        this.generatedBy = generatedBy;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OfficialDocumentDTO)) {
            return false;
        }

        OfficialDocumentDTO officialDocumentDTO = (OfficialDocumentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, officialDocumentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "OfficialDocumentDTO{" +
            "id=" + getId() +
            ", docType='" + getDocType() + "'" +
            ", title='" + getTitle() + "'" +
            ", month=" + getMonth() +
            ", year=" + getYear() +
            ", generatedAt='" + getGeneratedAt() + "'" +
            ", fileUrl='" + getFileUrl() + "'" +
            ", signedBy='" + getSignedBy() + "'" +
            ", sentAt='" + getSentAt() + "'" +
            ", notes='" + getNotes() + "'" +
            ", company=" + getCompany() +
            ", employee=" + getEmployee() +
            ", generatedBy=" + getGeneratedBy() +
            "}";
    }
}
