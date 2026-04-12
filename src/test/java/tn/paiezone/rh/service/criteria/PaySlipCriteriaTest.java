package tn.paiezone.rh.service.criteria;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Objects;
import java.util.function.BiFunction;
import java.util.function.Function;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Test;

class PaySlipCriteriaTest {

    @Test
    void newPaySlipCriteriaHasAllFiltersNullTest() {
        var paySlipCriteria = new PaySlipCriteria();
        assertThat(paySlipCriteria).is(criteriaFiltersAre(Objects::isNull));
    }

    @Test
    void paySlipCriteriaFluentMethodsCreatesFiltersTest() {
        var paySlipCriteria = new PaySlipCriteria();

        setAllFilters(paySlipCriteria);

        assertThat(paySlipCriteria).is(criteriaFiltersAre(Objects::nonNull));
    }

    @Test
    void paySlipCriteriaCopyCreatesNullFilterTest() {
        var paySlipCriteria = new PaySlipCriteria();
        var copy = paySlipCriteria.copy();

        assertThat(paySlipCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::isNull)),
            criteria -> assertThat(criteria).isEqualTo(paySlipCriteria)
        );
    }

    @Test
    void paySlipCriteriaCopyDuplicatesEveryExistingFilterTest() {
        var paySlipCriteria = new PaySlipCriteria();
        setAllFilters(paySlipCriteria);

        var copy = paySlipCriteria.copy();

        assertThat(paySlipCriteria).satisfies(
            criteria ->
                assertThat(criteria).is(
                    copyFiltersAre(copy, (a, b) -> (a == null || a instanceof Boolean) ? a == b : (a != b && a.equals(b)))
                ),
            criteria -> assertThat(criteria).isEqualTo(copy),
            criteria -> assertThat(criteria).hasSameHashCodeAs(copy)
        );

        assertThat(copy).satisfies(
            criteria -> assertThat(criteria).is(criteriaFiltersAre(Objects::nonNull)),
            criteria -> assertThat(criteria).isEqualTo(paySlipCriteria)
        );
    }

    @Test
    void toStringVerifier() {
        var paySlipCriteria = new PaySlipCriteria();

        assertThat(paySlipCriteria).hasToString("PaySlipCriteria{}");
    }

    private static void setAllFilters(PaySlipCriteria paySlipCriteria) {
        paySlipCriteria.id();
        paySlipCriteria.month();
        paySlipCriteria.year();
        paySlipCriteria.baseSalary();
        paySlipCriteria.totalGains();
        paySlipCriteria.totalDeductions();
        paySlipCriteria.grossSalary();
        paySlipCriteria.cnssSalaryAmount();
        paySlipCriteria.cavisAmount();
        paySlipCriteria.taxableIncome();
        paySlipCriteria.irppAmount();
        paySlipCriteria.netSalary();
        paySlipCriteria.employerCnss();
        paySlipCriteria.employerCavis();
        paySlipCriteria.totalEmployerCost();
        paySlipCriteria.workedDays();
        paySlipCriteria.paidLeaveDays();
        paySlipCriteria.unpaidDays();
        paySlipCriteria.overtimeHours();
        paySlipCriteria.status();
        paySlipCriteria.pdfUrl();
        paySlipCriteria.generatedAt();
        paySlipCriteria.sentToEmployeeAt();
        paySlipCriteria.bankTransferRef();
        paySlipCriteria.employeeId();
        paySlipCriteria.payrollPeriodId();
        paySlipCriteria.contractId();
        paySlipCriteria.distinct();
    }

    private static Condition<PaySlipCriteria> criteriaFiltersAre(Function<Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId()) &&
                condition.apply(criteria.getMonth()) &&
                condition.apply(criteria.getYear()) &&
                condition.apply(criteria.getBaseSalary()) &&
                condition.apply(criteria.getTotalGains()) &&
                condition.apply(criteria.getTotalDeductions()) &&
                condition.apply(criteria.getGrossSalary()) &&
                condition.apply(criteria.getCnssSalaryAmount()) &&
                condition.apply(criteria.getCavisAmount()) &&
                condition.apply(criteria.getTaxableIncome()) &&
                condition.apply(criteria.getIrppAmount()) &&
                condition.apply(criteria.getNetSalary()) &&
                condition.apply(criteria.getEmployerCnss()) &&
                condition.apply(criteria.getEmployerCavis()) &&
                condition.apply(criteria.getTotalEmployerCost()) &&
                condition.apply(criteria.getWorkedDays()) &&
                condition.apply(criteria.getPaidLeaveDays()) &&
                condition.apply(criteria.getUnpaidDays()) &&
                condition.apply(criteria.getOvertimeHours()) &&
                condition.apply(criteria.getStatus()) &&
                condition.apply(criteria.getPdfUrl()) &&
                condition.apply(criteria.getGeneratedAt()) &&
                condition.apply(criteria.getSentToEmployeeAt()) &&
                condition.apply(criteria.getBankTransferRef()) &&
                condition.apply(criteria.getEmployeeId()) &&
                condition.apply(criteria.getPayrollPeriodId()) &&
                condition.apply(criteria.getContractId()) &&
                condition.apply(criteria.getDistinct()),
            "every filter matches"
        );
    }

    private static Condition<PaySlipCriteria> copyFiltersAre(PaySlipCriteria copy, BiFunction<Object, Object, Boolean> condition) {
        return new Condition<>(
            criteria ->
                condition.apply(criteria.getId(), copy.getId()) &&
                condition.apply(criteria.getMonth(), copy.getMonth()) &&
                condition.apply(criteria.getYear(), copy.getYear()) &&
                condition.apply(criteria.getBaseSalary(), copy.getBaseSalary()) &&
                condition.apply(criteria.getTotalGains(), copy.getTotalGains()) &&
                condition.apply(criteria.getTotalDeductions(), copy.getTotalDeductions()) &&
                condition.apply(criteria.getGrossSalary(), copy.getGrossSalary()) &&
                condition.apply(criteria.getCnssSalaryAmount(), copy.getCnssSalaryAmount()) &&
                condition.apply(criteria.getCavisAmount(), copy.getCavisAmount()) &&
                condition.apply(criteria.getTaxableIncome(), copy.getTaxableIncome()) &&
                condition.apply(criteria.getIrppAmount(), copy.getIrppAmount()) &&
                condition.apply(criteria.getNetSalary(), copy.getNetSalary()) &&
                condition.apply(criteria.getEmployerCnss(), copy.getEmployerCnss()) &&
                condition.apply(criteria.getEmployerCavis(), copy.getEmployerCavis()) &&
                condition.apply(criteria.getTotalEmployerCost(), copy.getTotalEmployerCost()) &&
                condition.apply(criteria.getWorkedDays(), copy.getWorkedDays()) &&
                condition.apply(criteria.getPaidLeaveDays(), copy.getPaidLeaveDays()) &&
                condition.apply(criteria.getUnpaidDays(), copy.getUnpaidDays()) &&
                condition.apply(criteria.getOvertimeHours(), copy.getOvertimeHours()) &&
                condition.apply(criteria.getStatus(), copy.getStatus()) &&
                condition.apply(criteria.getPdfUrl(), copy.getPdfUrl()) &&
                condition.apply(criteria.getGeneratedAt(), copy.getGeneratedAt()) &&
                condition.apply(criteria.getSentToEmployeeAt(), copy.getSentToEmployeeAt()) &&
                condition.apply(criteria.getBankTransferRef(), copy.getBankTransferRef()) &&
                condition.apply(criteria.getEmployeeId(), copy.getEmployeeId()) &&
                condition.apply(criteria.getPayrollPeriodId(), copy.getPayrollPeriodId()) &&
                condition.apply(criteria.getContractId(), copy.getContractId()) &&
                condition.apply(criteria.getDistinct(), copy.getDistinct()),
            "every filter matches"
        );
    }
}
