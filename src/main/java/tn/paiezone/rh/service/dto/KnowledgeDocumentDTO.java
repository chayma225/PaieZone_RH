package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.KnowledgeDocument} entity.
 */
@Schema(description = "Documents indexés pour le RAG")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class KnowledgeDocumentDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 200)
    private String title;

    @Size(max = 100)
    private String category;

    @Lob
    private String content;

    @Size(max = 500)
    private String fileUrl;

    @NotNull
    private Boolean vectorIndexed;

    private Instant indexedAt;

    @NotNull
    private Boolean active;

    @NotNull
    private Instant createdAt;

    @NotNull
    private CompanyDTO company;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public Boolean getVectorIndexed() {
        return vectorIndexed;
    }

    public void setVectorIndexed(Boolean vectorIndexed) {
        this.vectorIndexed = vectorIndexed;
    }

    public Instant getIndexedAt() {
        return indexedAt;
    }

    public void setIndexedAt(Instant indexedAt) {
        this.indexedAt = indexedAt;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
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
        if (!(o instanceof KnowledgeDocumentDTO)) {
            return false;
        }

        KnowledgeDocumentDTO knowledgeDocumentDTO = (KnowledgeDocumentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, knowledgeDocumentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "KnowledgeDocumentDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", category='" + getCategory() + "'" +
            ", content='" + getContent() + "'" +
            ", fileUrl='" + getFileUrl() + "'" +
            ", vectorIndexed='" + getVectorIndexed() + "'" +
            ", indexedAt='" + getIndexedAt() + "'" +
            ", active='" + getActive() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", company=" + getCompany() +
            "}";
    }
}
