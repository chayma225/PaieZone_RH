package tn.paiezone.rh.service.criteria;

import java.io.Serializable;
import java.util.Objects;
import java.util.Optional;
import org.springdoc.core.annotations.ParameterObject;
import tech.jhipster.service.Criteria;
import tech.jhipster.service.filter.*;
import tn.paiezone.rh.domain.enumeration.EmployeeCategory;
import tn.paiezone.rh.domain.enumeration.Gender;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;

/**
 * Criteria class for the {@link tn.paiezone.rh.domain.Employee} entity. This class is used
 * in {@link tn.paiezone.rh.web.rest.EmployeeResource} to receive all the possible filtering options from
 * the Http GET request parameters.
 * For example the following could be a valid request:
 * {@code /employees?id.greaterThan=5&attr1.contains=something&attr2.specified=false}
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
@ParameterObject
@SuppressWarnings("common-java:DuplicatedBlocks")
public class EmployeeCriteria implements Serializable, Criteria {

    /**
     * Class for filtering Gender
     */
    public static class GenderFilter extends Filter<Gender> {

        public GenderFilter() {}

        public GenderFilter(GenderFilter filter) {
            super(filter);
        }

        @Override
        public GenderFilter copy() {
            return new GenderFilter(this);
        }
    }

    /**
     * Class for filtering MaritalStatus
     */
    public static class MaritalStatusFilter extends Filter<MaritalStatus> {

        public MaritalStatusFilter() {}

        public MaritalStatusFilter(MaritalStatusFilter filter) {
            super(filter);
        }

        @Override
        public MaritalStatusFilter copy() {
            return new MaritalStatusFilter(this);
        }
    }

    /**
     * Class for filtering EmployeeCategory
     */
    public static class EmployeeCategoryFilter extends Filter<EmployeeCategory> {

        public EmployeeCategoryFilter() {}

        public EmployeeCategoryFilter(EmployeeCategoryFilter filter) {
            super(filter);
        }

        @Override
        public EmployeeCategoryFilter copy() {
            return new EmployeeCategoryFilter(this);
        }
    }

    private static final long serialVersionUID = 1L;

    private LongFilter id;

    private StringFilter matricule;

    private StringFilter firstName;

    private StringFilter lastName;

    private StringFilter firstNameAr;

    private StringFilter lastNameAr;

    private LocalDateFilter birthDate;

    private StringFilter birthPlace;

    private GenderFilter gender;

    private MaritalStatusFilter maritalStatus;

    private IntegerFilter numberOfChildren;

    private BooleanFilter chefDeFamille;

    private StringFilter nationalId;

    private StringFilter passportNumber;

    private StringFilter nationality;

    private StringFilter address;

    private StringFilter city;

    private StringFilter personalEmail;

    private StringFilter professionalEmail;

    private StringFilter phoneNumber;

    private StringFilter cnssNumber;

    private EmployeeCategoryFilter category;

    private StringFilter photoUrl;

    private LocalDateFilter hireDate;

    private LocalDateFilter trialEndDate;

    private BooleanFilter active;

    private InstantFilter createdAt;

    private InstantFilter updatedAt;

    private LongFilter companyId;

    private LongFilter departmentId;

    private LongFilter positionId;

    private LongFilter managerId;

    private LongFilter userProfileId;

    private Boolean distinct;

    public EmployeeCriteria() {}

    public EmployeeCriteria(EmployeeCriteria other) {
        this.id = other.optionalId().map(LongFilter::copy).orElse(null);
        this.matricule = other.optionalMatricule().map(StringFilter::copy).orElse(null);
        this.firstName = other.optionalFirstName().map(StringFilter::copy).orElse(null);
        this.lastName = other.optionalLastName().map(StringFilter::copy).orElse(null);
        this.firstNameAr = other.optionalFirstNameAr().map(StringFilter::copy).orElse(null);
        this.lastNameAr = other.optionalLastNameAr().map(StringFilter::copy).orElse(null);
        this.birthDate = other.optionalBirthDate().map(LocalDateFilter::copy).orElse(null);
        this.birthPlace = other.optionalBirthPlace().map(StringFilter::copy).orElse(null);
        this.gender = other.optionalGender().map(GenderFilter::copy).orElse(null);
        this.maritalStatus = other.optionalMaritalStatus().map(MaritalStatusFilter::copy).orElse(null);
        this.numberOfChildren = other.optionalNumberOfChildren().map(IntegerFilter::copy).orElse(null);
        this.chefDeFamille = other.optionalChefDeFamille().map(BooleanFilter::copy).orElse(null);
        this.nationalId = other.optionalNationalId().map(StringFilter::copy).orElse(null);
        this.passportNumber = other.optionalPassportNumber().map(StringFilter::copy).orElse(null);
        this.nationality = other.optionalNationality().map(StringFilter::copy).orElse(null);
        this.address = other.optionalAddress().map(StringFilter::copy).orElse(null);
        this.city = other.optionalCity().map(StringFilter::copy).orElse(null);
        this.personalEmail = other.optionalPersonalEmail().map(StringFilter::copy).orElse(null);
        this.professionalEmail = other.optionalProfessionalEmail().map(StringFilter::copy).orElse(null);
        this.phoneNumber = other.optionalPhoneNumber().map(StringFilter::copy).orElse(null);
        this.cnssNumber = other.optionalCnssNumber().map(StringFilter::copy).orElse(null);
        this.category = other.optionalCategory().map(EmployeeCategoryFilter::copy).orElse(null);
        this.photoUrl = other.optionalPhotoUrl().map(StringFilter::copy).orElse(null);
        this.hireDate = other.optionalHireDate().map(LocalDateFilter::copy).orElse(null);
        this.trialEndDate = other.optionalTrialEndDate().map(LocalDateFilter::copy).orElse(null);
        this.active = other.optionalActive().map(BooleanFilter::copy).orElse(null);
        this.createdAt = other.optionalCreatedAt().map(InstantFilter::copy).orElse(null);
        this.updatedAt = other.optionalUpdatedAt().map(InstantFilter::copy).orElse(null);
        this.companyId = other.optionalCompanyId().map(LongFilter::copy).orElse(null);
        this.departmentId = other.optionalDepartmentId().map(LongFilter::copy).orElse(null);
        this.positionId = other.optionalPositionId().map(LongFilter::copy).orElse(null);
        this.managerId = other.optionalManagerId().map(LongFilter::copy).orElse(null);
        this.userProfileId = other.optionalUserProfileId().map(LongFilter::copy).orElse(null);
        this.distinct = other.distinct;
    }

    @Override
    public EmployeeCriteria copy() {
        return new EmployeeCriteria(this);
    }

    public LongFilter getId() {
        return id;
    }

    public Optional<LongFilter> optionalId() {
        return Optional.ofNullable(id);
    }

    public LongFilter id() {
        if (id == null) {
            setId(new LongFilter());
        }
        return id;
    }

    public void setId(LongFilter id) {
        this.id = id;
    }

    public StringFilter getMatricule() {
        return matricule;
    }

    public Optional<StringFilter> optionalMatricule() {
        return Optional.ofNullable(matricule);
    }

    public StringFilter matricule() {
        if (matricule == null) {
            setMatricule(new StringFilter());
        }
        return matricule;
    }

    public void setMatricule(StringFilter matricule) {
        this.matricule = matricule;
    }

    public StringFilter getFirstName() {
        return firstName;
    }

    public Optional<StringFilter> optionalFirstName() {
        return Optional.ofNullable(firstName);
    }

    public StringFilter firstName() {
        if (firstName == null) {
            setFirstName(new StringFilter());
        }
        return firstName;
    }

    public void setFirstName(StringFilter firstName) {
        this.firstName = firstName;
    }

    public StringFilter getLastName() {
        return lastName;
    }

    public Optional<StringFilter> optionalLastName() {
        return Optional.ofNullable(lastName);
    }

    public StringFilter lastName() {
        if (lastName == null) {
            setLastName(new StringFilter());
        }
        return lastName;
    }

    public void setLastName(StringFilter lastName) {
        this.lastName = lastName;
    }

    public StringFilter getFirstNameAr() {
        return firstNameAr;
    }

    public Optional<StringFilter> optionalFirstNameAr() {
        return Optional.ofNullable(firstNameAr);
    }

    public StringFilter firstNameAr() {
        if (firstNameAr == null) {
            setFirstNameAr(new StringFilter());
        }
        return firstNameAr;
    }

    public void setFirstNameAr(StringFilter firstNameAr) {
        this.firstNameAr = firstNameAr;
    }

    public StringFilter getLastNameAr() {
        return lastNameAr;
    }

    public Optional<StringFilter> optionalLastNameAr() {
        return Optional.ofNullable(lastNameAr);
    }

    public StringFilter lastNameAr() {
        if (lastNameAr == null) {
            setLastNameAr(new StringFilter());
        }
        return lastNameAr;
    }

    public void setLastNameAr(StringFilter lastNameAr) {
        this.lastNameAr = lastNameAr;
    }

    public LocalDateFilter getBirthDate() {
        return birthDate;
    }

    public Optional<LocalDateFilter> optionalBirthDate() {
        return Optional.ofNullable(birthDate);
    }

    public LocalDateFilter birthDate() {
        if (birthDate == null) {
            setBirthDate(new LocalDateFilter());
        }
        return birthDate;
    }

    public void setBirthDate(LocalDateFilter birthDate) {
        this.birthDate = birthDate;
    }

    public StringFilter getBirthPlace() {
        return birthPlace;
    }

    public Optional<StringFilter> optionalBirthPlace() {
        return Optional.ofNullable(birthPlace);
    }

    public StringFilter birthPlace() {
        if (birthPlace == null) {
            setBirthPlace(new StringFilter());
        }
        return birthPlace;
    }

    public void setBirthPlace(StringFilter birthPlace) {
        this.birthPlace = birthPlace;
    }

    public GenderFilter getGender() {
        return gender;
    }

    public Optional<GenderFilter> optionalGender() {
        return Optional.ofNullable(gender);
    }

    public GenderFilter gender() {
        if (gender == null) {
            setGender(new GenderFilter());
        }
        return gender;
    }

    public void setGender(GenderFilter gender) {
        this.gender = gender;
    }

    public MaritalStatusFilter getMaritalStatus() {
        return maritalStatus;
    }

    public Optional<MaritalStatusFilter> optionalMaritalStatus() {
        return Optional.ofNullable(maritalStatus);
    }

    public MaritalStatusFilter maritalStatus() {
        if (maritalStatus == null) {
            setMaritalStatus(new MaritalStatusFilter());
        }
        return maritalStatus;
    }

    public void setMaritalStatus(MaritalStatusFilter maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public IntegerFilter getNumberOfChildren() {
        return numberOfChildren;
    }

    public Optional<IntegerFilter> optionalNumberOfChildren() {
        return Optional.ofNullable(numberOfChildren);
    }

    public IntegerFilter numberOfChildren() {
        if (numberOfChildren == null) {
            setNumberOfChildren(new IntegerFilter());
        }
        return numberOfChildren;
    }

    public void setNumberOfChildren(IntegerFilter numberOfChildren) {
        this.numberOfChildren = numberOfChildren;
    }

    public BooleanFilter getChefDeFamille() {
        return chefDeFamille;
    }

    public Optional<BooleanFilter> optionalChefDeFamille() {
        return Optional.ofNullable(chefDeFamille);
    }

    public BooleanFilter chefDeFamille() {
        if (chefDeFamille == null) {
            setChefDeFamille(new BooleanFilter());
        }
        return chefDeFamille;
    }

    public void setChefDeFamille(BooleanFilter chefDeFamille) {
        this.chefDeFamille = chefDeFamille;
    }

    public StringFilter getNationalId() {
        return nationalId;
    }

    public Optional<StringFilter> optionalNationalId() {
        return Optional.ofNullable(nationalId);
    }

    public StringFilter nationalId() {
        if (nationalId == null) {
            setNationalId(new StringFilter());
        }
        return nationalId;
    }

    public void setNationalId(StringFilter nationalId) {
        this.nationalId = nationalId;
    }

    public StringFilter getPassportNumber() {
        return passportNumber;
    }

    public Optional<StringFilter> optionalPassportNumber() {
        return Optional.ofNullable(passportNumber);
    }

    public StringFilter passportNumber() {
        if (passportNumber == null) {
            setPassportNumber(new StringFilter());
        }
        return passportNumber;
    }

    public void setPassportNumber(StringFilter passportNumber) {
        this.passportNumber = passportNumber;
    }

    public StringFilter getNationality() {
        return nationality;
    }

    public Optional<StringFilter> optionalNationality() {
        return Optional.ofNullable(nationality);
    }

    public StringFilter nationality() {
        if (nationality == null) {
            setNationality(new StringFilter());
        }
        return nationality;
    }

    public void setNationality(StringFilter nationality) {
        this.nationality = nationality;
    }

    public StringFilter getAddress() {
        return address;
    }

    public Optional<StringFilter> optionalAddress() {
        return Optional.ofNullable(address);
    }

    public StringFilter address() {
        if (address == null) {
            setAddress(new StringFilter());
        }
        return address;
    }

    public void setAddress(StringFilter address) {
        this.address = address;
    }

    public StringFilter getCity() {
        return city;
    }

    public Optional<StringFilter> optionalCity() {
        return Optional.ofNullable(city);
    }

    public StringFilter city() {
        if (city == null) {
            setCity(new StringFilter());
        }
        return city;
    }

    public void setCity(StringFilter city) {
        this.city = city;
    }

    public StringFilter getPersonalEmail() {
        return personalEmail;
    }

    public Optional<StringFilter> optionalPersonalEmail() {
        return Optional.ofNullable(personalEmail);
    }

    public StringFilter personalEmail() {
        if (personalEmail == null) {
            setPersonalEmail(new StringFilter());
        }
        return personalEmail;
    }

    public void setPersonalEmail(StringFilter personalEmail) {
        this.personalEmail = personalEmail;
    }

    public StringFilter getProfessionalEmail() {
        return professionalEmail;
    }

    public Optional<StringFilter> optionalProfessionalEmail() {
        return Optional.ofNullable(professionalEmail);
    }

    public StringFilter professionalEmail() {
        if (professionalEmail == null) {
            setProfessionalEmail(new StringFilter());
        }
        return professionalEmail;
    }

    public void setProfessionalEmail(StringFilter professionalEmail) {
        this.professionalEmail = professionalEmail;
    }

    public StringFilter getPhoneNumber() {
        return phoneNumber;
    }

    public Optional<StringFilter> optionalPhoneNumber() {
        return Optional.ofNullable(phoneNumber);
    }

    public StringFilter phoneNumber() {
        if (phoneNumber == null) {
            setPhoneNumber(new StringFilter());
        }
        return phoneNumber;
    }

    public void setPhoneNumber(StringFilter phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public StringFilter getCnssNumber() {
        return cnssNumber;
    }

    public Optional<StringFilter> optionalCnssNumber() {
        return Optional.ofNullable(cnssNumber);
    }

    public StringFilter cnssNumber() {
        if (cnssNumber == null) {
            setCnssNumber(new StringFilter());
        }
        return cnssNumber;
    }

    public void setCnssNumber(StringFilter cnssNumber) {
        this.cnssNumber = cnssNumber;
    }

    public EmployeeCategoryFilter getCategory() {
        return category;
    }

    public Optional<EmployeeCategoryFilter> optionalCategory() {
        return Optional.ofNullable(category);
    }

    public EmployeeCategoryFilter category() {
        if (category == null) {
            setCategory(new EmployeeCategoryFilter());
        }
        return category;
    }

    public void setCategory(EmployeeCategoryFilter category) {
        this.category = category;
    }

    public StringFilter getPhotoUrl() {
        return photoUrl;
    }

    public Optional<StringFilter> optionalPhotoUrl() {
        return Optional.ofNullable(photoUrl);
    }

    public StringFilter photoUrl() {
        if (photoUrl == null) {
            setPhotoUrl(new StringFilter());
        }
        return photoUrl;
    }

    public void setPhotoUrl(StringFilter photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDateFilter getHireDate() {
        return hireDate;
    }

    public Optional<LocalDateFilter> optionalHireDate() {
        return Optional.ofNullable(hireDate);
    }

    public LocalDateFilter hireDate() {
        if (hireDate == null) {
            setHireDate(new LocalDateFilter());
        }
        return hireDate;
    }

    public void setHireDate(LocalDateFilter hireDate) {
        this.hireDate = hireDate;
    }

    public LocalDateFilter getTrialEndDate() {
        return trialEndDate;
    }

    public Optional<LocalDateFilter> optionalTrialEndDate() {
        return Optional.ofNullable(trialEndDate);
    }

    public LocalDateFilter trialEndDate() {
        if (trialEndDate == null) {
            setTrialEndDate(new LocalDateFilter());
        }
        return trialEndDate;
    }

    public void setTrialEndDate(LocalDateFilter trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    public BooleanFilter getActive() {
        return active;
    }

    public Optional<BooleanFilter> optionalActive() {
        return Optional.ofNullable(active);
    }

    public BooleanFilter active() {
        if (active == null) {
            setActive(new BooleanFilter());
        }
        return active;
    }

    public void setActive(BooleanFilter active) {
        this.active = active;
    }

    public InstantFilter getCreatedAt() {
        return createdAt;
    }

    public Optional<InstantFilter> optionalCreatedAt() {
        return Optional.ofNullable(createdAt);
    }

    public InstantFilter createdAt() {
        if (createdAt == null) {
            setCreatedAt(new InstantFilter());
        }
        return createdAt;
    }

    public void setCreatedAt(InstantFilter createdAt) {
        this.createdAt = createdAt;
    }

    public InstantFilter getUpdatedAt() {
        return updatedAt;
    }

    public Optional<InstantFilter> optionalUpdatedAt() {
        return Optional.ofNullable(updatedAt);
    }

    public InstantFilter updatedAt() {
        if (updatedAt == null) {
            setUpdatedAt(new InstantFilter());
        }
        return updatedAt;
    }

    public void setUpdatedAt(InstantFilter updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LongFilter getCompanyId() {
        return companyId;
    }

    public Optional<LongFilter> optionalCompanyId() {
        return Optional.ofNullable(companyId);
    }

    public LongFilter companyId() {
        if (companyId == null) {
            setCompanyId(new LongFilter());
        }
        return companyId;
    }

    public void setCompanyId(LongFilter companyId) {
        this.companyId = companyId;
    }

    public LongFilter getDepartmentId() {
        return departmentId;
    }

    public Optional<LongFilter> optionalDepartmentId() {
        return Optional.ofNullable(departmentId);
    }

    public LongFilter departmentId() {
        if (departmentId == null) {
            setDepartmentId(new LongFilter());
        }
        return departmentId;
    }

    public void setDepartmentId(LongFilter departmentId) {
        this.departmentId = departmentId;
    }

    public LongFilter getPositionId() {
        return positionId;
    }

    public Optional<LongFilter> optionalPositionId() {
        return Optional.ofNullable(positionId);
    }

    public LongFilter positionId() {
        if (positionId == null) {
            setPositionId(new LongFilter());
        }
        return positionId;
    }

    public void setPositionId(LongFilter positionId) {
        this.positionId = positionId;
    }

    public LongFilter getManagerId() {
        return managerId;
    }

    public Optional<LongFilter> optionalManagerId() {
        return Optional.ofNullable(managerId);
    }

    public LongFilter managerId() {
        if (managerId == null) {
            setManagerId(new LongFilter());
        }
        return managerId;
    }

    public void setManagerId(LongFilter managerId) {
        this.managerId = managerId;
    }

    public LongFilter getUserProfileId() {
        return userProfileId;
    }

    public Optional<LongFilter> optionalUserProfileId() {
        return Optional.ofNullable(userProfileId);
    }

    public LongFilter userProfileId() {
        if (userProfileId == null) {
            setUserProfileId(new LongFilter());
        }
        return userProfileId;
    }

    public void setUserProfileId(LongFilter userProfileId) {
        this.userProfileId = userProfileId;
    }

    public Boolean getDistinct() {
        return distinct;
    }

    public Optional<Boolean> optionalDistinct() {
        return Optional.ofNullable(distinct);
    }

    public Boolean distinct() {
        if (distinct == null) {
            setDistinct(true);
        }
        return distinct;
    }

    public void setDistinct(Boolean distinct) {
        this.distinct = distinct;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        final EmployeeCriteria that = (EmployeeCriteria) o;
        return (
            Objects.equals(id, that.id) &&
            Objects.equals(matricule, that.matricule) &&
            Objects.equals(firstName, that.firstName) &&
            Objects.equals(lastName, that.lastName) &&
            Objects.equals(firstNameAr, that.firstNameAr) &&
            Objects.equals(lastNameAr, that.lastNameAr) &&
            Objects.equals(birthDate, that.birthDate) &&
            Objects.equals(birthPlace, that.birthPlace) &&
            Objects.equals(gender, that.gender) &&
            Objects.equals(maritalStatus, that.maritalStatus) &&
            Objects.equals(numberOfChildren, that.numberOfChildren) &&
            Objects.equals(chefDeFamille, that.chefDeFamille) &&
            Objects.equals(nationalId, that.nationalId) &&
            Objects.equals(passportNumber, that.passportNumber) &&
            Objects.equals(nationality, that.nationality) &&
            Objects.equals(address, that.address) &&
            Objects.equals(city, that.city) &&
            Objects.equals(personalEmail, that.personalEmail) &&
            Objects.equals(professionalEmail, that.professionalEmail) &&
            Objects.equals(phoneNumber, that.phoneNumber) &&
            Objects.equals(cnssNumber, that.cnssNumber) &&
            Objects.equals(category, that.category) &&
            Objects.equals(photoUrl, that.photoUrl) &&
            Objects.equals(hireDate, that.hireDate) &&
            Objects.equals(trialEndDate, that.trialEndDate) &&
            Objects.equals(active, that.active) &&
            Objects.equals(createdAt, that.createdAt) &&
            Objects.equals(updatedAt, that.updatedAt) &&
            Objects.equals(companyId, that.companyId) &&
            Objects.equals(departmentId, that.departmentId) &&
            Objects.equals(positionId, that.positionId) &&
            Objects.equals(managerId, that.managerId) &&
            Objects.equals(userProfileId, that.userProfileId) &&
            Objects.equals(distinct, that.distinct)
        );
    }

    @Override
    public int hashCode() {
        return Objects.hash(
            id,
            matricule,
            firstName,
            lastName,
            firstNameAr,
            lastNameAr,
            birthDate,
            birthPlace,
            gender,
            maritalStatus,
            numberOfChildren,
            chefDeFamille,
            nationalId,
            passportNumber,
            nationality,
            address,
            city,
            personalEmail,
            professionalEmail,
            phoneNumber,
            cnssNumber,
            category,
            photoUrl,
            hireDate,
            trialEndDate,
            active,
            createdAt,
            updatedAt,
            companyId,
            departmentId,
            positionId,
            managerId,
            userProfileId,
            distinct
        );
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "EmployeeCriteria{" +
            optionalId().map(f -> "id=" + f + ", ").orElse("") +
            optionalMatricule().map(f -> "matricule=" + f + ", ").orElse("") +
            optionalFirstName().map(f -> "firstName=" + f + ", ").orElse("") +
            optionalLastName().map(f -> "lastName=" + f + ", ").orElse("") +
            optionalFirstNameAr().map(f -> "firstNameAr=" + f + ", ").orElse("") +
            optionalLastNameAr().map(f -> "lastNameAr=" + f + ", ").orElse("") +
            optionalBirthDate().map(f -> "birthDate=" + f + ", ").orElse("") +
            optionalBirthPlace().map(f -> "birthPlace=" + f + ", ").orElse("") +
            optionalGender().map(f -> "gender=" + f + ", ").orElse("") +
            optionalMaritalStatus().map(f -> "maritalStatus=" + f + ", ").orElse("") +
            optionalNumberOfChildren().map(f -> "numberOfChildren=" + f + ", ").orElse("") +
            optionalChefDeFamille().map(f -> "chefDeFamille=" + f + ", ").orElse("") +
            optionalNationalId().map(f -> "nationalId=" + f + ", ").orElse("") +
            optionalPassportNumber().map(f -> "passportNumber=" + f + ", ").orElse("") +
            optionalNationality().map(f -> "nationality=" + f + ", ").orElse("") +
            optionalAddress().map(f -> "address=" + f + ", ").orElse("") +
            optionalCity().map(f -> "city=" + f + ", ").orElse("") +
            optionalPersonalEmail().map(f -> "personalEmail=" + f + ", ").orElse("") +
            optionalProfessionalEmail().map(f -> "professionalEmail=" + f + ", ").orElse("") +
            optionalPhoneNumber().map(f -> "phoneNumber=" + f + ", ").orElse("") +
            optionalCnssNumber().map(f -> "cnssNumber=" + f + ", ").orElse("") +
            optionalCategory().map(f -> "category=" + f + ", ").orElse("") +
            optionalPhotoUrl().map(f -> "photoUrl=" + f + ", ").orElse("") +
            optionalHireDate().map(f -> "hireDate=" + f + ", ").orElse("") +
            optionalTrialEndDate().map(f -> "trialEndDate=" + f + ", ").orElse("") +
            optionalActive().map(f -> "active=" + f + ", ").orElse("") +
            optionalCreatedAt().map(f -> "createdAt=" + f + ", ").orElse("") +
            optionalUpdatedAt().map(f -> "updatedAt=" + f + ", ").orElse("") +
            optionalCompanyId().map(f -> "companyId=" + f + ", ").orElse("") +
            optionalDepartmentId().map(f -> "departmentId=" + f + ", ").orElse("") +
            optionalPositionId().map(f -> "positionId=" + f + ", ").orElse("") +
            optionalManagerId().map(f -> "managerId=" + f + ", ").orElse("") +
            optionalUserProfileId().map(f -> "userProfileId=" + f + ", ").orElse("") +
            optionalDistinct().map(f -> "distinct=" + f + ", ").orElse("") +
        "}";
    }
}
