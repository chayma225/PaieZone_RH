package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import tn.paiezone.rh.domain.enumeration.ConventionRuleType;

@Entity
@Table(name = "convention_rule")
public class ConventionRule implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @ManyToOne(optional = false)
    @NotNull
    @JoinColumn(name = "convention_id")
    @JsonIgnoreProperties(value = { "sector" }, allowSetters = true)
    private SectoralConvention convention;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "rule_type", nullable = false)
    private ConventionRuleType ruleType;

    @NotNull
    @Size(max = 200)
    @Column(name = "label", length = 200, nullable = false)
    private String label;

    @NotNull
    @Size(max = 100)
    @Column(name = "value", length = 100, nullable = false)
    private String value;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SectoralConvention getConvention() {
        return convention;
    }

    public void setConvention(SectoralConvention convention) {
        this.convention = convention;
    }

    public ConventionRuleType getRuleType() {
        return ruleType;
    }

    public void setRuleType(ConventionRuleType ruleType) {
        this.ruleType = ruleType;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
