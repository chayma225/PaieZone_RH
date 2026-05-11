package tn.paiezone.rh.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "regulatory_param")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class RegulatoryParam implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "regulatory_param_seq")
    @SequenceGenerator(name = "regulatory_param_seq", sequenceName = "regulatory_param_seq", allocationSize = 1)
    private Long id;

    @Column(name = "param_key", nullable = false, length = 100)
    private String paramKey;

    @Column(name = "param_label", nullable = false, length = 255)
    private String paramLabel;

    @Column(name = "numeric_value", precision = 15, scale = 4)
    private BigDecimal numericValue;

    /** Colonne DDL : string_value */
    @Column(name = "string_value", length = 500)
    private String stringValue;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "legal_reference", length = 255)
    private String legalReference;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    public RegulatoryParam() {}

    @PreUpdate
    protected void onUpdate() { this.updatedAt = Instant.now(); }

    // ── Fluent methods ─────────────────────────────────────────────

    public RegulatoryParam id(Long id) { this.id = id; return this; }
    public RegulatoryParam paramKey(String paramKey) { this.paramKey = paramKey; return this; }
    public RegulatoryParam paramLabel(String paramLabel) { this.paramLabel = paramLabel; return this; }
    public RegulatoryParam numericValue(BigDecimal numericValue) { this.numericValue = numericValue; return this; }
    public RegulatoryParam stringValue(String stringValue) { this.stringValue = stringValue; return this; }
    public RegulatoryParam effectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }
    public RegulatoryParam effectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; return this; }
    public RegulatoryParam legalReference(String legalReference) { this.legalReference = legalReference; return this; }
    public RegulatoryParam active(Boolean active) { this.active = active; return this; }
    public RegulatoryParam category(String category) { this.category = category; return this; }
    public RegulatoryParam description(String description) { this.description = description; return this; }

    // ── Alias de compatibilité : textValue ↔ stringValue ──────────
    // Les tests JHipster générés utilisent "textValue" — ces alias évitent
    // de modifier les 4 fichiers de test concernés.

    public String getTextValue() { return this.stringValue; }
    public void setTextValue(String textValue) { this.stringValue = textValue; }
    public RegulatoryParam textValue(String textValue) { this.stringValue = textValue; return this; }

    // ── Getters / Setters ──────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getParamKey() { return paramKey; }
    public void setParamKey(String paramKey) { this.paramKey = paramKey; }

    public String getParamLabel() { return paramLabel; }
    public void setParamLabel(String paramLabel) { this.paramLabel = paramLabel; }

    public BigDecimal getNumericValue() { return numericValue; }
    public void setNumericValue(BigDecimal numericValue) { this.numericValue = numericValue; }

    public String getStringValue() { return stringValue; }
    public void setStringValue(String stringValue) { this.stringValue = stringValue; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }

    public String getLegalReference() { return legalReference; }
    public void setLegalReference(String legalReference) { this.legalReference = legalReference; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegulatoryParam)) return false;
        return id != null && id.equals(((RegulatoryParam) o).id);
    }

    @Override
    public int hashCode() { return getClass().hashCode(); }

    @Override
    public String toString() {
        return "RegulatoryParam{id=" + id + ", paramKey='" + paramKey + "', numericValue=" + numericValue + "}";
    }
}
