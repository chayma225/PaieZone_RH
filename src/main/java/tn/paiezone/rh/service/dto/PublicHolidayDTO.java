package tn.paiezone.rh.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A DTO for the {@link tn.paiezone.rh.domain.PublicHoliday} entity.
 */
@Schema(description = "Jours fériés")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class PublicHolidayDTO implements Serializable {

    private Long id;

    @NotNull
    @Size(max = 150)
    private String name;

    @Size(max = 150)
    private String nameAr;

    @NotNull
    private LocalDate holidayDate;

    @NotNull
    private Integer year;

    @NotNull
    private Boolean isRecurring;

    @NotNull
    private Boolean active;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNameAr() {
        return nameAr;
    }

    public void setNameAr(String nameAr) {
        this.nameAr = nameAr;
    }

    public LocalDate getHolidayDate() {
        return holidayDate;
    }

    public void setHolidayDate(LocalDate holidayDate) {
        this.holidayDate = holidayDate;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
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
        if (!(o instanceof PublicHolidayDTO)) {
            return false;
        }

        PublicHolidayDTO publicHolidayDTO = (PublicHolidayDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, publicHolidayDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "PublicHolidayDTO{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", nameAr='" + getNameAr() + "'" +
            ", holidayDate='" + getHolidayDate() + "'" +
            ", year=" + getYear() +
            ", isRecurring='" + getIsRecurring() + "'" +
            ", active='" + getActive() + "'" +
            "}";
    }
}
