package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class LeaveRequestCriteriaTest {

    @Test
    void newLeaveRequestCriteriaHasAllFiltersNullTest() {
        var leaveRequestCriteria = new LeaveRequestCriteria();
        assertThat(leaveRequestCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void leaveRequestCriteriaFluentMethodsCreatesFiltersTest() {
        var leaveRequestCriteria = new LeaveRequestCriteria();

        setAllFilters(leaveRequestCriteria);

        assertThat(leaveRequestCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void leaveRequestCriteriaCopyCreatesNullFilterTest() {
        var leaveRequestCriteria = new LeaveRequestCriteria();
        var copy = leaveRequestCriteria.copy();

        assertThat(leaveRequestCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(leaveRequestCriteria)
        );
    }

    @Test
    void leaveRequestCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var leaveRequestCriteria = new LeaveRequestCriteria();
        setAllFilters(leaveRequestCriteria);

        var copy = leaveRequestCriteria.copy();

        assertThat(leaveRequestCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(leaveRequestCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var leaveRequestCriteria = new LeaveRequestCriteria();

        assertThat(leaveRequestCriteria).hasToString("LeaveRequestCriteria{}");
    }

    private static void setAllFilters(LeaveRequestCriteria leaveRequestCriteria) {
        leaveRequestCriteria.id();
        leaveRequestCriteria.startDate();
        leaveRequestCriteria.endDate();
        leaveRequestCriteria.numberOfDays();
        leaveRequestCriteria.status();
        leaveRequestCriteria.requestedAt();
        leaveRequestCriteria.processedAt();
        leaveRequestCriteria.managerComment();
        leaveRequestCriteria.employeeComment();
        leaveRequestCriteria.documentUrl();
        leaveRequestCriteria.employeeId();
        leaveRequestCriteria.leaveTypeId();
        leaveRequestCriteria.approvedById();
        leaveRequestCriteria.distinct();
    }

    private static Condition<LeaveRequestCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getStartDate()) &&
                condition.apply(criteria.getEndDate()) &&
                condition.apply(criteria.getNumberOfDays()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getRequestedAt()) &&
                condition.apply(criteria.getProcessedAt()) &&
                condition.apply(criteria.getManagerComment()) &&
                condition.apply(criteria.getEmployeeComment()) &&
                condition.apply(criteria.getDocumentUrl()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getLeaveTypeId()) &&
                condition.apply(criteria.getApprovedById()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<LeaveRequestCriteria> copyFiltersAre(
        LeaveRequestCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getStartDate(), copy.getStartDate()) &&
                condition.apply(criteria.getEndDate(), copy.getEndDate()) &&
                condition.apply(criteria.getNumberOfDays(), copy.getNumberOfDays()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getRequestedAt(), copy.getRequestedAt()) &&
                condition.apply(criteria.getProcessedAt(), copy.getProcessedAt()) &&
                condition.apply(criteria.getManagerComment(), copy.getManagerComment()) &&
                condition.apply(criteria.getEmployeeComment(), copy.getEmployeeComment()) &&
                condition.apply(criteria.getDocumentUrl(), copy.getDocumentUrl()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getLeaveTypeId(), copy.getLeaveTypeId()) &&
                condition.apply(criteria.getApprovedById(), copy.getApprovedById()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
