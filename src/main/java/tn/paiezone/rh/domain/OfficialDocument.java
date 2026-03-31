package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.OfficialDocType;

/**
 * A OfficialDocument.
 */
@Entity
@Table(name = "official_document")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class OfficialDocument implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false)
    private OfficialDocType docType;

    @NotNull
    @Size(max = 200)
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Min(value = 1)
    @Max(value = 12)
    @Column(name = "month")
    private Integer month;

    @NotNull
    @Column(name = "year", nullable = false)
    private Integer year;

    @NotNull
    @Column(name = "generated_at", nullable = false)
    private Instant generatedAt;

    @Size(max = 500)
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Size(max = 100)
    @Column(name = "signed_by", length = 100)
    private String signedBy;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile generatedBy;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public OfficialDocument id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OfficialDocType getDocType() {
        return this.docType;
    }

    public OfficialDocument docType(OfficialDocType docType) {
        this.setDocType(docType);
        return this;
    }

    public void setDocType(OfficialDocType docType) {
        this.docType = docType;
    }

    public String getTitle() {
        return this.title;
    }

    public OfficialDocument title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getMonth() {
        return this.month;
    }

    public OfficialDocument month(Integer month) {
        this.setMonth(month);
        return this;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return this.year;
    }

    public OfficialDocument year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Instant getGeneratedAt() {
        return this.generatedAt;
    }

    public OfficialDocument generatedAt(Instant generatedAt) {
        this.setGeneratedAt(generatedAt);
        return this;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getFileUrl() {
        return this.fileUrl;
    }

    public OfficialDocument fileUrl(String fileUrl) {
        this.setFileUrl(fileUrl);
        return this;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getSignedBy() {
        return this.signedBy;
    }

    public OfficialDocument signedBy(String signedBy) {
        this.setSignedBy(signedBy);
        return this;
    }

    public void setSignedBy(String signedBy) {
        this.signedBy = signedBy;
    }

    public Instant getSentAt() {
        return this.sentAt;
    }

    public OfficialDocument sentAt(Instant sentAt) {
        this.setSentAt(sentAt);
        return this;
    }

    public void setSentAt(Instant sentAt) {
        this.sentAt = sentAt;
    }

    public String getNotes() {
        return this.notes;
    }

    public OfficialDocument notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public OfficialDocument company(Company company) {
        this.setCompany(company);
        return this;
    }

    public Employee getEmployee() {
        return this.employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public OfficialDocument employee(Employee employee) {
        this.setEmployee(employee);
        return this;
    }

    public UserProfile getGeneratedBy() {
        return this.generatedBy;
    }

    public void setGeneratedBy(UserProfile userProfile) {
        this.generatedBy = userProfile;
    }

    public OfficialDocument generatedBy(UserProfile userProfile) {
        this.setGeneratedBy(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OfficialDocument)) {
            return false;
        }
        return getId() != null && getId().equals(((OfficialDocument) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "OfficialDocument{" +
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
            "}";
    }
}
