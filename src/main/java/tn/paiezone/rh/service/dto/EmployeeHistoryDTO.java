package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.EmployeeHistory} entity.
 */
@Schema(description = "Historique des modifications du dossier")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EmployeeHistoryDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 100)
    private String fieldName;

    @Size(max = 500)
    private String oldValue;

    @Size(max = 500)
    private String newValue;

    @NotNull
    private Instant changedAt;

    @Size(max = 100)
    private String changedBy;

    @Size(max = 255)
    private String reason;

    @NotNull
    private EmployeeDTO employee;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }

    public Instant getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(Instant changedAt) {
        this.changedAt = changedAt;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof EmployeeHistoryDTO)) {
            return false;
        }

        EmployeeHistoryDTO employeeHistoryDTO = (EmployeeHistoryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, employeeHistoryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EmployeeHistoryDTO{" +
            "id=" + getId() +
            ", fieldName='" + getFieldName() + "'" +
            ", oldValue='" + getOldValue() + "'" +
            ", newValue='" + getNewValue() + "'" +
            ", changedAt='" + getChangedAt() + "'" +
            ", changedBy='" + getChangedBy() + "'" +
            ", reason='" + getReason() + "'" +
            ", employee=" + getEmployee() +
            "}";
    }
}
