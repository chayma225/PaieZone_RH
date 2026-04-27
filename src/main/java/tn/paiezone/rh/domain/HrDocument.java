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
import org.hibernate.annotations.JdbcType;
import org.hibernate.type.descriptor.jdbc.VarbinaryJdbcType;
import tn.paiezone.rh.domain.enumeration.DocumentType;

/**
 * A HrDocument.
 */
@Entity
@Table(name = "hr_document")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class HrDocument implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    private DocumentType documentType;

    @NotNull
    @Size(max = 200)
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Lob
    @JdbcType(VarbinaryJdbcType.class)
    @Column(name = "file_data")
    private byte[] fileData;

    @Column(name = "file_data_content_type")
    private String fileDataContentType;

    @Size(max = 500)
    @Column(name = "file_url", length = 500, nullable = true)
    private String fileUrl;

    @Column(name = "file_size")
    private Long fileSize;

    @Size(max = 100)
    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @NotNull
    @Column(name = "uploaded_at", nullable = false)
    private Instant uploadedAt;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile uploadedBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public HrDocument id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentType getDocumentType() {
        return this.documentType;
    }

    public HrDocument documentType(DocumentType documentType) {
        this.setDocumentType(documentType);
        return this;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getTitle() {
        return this.title;
    }

    public HrDocument title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return this.description;
    }

    public HrDocument description(String description) {
        this.setDescription(description);
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileUrl() {
        return this.fileUrl;
    }

    public HrDocument fileUrl(String fileUrl) {
        this.setFileUrl(fileUrl);
        return this;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Long getFileSize() {
        return this.fileSize;
    }

    public HrDocument fileSize(Long fileSize) {
        this.setFileSize(fileSize);
        return this;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return this.mimeType;
    }

    public HrDocument mimeType(String mimeType) {
        this.setMimeType(mimeType);
        return this;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Instant getUploadedAt() {
        return this.uploadedAt;
    }

    public HrDocument uploadedAt(Instant uploadedAt) {
        this.setUploadedAt(uploadedAt);
        return this;
    }

    public void setUploadedAt(Instant uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDate getExpiryDate() {
        return this.expiryDate;
    }

    public HrDocument expiryDate(LocalDate expiryDate) {
        this.setExpiryDate(expiryDate);
        return this;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getActive() {
        return this.active;
    }

    public HrDocument active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public HrDocument employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public UserProfile getUploadedBy() {
        return this.uploadedBy;
    }

    public void setUploadedBy(UserProfile userProfile) {
        this.uploadedBy = userProfile;
    }

    public HrDocument uploadedBy(UserProfile userProfile) {
        this.setUploadedBy(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof HrDocument)) {
            return false;
        }
        return getId() != null && getId().equals(((HrDocument) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    @PrePersist
    public void prePersist() {
        if (this.uploadedAt == null) {
            this.uploadedAt = Instant.now();
        }
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "HrDocument{" +
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
            "}";
    }
}
