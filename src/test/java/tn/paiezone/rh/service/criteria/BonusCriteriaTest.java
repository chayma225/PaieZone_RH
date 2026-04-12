package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class BonusCriteriaTest {

    @Test
    void newBonusCriteriaHasAllFiltersNullTest() {
        var bonusCriteria = new BonusCriteria();
        assertThat(bonusCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void bonusCriteriaFluentMethodsCreatesFiltersTest() {
        var bonusCriteria = new BonusCriteria();

        setAllFilters(bonusCriteria);

        assertThat(bonusCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void bonusCriteriaCopyCreatesNullFilterTest() {
        var bonusCriteria = new BonusCriteria();
        var copy = bonusCriteria.copy();

        assertThat(bonusCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(bonusCriteria)
        );
    }

    @Test
    void bonusCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var bonusCriteria = new BonusCriteria();
        setAllFilters(bonusCriteria);

        var copy = bonusCriteria.copy();

        assertThat(bonusCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(bonusCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var bonusCriteria = new BonusCriteria();

        assertThat(bonusCriteria).hasToString("BonusCriteria{}");
    }

    private static void setAllFilters(BonusCriteria bonusCriteria) {
        bonusCriteria.id();
        bonusCriteria.bonusType();
        bonusCriteria.label();
        bonusCriteria.amount();
        bonusCriteria.taxable();
        bonusCriteria.month();
        bonusCriteria.year();
        bonusCriteria.notes();
        bonusCriteria.employeeId();
        bonusCriteria.paySlipId();
        bonusCriteria.distinct();
    }

    private static Condition<BonusCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getBonusType()) &&
                condition.apply(criteria.getLabel()) &&
                condition.apply(criteria.getAmount()) &&
                condition.apply(criteria.getTaxable()) &&
                condition.apply(criteria.getMonth()) &&
                condition.apply(criteria.getYear()) &&
                condition.apply(criteria.getNotes()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getPaySlipId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<BonusCriteria> copyFiltersAre(BonusCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getBonusType(), copy.getBonusType()) &&
                condition.apply(criteria.getLabel(), copy.getLabel()) &&
                condition.apply(criteria.getAmount(), copy.getAmount()) &&
                condition.apply(criteria.getTaxable(), copy.getTaxable()) &&
                condition.apply(criteria.getMonth(), copy.getMonth()) &&
                condition.apply(criteria.getYear(), copy.getYear()) &&
                condition.apply(criteria.getNotes(), copy.getNotes()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getPaySlipId(), copy.getPaySlipId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
