package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class OfficialDocumentCriteriaTest {

    @Test
    void newOfficialDocumentCriteriaHasAllFiltersNullTest() {
        var officialDocumentCriteria = new OfficialDocumentCriteria();
        assertThat(officialDocumentCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void officialDocumentCriteriaFluentMethodsCreatesFiltersTest() {
        var officialDocumentCriteria = new OfficialDocumentCriteria();

        setAllFilters(officialDocumentCriteria);

        assertThat(officialDocumentCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void officialDocumentCriteriaCopyCreatesNullFilterTest() {
        var officialDocumentCriteria = new OfficialDocumentCriteria();
        var copy = officialDocumentCriteria.copy();

        assertThat(officialDocumentCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(officialDocumentCriteria)
        );
    }

    @Test
    void officialDocumentCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var officialDocumentCriteria = new OfficialDocumentCriteria();
        setAllFilters(officialDocumentCriteria);

        var copy = officialDocumentCriteria.copy();

        assertThat(officialDocumentCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(officialDocumentCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var officialDocumentCriteria = new OfficialDocumentCriteria();

        assertThat(officialDocumentCriteria).hasToString("OfficialDocumentCriteria{}");
    }

    private static void setAllFilters(OfficialDocumentCriteria officialDocumentCriteria) {
        officialDocumentCriteria.id();
        officialDocumentCriteria.docType();
        officialDocumentCriteria.title();
        officialDocumentCriteria.month();
        officialDocumentCriteria.year();
        officialDocumentCriteria.generatedAt();
        officialDocumentCriteria.fileUrl();
        officialDocumentCriteria.signedBy();
        officialDocumentCriteria.sentAt();
        officialDocumentCriteria.notes();
        officialDocumentCriteria.companyId();
        officialDocumentCriteria.employeeId();
        officialDocumentCriteria.generatedById();
        officialDocumentCriteria.distinct();
    }

    private static Condition<OfficialDocumentCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getDocType()) &&
                condition.apply(criteria.getTitle()) &&
                condition.apply(criteria.getMonth()) &&
                condition.apply(criteria.getYear()) &&
                condition.apply(criteria.getGeneratedAt()) &&
                condition.apply(criteria.getFileUrl()) &&
                condition.apply(criteria.getSignedBy()) &&
                condition.apply(criteria.getSentAt()) &&
                condition.apply(criteria.getNotes()) &&
                condition.apply(criteria.getCompanyId()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getGeneratedById()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<OfficialDocumentCriteria> copyFiltersAre(
        OfficialDocumentCriteria copy,
        BiFunction<Object, Object, Boolean> condition
    ) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getDocType(), copy.getDocType()) &&
                condition.apply(criteria.getTitle(), copy.getTitle()) &&
                condition.apply(criteria.getMonth(), copy.getMonth()) &&
                condition.apply(criteria.getYear(), copy.getYear()) &&
                condition.apply(criteria.getGeneratedAt(), copy.getGeneratedAt()) &&
                condition.apply(criteria.getFileUrl(), copy.getFileUrl()) &&
                condition.apply(criteria.getSignedBy(), copy.getSignedBy()) &&
                condition.apply(criteria.getSentAt(), copy.getSentAt()) &&
                condition.apply(criteria.getNotes(), copy.getNotes()) &&
                condition.apply(criteria.getCompanyId(), copy.getCompanyId()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getGeneratedById(), copy.getGeneratedById()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
