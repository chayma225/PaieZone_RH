package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class ContractCriteriaTest {

    @Test
    void newContractCriteriaHasAllFiltersNullTest() {
        var contractCriteria = new ContractCriteria();
        assertThat(contractCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void contractCriteriaFluentMethodsCreatesFiltersTest() {
        var contractCriteria = new ContractCriteria();

        setAllFilters(contractCriteria);

        assertThat(contractCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void contractCriteriaCopyCreatesNullFilterTest() {
        var contractCriteria = new ContractCriteria();
        var copy = contractCriteria.copy();

        assertThat(contractCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(contractCriteria)
        );
    }

    @Test
    void contractCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var contractCriteria = new ContractCriteria();
        setAllFilters(contractCriteria);

        var copy = contractCriteria.copy();

        assertThat(contractCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(contractCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var contractCriteria = new ContractCriteria();

        assertThat(contractCriteria).hasToString("ContractCriteria{}");
    }

    private static void setAllFilters(ContractCriteria contractCriteria) {
        contractCriteria.id();
        contractCriteria.reference();
        contractCriteria.contractType();
        contractCriteria.status();
        contractCriteria.startDate();
        contractCriteria.endDate();
        contractCriteria.signedDate();
        contractCriteria.baseSalary();
        contractCriteria.workingHoursWeek();
        contractCriteria.workingDaysWeek();
        contractCriteria.conventionCollective();
        contractCriteria.trialPeriodMonths();
        contractCriteria.renewalCount();
        contractCriteria.documentUrl();
        contractCriteria.createdAt();
        contractCriteria.employeeId();
        contractCriteria.createdById();
        contractCriteria.distinct();
    }

    private static Condition<ContractCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getReference()) &&
                condition.apply(criteria.getContractType()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getStartDate()) &&
                condition.apply(criteria.getEndDate()) &&
                condition.apply(criteria.getSignedDate()) &&
                condition.apply(criteria.getBaseSalary()) &&
                condition.apply(criteria.getWorkingHoursWeek()) &&
                condition.apply(criteria.getWorkingDaysWeek()) &&
                condition.apply(criteria.getConventionCollective()) &&
                condition.apply(criteria.getTrialPeriodMonths()) &&
                condition.apply(criteria.getRenewalCount()) &&
                condition.apply(criteria.getDocumentUrl()) &&
                condition.apply(criteria.getCreatedAt()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getCreatedById()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<ContractCriteria> copyFiltersAre(ContractCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getReference(), copy.getReference()) &&
                condition.apply(criteria.getContractType(), copy.getContractType()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getStartDate(), copy.getStartDate()) &&
                condition.apply(criteria.getEndDate(), copy.getEndDate()) &&
                condition.apply(criteria.getSignedDate(), copy.getSignedDate()) &&
                condition.apply(criteria.getBaseSalary(), copy.getBaseSalary()) &&
                condition.apply(criteria.getWorkingHoursWeek(), copy.getWorkingHoursWeek()) &&
                condition.apply(criteria.getWorkingDaysWeek(), copy.getWorkingDaysWeek()) &&
                condition.apply(criteria.getConventionCollective(), copy.getConventionCollective()) &&
                condition.apply(criteria.getTrialPeriodMonths(), copy.getTrialPeriodMonths()) &&
                condition.apply(criteria.getRenewalCount(), copy.getRenewalCount()) &&
                condition.apply(criteria.getDocumentUrl(), copy.getDocumentUrl()) &&
                condition.apply(criteria.getCreatedAt(), copy.getCreatedAt()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getCreatedById(), copy.getCreatedById()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
