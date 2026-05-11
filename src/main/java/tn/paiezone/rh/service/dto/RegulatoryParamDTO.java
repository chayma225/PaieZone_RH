package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Schema(description = "Paramètre réglementaire de paie (taux, plafonds, déductions)")
public class RegulatoryParamDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(min = 2, max = 100)
    private String paramKey;

    @NotNull
    @Size(min = 3, max = 200)
    private String paramLabel;

    @Size(max = 50)
    private String category;

    private BigDecimal numericValue;

    // ✅ stringValue — cohérent avec entité et colonne DDL string_value
    @Size(max = 500)
    private String stringValue;

    @NotNull
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @Size(max = 200)
    private String legalReference;

    @Size(max = 1000)
    private String description;

    @NotNull
    private Boolean active;

    private Instant updatedAt;

    @Size(max = 100)
    private String updatedBy;

    // ── Getters / Setters ──────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getParamKey() { return paramKey; }
    public void setParamKey(String paramKey) { this.paramKey = paramKey; }

    public String getParamLabel() { return paramLabel; }
    public void setParamLabel(String paramLabel) { this.paramLabel = paramLabel; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

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

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof RegulatoryParamDTO)) return false;
        return Objects.equals(id, ((RegulatoryParamDTO) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "RegulatoryParamDTO{" +
            "id=" + id +
            ", paramKey='" + paramKey + '\'' +
            ", paramLabel='" + paramLabel + '\'' +
            ", category='" + category + '\'' +
            ", numericValue=" + numericValue +
            ", effectiveFrom=" + effectiveFrom +
            ", active=" + active +
            '}';
    }
}
