package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class TimeEntryCriteriaTest {

    @Test
    void newTimeEntryCriteriaHasAllFiltersNullTest() {
        var timeEntryCriteria = new TimeEntryCriteria();
        assertThat(timeEntryCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void timeEntryCriteriaFluentMethodsCreatesFiltersTest() {
        var timeEntryCriteria = new TimeEntryCriteria();

        setAllFilters(timeEntryCriteria);

        assertThat(timeEntryCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void timeEntryCriteriaCopyCreatesNullFilterTest() {
        var timeEntryCriteria = new TimeEntryCriteria();
        var copy = timeEntryCriteria.copy();

        assertThat(timeEntryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(timeEntryCriteria)
        );
    }

    @Test
    void timeEntryCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var timeEntryCriteria = new TimeEntryCriteria();
        setAllFilters(timeEntryCriteria);

        var copy = timeEntryCriteria.copy();

        assertThat(timeEntryCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(timeEntryCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var timeEntryCriteria = new TimeEntryCriteria();

        assertThat(timeEntryCriteria).hasToString("TimeEntryCriteria{}");
    }

    private static void setAllFilters(TimeEntryCriteria timeEntryCriteria) {
        timeEntryCriteria.id();
        timeEntryCriteria.entryDate();
        timeEntryCriteria.checkIn();
        timeEntryCriteria.checkOut();
        timeEntryCriteria.workedHours();
        timeEntryCriteria.overtimeHours();
        timeEntryCriteria.lateMinutes();
        timeEntryCriteria.source();
        timeEntryCriteria.status();
        timeEntryCriteria.anomalyNote();
        timeEntryCriteria.validatedBy();
        timeEntryCriteria.validatedAt();
        timeEntryCriteria.employeeId();
        timeEntryCriteria.validatedByUserId();
        timeEntryCriteria.distinct();
    }

    private static Condition<TimeEntryCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getEntryDate()) &&
                condition.apply(criteria.getCheckIn()) &&
                condition.apply(criteria.getCheckOut()) &&
                condition.apply(criteria.getWorkedHours()) &&
                condition.apply(criteria.getOvertimeHours()) &&
                condition.apply(criteria.getLateMinutes()) &&
                condition.apply(criteria.getSource()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getAnomalyNote()) &&
                condition.apply(criteria.getValidatedBy()) &&
                condition.apply(criteria.getValidatedAt()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getValidatedByUserId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<TimeEntryCriteria> copyFiltersAre(TimeEntryCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getEntryDate(), copy.getEntryDate()) &&
                condition.apply(criteria.getCheckIn(), copy.getCheckIn()) &&
                condition.apply(criteria.getCheckOut(), copy.getCheckOut()) &&
                condition.apply(criteria.getWorkedHours(), copy.getWorkedHours()) &&
                condition.apply(criteria.getOvertimeHours(), copy.getOvertimeHours()) &&
                condition.apply(criteria.getLateMinutes(), copy.getLateMinutes()) &&
                condition.apply(criteria.getSource(), copy.getSource()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getAnomalyNote(), copy.getAnomalyNote()) &&
                condition.apply(criteria.getValidatedBy(), copy.getValidatedBy()) &&
                condition.apply(criteria.getValidatedAt(), copy.getValidatedAt()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getValidatedByUserId(), copy.getValidatedByUserId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
