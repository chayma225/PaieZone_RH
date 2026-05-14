package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serializable;
import java.time.Instant;

@Entity
@Table(name = "knowledge_document")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class KnowledgeDocument implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "knowledgeDocumentSequenceGenerator")
    @SequenceGenerator(name = "knowledgeDocumentSequenceGenerator", sequenceName = "knowledge_document_sequence", allocationSize = 1)
    @Column(name = "id")
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    /** CONGE | PAIE | CONTRAT | CNSS | IRPP | GENERAL */
    @Column(name = "category", length = 50)
    private String category;

    /** Mots-clés séparés par des virgules, utilisés pour la recherche RAG */
    @Column(name = "keywords", length = 500)
    private String keywords;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "created_at")
    private Instant createdAt;

    /** URL du fichier source (PDF, DOCX…) */
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    /** Indique si le document a été vectorisé pour la recherche sémantique */
    @Column(name = "vector_indexed")
    private Boolean vectorIndexed;

    /** Date d'indexation vectorielle */
    @Column(name = "indexed_at")
    private Instant indexedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    @JsonIgnoreProperties(value = { "subscriptions" }, allowSetters = true)
    private Company company;

    // ── Getters / Setters / Fluent methods ──────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public KnowledgeDocument id(Long id) {
        this.id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public KnowledgeDocument title(String title) {
        this.title = title;
        return this;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public KnowledgeDocument content(String content) {
        this.content = content;
        return this;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public KnowledgeDocument category(String category) {
        this.category = category;
        return this;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public KnowledgeDocument keywords(String keywords) {
        this.keywords = keywords;
        return this;
    }

    /** Compatibilité test : getActive() */
    public Boolean getActive() {
        return active;
    }

    /** Compatibilité code métier : isActive() */
    public boolean isActive() {
        return Boolean.TRUE.equals(active);
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public KnowledgeDocument active(Boolean active) {
        this.active = active;
        return this;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public KnowledgeDocument createdAt(Instant createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public KnowledgeDocument fileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
        return this;
    }

    public Boolean getVectorIndexed() {
        return vectorIndexed;
    }

    public void setVectorIndexed(Boolean vectorIndexed) {
        this.vectorIndexed = vectorIndexed;
    }

    public KnowledgeDocument vectorIndexed(Boolean vectorIndexed) {
        this.vectorIndexed = vectorIndexed;
        return this;
    }

    public Instant getIndexedAt() {
        return indexedAt;
    }

    public void setIndexedAt(Instant indexedAt) {
        this.indexedAt = indexedAt;
    }

    public KnowledgeDocument indexedAt(Instant indexedAt) {
        this.indexedAt = indexedAt;
        return this;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public KnowledgeDocument company(Company company) {
        this.company = company;
        return this;
    }

    // ── equals / hashCode / toString ─────────────────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof KnowledgeDocument)) return false;
        return id != null && id.equals(((KnowledgeDocument) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "KnowledgeDocument{id=" + id + ", title='" + title + "', category='" + category + "', active=" + active + "}";
    }
}
