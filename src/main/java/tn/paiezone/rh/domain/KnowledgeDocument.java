package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Documents indexés pour le RAG
 */
@Entity
@Table(name = "knowledge_document")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class KnowledgeDocument implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 200)
    @Column(name = "title", length = 200, nullable = false)
    private String title;

    @Size(max = 100)
    @Column(name = "category", length = 100)
    private String category;

    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @Size(max = 500)
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @NotNull
    @Column(name = "vector_indexed", nullable = false)
    private Boolean vectorIndexed;

    @Column(name = "indexed_at")
    private Instant indexedAt;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public KnowledgeDocument id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public KnowledgeDocument title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return this.category;
    }

    public KnowledgeDocument category(String category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return this.content;
    }

    public KnowledgeDocument content(String content) {
        this.setContent(content);
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFileUrl() {
        return this.fileUrl;
    }

    public KnowledgeDocument fileUrl(String fileUrl) {
        this.setFileUrl(fileUrl);
        return this;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Boolean getVectorIndexed() {
        return this.vectorIndexed;
    }

    public KnowledgeDocument vectorIndexed(Boolean vectorIndexed) {
        this.setVectorIndexed(vectorIndexed);
        return this;
    }

    public void setVectorIndexed(Boolean vectorIndexed) {
        this.vectorIndexed = vectorIndexed;
    }

    public Instant getIndexedAt() {
        return this.indexedAt;
    }

    public KnowledgeDocument indexedAt(Instant indexedAt) {
        this.setIndexedAt(indexedAt);
        return this;
    }

    public void setIndexedAt(Instant indexedAt) {
        this.indexedAt = indexedAt;
    }

    public Boolean getActive() {
        return this.active;
    }

    public KnowledgeDocument active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public KnowledgeDocument createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public KnowledgeDocument company(Company company) {
        this.setCompany(company);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof KnowledgeDocument)) {
            return false;
        }
        return getId() != null && getId().equals(((KnowledgeDocument) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "KnowledgeDocument{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", category='" + getCategory() + "'" +
            ", content='" + getContent() + "'" +
            ", fileUrl='" + getFileUrl() + "'" +
            ", vectorIndexed='" + getVectorIndexed() + "'" +
            ", indexedAt='" + getIndexedAt() + "'" +
            ", active='" + getActive() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
