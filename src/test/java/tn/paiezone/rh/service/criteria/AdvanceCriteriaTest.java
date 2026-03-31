package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class AdvanceCriteriaTest {

    @Test
    void newAdvanceCriteriaHasAllFiltersNullTest() {
        var advanceCriteria = new AdvanceCriteria();
        assertThat(advanceCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void advanceCriteriaFluentMethodsCreatesFiltersTest() {
        var advanceCriteria = new AdvanceCriteria();

        setAllFilters(advanceCriteria);

        assertThat(advanceCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void advanceCriteriaCopyCreatesNullFilterTest() {
        var advanceCriteria = new AdvanceCriteria();
        var copy = advanceCriteria.copy();

        assertThat(advanceCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(advanceCriteria)
        );
    }

    @Test
    void advanceCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var advanceCriteria = new AdvanceCriteria();
        setAllFilters(advanceCriteria);

        var copy = advanceCriteria.copy();

        assertThat(advanceCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(advanceCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var advanceCriteria = new AdvanceCriteria();

        assertThat(advanceCriteria).hasToString("AdvanceCriteria{}");
    }

    private static void setAllFilters(AdvanceCriteria advanceCriteria) {
        advanceCriteria.id();
        advanceCriteria.requestDate();
        advanceCriteria.amount();
        advanceCriteria.deductionMonth();
        advanceCriteria.deductionYear();
        advanceCriteria.status();
        advanceCriteria.approvedBy();
        advanceCriteria.notes();
        advanceCriteria.employeeId();
        advanceCriteria.paySlipId();
        advanceCriteria.approvedByUserId();
        advanceCriteria.distinct();
    }

    private static Condition<AdvanceCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getRequestDate()) &&
                condition.apply(criteria.getAmount()) &&
                condition.apply(criteria.getDeductionMonth()) &&
                condition.apply(criteria.getDeductionYear()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getApprovedBy()) &&
                condition.apply(criteria.getNotes()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getPaySlipId()) &&
                condition.apply(criteria.getApprovedByUserId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<AdvanceCriteria> copyFiltersAre(AdvanceCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getRequestDate(), copy.getRequestDate()) &&
                condition.apply(criteria.getAmount(), copy.getAmount()) &&
                condition.apply(criteria.getDeductionMonth(), copy.getDeductionMonth()) &&
                condition.apply(criteria.getDeductionYear(), copy.getDeductionYear()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getApprovedBy(), copy.getApprovedBy()) &&
                condition.apply(criteria.getNotes(), copy.getNotes()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getPaySlipId(), copy.getPaySlipId()) &&
                condition.apply(criteria.getApprovedByUserId(), copy.getApprovedByUserId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
