package tn.paiezone.rh.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * Paramètres réglementaires (partagés, versionnés)
 */
@Entity
@Table(name = "regulatory_param")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RegulatoryParam implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 100)
    @Column(name = "param_key", length = 100, nullable = false)
    private String paramKey;

    @NotNull
    @Size(max = 200)
    @Column(name = "param_label", length = 200, nullable = false)
    private String paramLabel;

    @Column(name = "numeric_value", precision = 21, scale = 2)
    private BigDecimal numericValue;

    @Size(max = 500)
    @Column(name = "text_value", length = 500)
    private String textValue;

    @NotNull
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Size(max = 200)
    @Column(name = "legal_reference", length = 200)
    private String legalReference;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public RegulatoryParam id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getParamKey() {
        return this.paramKey;
    }

    public RegulatoryParam paramKey(String paramKey) {
        this.setParamKey(paramKey);
        return this;
    }

    public void setParamKey(String paramKey) {
        this.paramKey = paramKey;
    }

    public String getParamLabel() {
        return this.paramLabel;
    }

    public RegulatoryParam paramLabel(String paramLabel) {
        this.setParamLabel(paramLabel);
        return this;
    }

    public void setParamLabel(String paramLabel) {
        this.paramLabel = paramLabel;
    }

    public BigDecimal getNumericValue() {
        return this.numericValue;
    }

    public RegulatoryParam numericValue(BigDecimal numericValue) {
        this.setNumericValue(numericValue);
        return this;
    }

    public void setNumericValue(BigDecimal numericValue) {
        this.numericValue = numericValue;
    }

    public String getTextValue() {
        return this.textValue;
    }

    public RegulatoryParam textValue(String textValue) {
        this.setTextValue(textValue);
        return this;
    }

    public void setTextValue(String textValue) {
        this.textValue = textValue;
    }

    public LocalDate getEffectiveFrom() {
        return this.effectiveFrom;
    }

    public RegulatoryParam effectiveFrom(LocalDate effectiveFrom) {
        this.setEffectiveFrom(effectiveFrom);
        return this;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return this.effectiveTo;
    }

    public RegulatoryParam effectiveTo(LocalDate effectiveTo) {
        this.setEffectiveTo(effectiveTo);
        return this;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public String getLegalReference() {
        return this.legalReference;
    }

    public RegulatoryParam legalReference(String legalReference) {
        this.setLegalReference(legalReference);
        return this;
    }

    public void setLegalReference(String legalReference) {
        this.legalReference = legalReference;
    }

    public Boolean getActive() {
        return this.active;
    }

    public RegulatoryParam active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RegulatoryParam)) {
            return false;
        }
        return getId() != null && getId().equals(((RegulatoryParam) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RegulatoryParam{" +
            "id=" + getId() +
            ", paramKey='" + getParamKey() + "'" +
            ", paramLabel='" + getParamLabel() + "'" +
            ", numericValue=" + getNumericValue() +
            ", textValue='" + getTextValue() + "'" +
            ", effectiveFrom='" + getEffectiveFrom() + "'" +
            ", effectiveTo='" + getEffectiveTo() + "'" +
            ", legalReference='" + getLegalReference() + "'" +
            ", active='" + getActive() + "'" +
            "}";
    }
}
