package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.RegulatoryParam} entity.
 */
@Schema(description = "Paramètres réglementaires (partagés, versionnés)")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class RegulatoryParamDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String paramKey;

    @NotNull
    @Size(max = 200)
    private String paramLabel;

    private BigDecimal numericValue;

    @Size(max = 500)
    private String textValue;

    @NotNull
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @Size(max = 200)
    private String legalReference;

    @NotNull
    private Boolean active;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getParamKey() {
        return paramKey;
    }

    public void setParamKey(String paramKey) {
        this.paramKey = paramKey;
    }

    public String getParamLabel() {
        return paramLabel;
    }

    public void setParamLabel(String paramLabel) {
        this.paramLabel = paramLabel;
    }

    public BigDecimal getNumericValue() {
        return numericValue;
    }

    public void setNumericValue(BigDecimal numericValue) {
        this.numericValue = numericValue;
    }

    public String getTextValue() {
        return textValue;
    }

    public void setTextValue(String textValue) {
        this.textValue = textValue;
    }

    public LocalDate getEffectiveFrom() {
        return effectiveFrom;
    }

    public void setEffectiveFrom(LocalDate effectiveFrom) {
        this.effectiveFrom = effectiveFrom;
    }

    public LocalDate getEffectiveTo() {
        return effectiveTo;
    }

    public void setEffectiveTo(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
    }

    public String getLegalReference() {
        return legalReference;
    }

    public void setLegalReference(String legalReference) {
        this.legalReference = legalReference;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof RegulatoryParamDTO)) {
            return false;
        }

        RegulatoryParamDTO regulatoryParamDTO = (RegulatoryParamDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, regulatoryParamDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "RegulatoryParamDTO{" +
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
