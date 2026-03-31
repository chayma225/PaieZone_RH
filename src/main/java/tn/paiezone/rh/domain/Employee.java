package tn.paiezone.rh.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import tn.paiezone.rh.domain.enumeration.EmployeeCategory;
import tn.paiezone.rh.domain.enumeration.Gender;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;

/**
 * Dossier Employé
 */
@Entity
@Table(name = "employee")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Size(max = 20)
    @Column(name = "matricule", length = 20, nullable = false, unique = true)
    private String matricule;

    @NotNull
    @Size(max = 100)
    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @NotNull
    @Size(max = 100)
    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Size(max = 100)
    @Column(name = "first_name_ar", length = 100)
    private String firstNameAr;

    @Size(max = 100)
    @Column(name = "last_name_ar", length = 100)
    private String lastNameAr;

    @NotNull
    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Size(max = 100)
    @Column(name = "birth_place", length = 100)
    private String birthPlace;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", nullable = false)
    private Gender gender;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "marital_status", nullable = false)
    private MaritalStatus maritalStatus;

    @NotNull
    @Min(value = 0)
    @Max(value = 10)
    @Column(name = "number_of_children", nullable = false)
    private Integer numberOfChildren;

    @NotNull
    @Column(name = "chef_de_famille", nullable = false)
    private Boolean chefDeFamille;

    @NotNull
    @Size(max = 20)
    @Column(name = "national_id", length = 20, nullable = false, unique = true)
    private String nationalId;

    @Size(max = 20)
    @Column(name = "passport_number", length = 20)
    private String passportNumber;

    @Size(max = 50)
    @Column(name = "nationality", length = 50)
    private String nationality;

    @Size(max = 255)
    @Column(name = "address", length = 255)
    private String address;

    @Size(max = 100)
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 100)
    @Column(name = "personal_email", length = 100)
    private String personalEmail;

    @Size(max = 100)
    @Column(name = "professional_email", length = 100)
    private String professionalEmail;

    @Size(max = 20)
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Size(max = 20)
    @Column(name = "cnss_number", length = 20)
    private String cnssNumber;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private EmployeeCategory category;

    @Size(max = 500)
    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @NotNull
    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "trial_end_date")
    private LocalDate trialEndDate;

    @NotNull
    @Column(name = "active", nullable = false)
    private Boolean active;

    @Lob
    @Column(name = "notes")
    private String notes;

    @NotNull
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "subscription" }, allowSetters = true)
    private Company company;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "manager" }, allowSetters = true)
    private Department department;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "company", "department" }, allowSetters = true)
    private JobPosition position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company", "department", "position", "manager", "userProfile" }, allowSetters = true)
    private Employee manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "company" }, allowSetters = true)
    private UserProfile userProfile;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Employee id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMatricule() {
        return this.matricule;
    }

    public Employee matricule(String matricule) {
        this.setMatricule(matricule);
        return this;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public Employee firstName(String firstName) {
        this.setFirstName(firstName);
        return this;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public Employee lastName(String lastName) {
        this.setLastName(lastName);
        return this;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getFirstNameAr() {
        return this.firstNameAr;
    }

    public Employee firstNameAr(String firstNameAr) {
        this.setFirstNameAr(firstNameAr);
        return this;
    }

    public void setFirstNameAr(String firstNameAr) {
        this.firstNameAr = firstNameAr;
    }

    public String getLastNameAr() {
        return this.lastNameAr;
    }

    public Employee lastNameAr(String lastNameAr) {
        this.setLastNameAr(lastNameAr);
        return this;
    }

    public void setLastNameAr(String lastNameAr) {
        this.lastNameAr = lastNameAr;
    }

    public LocalDate getBirthDate() {
        return this.birthDate;
    }

    public Employee birthDate(LocalDate birthDate) {
        this.setBirthDate(birthDate);
        return this;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getBirthPlace() {
        return this.birthPlace;
    }

    public Employee birthPlace(String birthPlace) {
        this.setBirthPlace(birthPlace);
        return this;
    }

    public void setBirthPlace(String birthPlace) {
        this.birthPlace = birthPlace;
    }

    public Gender getGender() {
        return this.gender;
    }

    public Employee gender(Gender gender) {
        this.setGender(gender);
        return this;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public MaritalStatus getMaritalStatus() {
        return this.maritalStatus;
    }

    public Employee maritalStatus(MaritalStatus maritalStatus) {
        this.setMaritalStatus(maritalStatus);
        return this;
    }

    public void setMaritalStatus(MaritalStatus maritalStatus) {
        this.maritalStatus = maritalStatus;
    }

    public Integer getNumberOfChildren() {
        return this.numberOfChildren;
    }

    public Employee numberOfChildren(Integer numberOfChildren) {
        this.setNumberOfChildren(numberOfChildren);
        return this;
    }

    public void setNumberOfChildren(Integer numberOfChildren) {
        this.numberOfChildren = numberOfChildren;
    }

    public Boolean getChefDeFamille() {
        return this.chefDeFamille;
    }

    public Employee chefDeFamille(Boolean chefDeFamille) {
        this.setChefDeFamille(chefDeFamille);
        return this;
    }

    public void setChefDeFamille(Boolean chefDeFamille) {
        this.chefDeFamille = chefDeFamille;
    }

    public String getNationalId() {
        return this.nationalId;
    }

    public Employee nationalId(String nationalId) {
        this.setNationalId(nationalId);
        return this;
    }

    public void setNationalId(String nationalId) {
        this.nationalId = nationalId;
    }

    public String getPassportNumber() {
        return this.passportNumber;
    }

    public Employee passportNumber(String passportNumber) {
        this.setPassportNumber(passportNumber);
        return this;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportNumber = passportNumber;
    }

    public String getNationality() {
        return this.nationality;
    }

    public Employee nationality(String nationality) {
        this.setNationality(nationality);
        return this;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getAddress() {
        return this.address;
    }

    public Employee address(String address) {
        this.setAddress(address);
        return this;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return this.city;
    }

    public Employee city(String city) {
        this.setCity(city);
        return this;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPersonalEmail() {
        return this.personalEmail;
    }

    public Employee personalEmail(String personalEmail) {
        this.setPersonalEmail(personalEmail);
        return this;
    }

    public void setPersonalEmail(String personalEmail) {
        this.personalEmail = personalEmail;
    }

    public String getProfessionalEmail() {
        return this.professionalEmail;
    }

    public Employee professionalEmail(String professionalEmail) {
        this.setProfessionalEmail(professionalEmail);
        return this;
    }

    public void setProfessionalEmail(String professionalEmail) {
        this.professionalEmail = professionalEmail;
    }

    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    public Employee phoneNumber(String phoneNumber) {
        this.setPhoneNumber(phoneNumber);
        return this;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCnssNumber() {
        return this.cnssNumber;
    }

    public Employee cnssNumber(String cnssNumber) {
        this.setCnssNumber(cnssNumber);
        return this;
    }

    public void setCnssNumber(String cnssNumber) {
        this.cnssNumber = cnssNumber;
    }

    public EmployeeCategory getCategory() {
        return this.category;
    }

    public Employee category(EmployeeCategory category) {
        this.setCategory(category);
        return this;
    }

    public void setCategory(EmployeeCategory category) {
        this.category = category;
    }

    public String getPhotoUrl() {
        return this.photoUrl;
    }

    public Employee photoUrl(String photoUrl) {
        this.setPhotoUrl(photoUrl);
        return this;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public LocalDate getHireDate() {
        return this.hireDate;
    }

    public Employee hireDate(LocalDate hireDate) {
        this.setHireDate(hireDate);
        return this;
    }

    public void setHireDate(LocalDate hireDate) {
        this.hireDate = hireDate;
    }

    public LocalDate getTrialEndDate() {
        return this.trialEndDate;
    }

    public Employee trialEndDate(LocalDate trialEndDate) {
        this.setTrialEndDate(trialEndDate);
        return this;
    }

    public void setTrialEndDate(LocalDate trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    public Boolean getActive() {
        return this.active;
    }

    public Employee active(Boolean active) {
        this.setActive(active);
        return this;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getNotes() {
        return this.notes;
    }

    public Employee notes(String notes) {
        this.setNotes(notes);
        return this;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public Employee createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return this.updatedAt;
    }

    public Employee updatedAt(Instant updatedAt) {
        this.setUpdatedAt(updatedAt);
        return this;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Company getCompany() {
        return this.company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public Employee company(Company company) {
        this.setCompany(company);
        return this;
    }

    public Department getDepartment() {
        return this.department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Employee department(Department department) {
        this.setDepartment(department);
        return this;
    }

    public JobPosition getPosition() {
        return this.position;
    }

    public void setPosition(JobPosition jobPosition) {
        this.position = jobPosition;
    }

    public Employee position(JobPosition jobPosition) {
        this.setPosition(jobPosition);
        return this;
    }

    public Employee getManager() {
        return this.manager;
    }

    public void setManager(Employee employee) {
        this.manager = employee;
    }

    public Employee manager(Employee employee) {
        this.setManager(employee);
        return this;
    }

    public UserProfile getUserProfile() {
        return this.userProfile;
    }

    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
    }

    public Employee userProfile(UserProfile userProfile) {
        this.setUserProfile(userProfile);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Employee)) {
            return false;
        }
        return getId() != null && getId().equals(((Employee) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Employee{" +
            "id=" + getId() +
            ", matricule='" + getMatricule() + "'" +
            ", firstName='" + getFirstName() + "'" +
            ", lastName='" + getLastName() + "'" +
            ", firstNameAr='" + getFirstNameAr() + "'" +
            ", lastNameAr='" + getLastNameAr() + "'" +
            ", birthDate='" + getBirthDate() + "'" +
            ", birthPlace='" + getBirthPlace() + "'" +
            ", gender='" + getGender() + "'" +
            ", maritalStatus='" + getMaritalStatus() + "'" +
            ", numberOfChildren=" + getNumberOfChildren() +
            ", chefDeFamille='" + getChefDeFamille() + "'" +
            ", nationalId='" + getNationalId() + "'" +
            ", passportNumber='" + getPassportNumber() + "'" +
            ", nationality='" + getNationality() + "'" +
            ", address='" + getAddress() + "'" +
            ", city='" + getCity() + "'" +
            ", personalEmail='" + getPersonalEmail() + "'" +
            ", professionalEmail='" + getProfessionalEmail() + "'" +
            ", phoneNumber='" + getPhoneNumber() + "'" +
            ", cnssNumber='" + getCnssNumber() + "'" +
            ", category='" + getCategory() + "'" +
            ", photoUrl='" + getPhotoUrl() + "'" +
            ", hireDate='" + getHireDate() + "'" +
            ", trialEndDate='" + getTrialEndDate() + "'" +
            ", active='" + getActive() + "'" +
            ", notes='" + getNotes() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            "}";
    }
}
