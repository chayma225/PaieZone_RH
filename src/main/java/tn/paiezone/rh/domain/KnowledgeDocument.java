package tn.paiezone.rh.domain;

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
    private boolean active;

    @Column(name = "created_at")
    private Instant createdAt;

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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
