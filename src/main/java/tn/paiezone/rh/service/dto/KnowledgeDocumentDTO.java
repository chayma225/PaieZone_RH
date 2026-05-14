package tn.paiezone.rh.service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class KnowledgeDocumentDTO {

    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Size(max = 255)
    private String title;

    @NotBlank(message = "Le contenu est obligatoire")
    private String content;

    private String category;

    @Size(max = 500)
    private String keywords;

    private Boolean active;

    // ── Champs JDL complets (requis par le mapper test round-trip) ─────────────
    @Size(max = 500)
    private String fileUrl;

    private Boolean vectorIndexed;
    private Instant indexedAt;
    private Instant createdAt;
    private Long companyId;

    // ── Getters / Setters ─────────────────────────────────────────────────────

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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public Boolean getActive() {
        return active;
    }

    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }

    public void setActive(Boolean active) {
        this.active = active;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof KnowledgeDocumentDTO)) return false;
        KnowledgeDocumentDTO dto = (KnowledgeDocumentDTO) o;
        return id != null && id.equals(dto.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
