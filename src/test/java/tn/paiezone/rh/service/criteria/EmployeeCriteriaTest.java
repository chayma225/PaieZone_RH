package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class EmployeeCriteriaTest {

    @Test
    void newEmployeeCriteriaHasAllFiltersNullTest() {
        var employeeCriteria = new EmployeeCriteria();
        assertThat(employeeCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void employeeCriteriaFluentMethodsCreatesFiltersTest() {
        var employeeCriteria = new EmployeeCriteria();

        setAllFilters(employeeCriteria);

        assertThat(employeeCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void employeeCriteriaCopyCreatesNullFilterTest() {
        var employeeCriteria = new EmployeeCriteria();
        var copy = employeeCriteria.copy();

        assertThat(employeeCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(employeeCriteria)
        );
    }

    @Test
    void employeeCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var employeeCriteria = new EmployeeCriteria();
        setAllFilters(employeeCriteria);

        var copy = employeeCriteria.copy();

        assertThat(employeeCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(employeeCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var employeeCriteria = new EmployeeCriteria();

        assertThat(employeeCriteria).hasToString("EmployeeCriteria{}");
    }

    private static void setAllFilters(EmployeeCriteria employeeCriteria) {
        employeeCriteria.id();
        employeeCriteria.matricule();
        employeeCriteria.firstName();
        employeeCriteria.lastName();
        employeeCriteria.firstNameAr();
        employeeCriteria.lastNameAr();
        employeeCriteria.birthDate();
        employeeCriteria.birthPlace();
        employeeCriteria.gender();
        employeeCriteria.maritalStatus();
        employeeCriteria.numberOfChildren();
        employeeCriteria.chefDeFamille();
        employeeCriteria.nationalId();
        employeeCriteria.passportNumber();
        employeeCriteria.nationality();
        employeeCriteria.address();
        employeeCriteria.city();
        employeeCriteria.personalEmail();
        employeeCriteria.professionalEmail();
        employeeCriteria.phoneNumber();
        employeeCriteria.cnssNumber();
        employeeCriteria.category();
        employeeCriteria.photoUrl();
        employeeCriteria.hireDate();
        employeeCriteria.trialEndDate();
        employeeCriteria.active();
        employeeCriteria.createdAt();
        employeeCriteria.updatedAt();
        employeeCriteria.companyId();
        employeeCriteria.departmentId();
        employeeCriteria.positionId();
        employeeCriteria.managerId();
        employeeCriteria.userProfileId();
        employeeCriteria.distinct();
    }

    private static Condition<EmployeeCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getMatricule()) &&
                condition.apply(criteria.getFirstName()) &&
                condition.apply(criteria.getLastName()) &&
                condition.apply(criteria.getFirstNameAr()) &&
                condition.apply(criteria.getLastNameAr()) &&
                condition.apply(criteria.getBirthDate()) &&
                condition.apply(criteria.getBirthPlace()) &&
                condition.apply(criteria.getGender()) &&
                condition.apply(criteria.getMaritalStatus()) &&
                condition.apply(criteria.getNumberOfChildren()) &&
                condition.apply(criteria.getChefDeFamille()) &&
                condition.apply(criteria.getNationalId()) &&
                condition.apply(criteria.getPassportNumber()) &&
                condition.apply(criteria.getNationality()) &&
                condition.apply(criteria.getAddress()) &&
                condition.apply(criteria.getCity()) &&
                condition.apply(criteria.getPersonalEmail()) &&
                condition.apply(criteria.getProfessionalEmail()) &&
                condition.apply(criteria.getPhoneNumber()) &&
                condition.apply(criteria.getCnssNumber()) &&
                condition.apply(criteria.getCategory()) &&
                condition.apply(criteria.getPhotoUrl()) &&
                condition.apply(criteria.getHireDate()) &&
                condition.apply(criteria.getTrialEndDate()) &&
                condition.apply(criteria.getActive()) &&
                condition.apply(criteria.getCreatedAt()) &&
                condition.apply(criteria.getUpdatedAt()) &&
                condition.apply(criteria.getCompanyId()) &&
                condition.apply(criteria.getDepartmentId()) &&
                condition.apply(criteria.getPositionId()) &&
                condition.apply(criteria.getManagerId()) &&
                condition.apply(criteria.getUserProfileId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<EmployeeCriteria> copyFiltersAre(EmployeeCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getMatricule(), copy.getMatricule()) &&
                condition.apply(criteria.getFirstName(), copy.getFirstName()) &&
                condition.apply(criteria.getLastName(), copy.getLastName()) &&
                condition.apply(criteria.getFirstNameAr(), copy.getFirstNameAr()) &&
                condition.apply(criteria.getLastNameAr(), copy.getLastNameAr()) &&
                condition.apply(criteria.getBirthDate(), copy.getBirthDate()) &&
                condition.apply(criteria.getBirthPlace(), copy.getBirthPlace()) &&
                condition.apply(criteria.getGender(), copy.getGender()) &&
                condition.apply(criteria.getMaritalStatus(), copy.getMaritalStatus()) &&
                condition.apply(criteria.getNumberOfChildren(), copy.getNumberOfChildren()) &&
                condition.apply(criteria.getChefDeFamille(), copy.getChefDeFamille()) &&
                condition.apply(criteria.getNationalId(), copy.getNationalId()) &&
                condition.apply(criteria.getPassportNumber(), copy.getPassportNumber()) &&
                condition.apply(criteria.getNationality(), copy.getNationality()) &&
                condition.apply(criteria.getAddress(), copy.getAddress()) &&
                condition.apply(criteria.getCity(), copy.getCity()) &&
                condition.apply(criteria.getPersonalEmail(), copy.getPersonalEmail()) &&
                condition.apply(criteria.getProfessionalEmail(), copy.getProfessionalEmail()) &&
                condition.apply(criteria.getPhoneNumber(), copy.getPhoneNumber()) &&
                condition.apply(criteria.getCnssNumber(), copy.getCnssNumber()) &&
                condition.apply(criteria.getCategory(), copy.getCategory()) &&
                condition.apply(criteria.getPhotoUrl(), copy.getPhotoUrl()) &&
                condition.apply(criteria.getHireDate(), copy.getHireDate()) &&
                condition.apply(criteria.getTrialEndDate(), copy.getTrialEndDate()) &&
                condition.apply(criteria.getActive(), copy.getActive()) &&
                condition.apply(criteria.getCreatedAt(), copy.getCreatedAt()) &&
                condition.apply(criteria.getUpdatedAt(), copy.getUpdatedAt()) &&
                condition.apply(criteria.getCompanyId(), copy.getCompanyId()) &&
                condition.apply(criteria.getDepartmentId(), copy.getDepartmentId()) &&
                condition.apply(criteria.getPositionId(), copy.getPositionId()) &&
                condition.apply(criteria.getManagerId(), copy.getManagerId()) &&
                condition.apply(criteria.getUserProfileId(), copy.getUserProfileId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
