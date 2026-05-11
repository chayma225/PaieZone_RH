package tn.paiezone.rh.domain;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.PayrollPeriodTestSamples.getPayrollPeriodSample1;
import static tn.paiezone.rh.domain.PayrollPeriodTestSamples.getPayrollPeriodSample2;

class PayrollPeriodTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PayrollPeriod.class);

        PayrollPeriod payrollPeriod1 = getPayrollPeriodSample1();
        PayrollPeriod payrollPeriod2 = new PayrollPeriod();
        assertThat(payrollPeriod1).isNotEqualTo(payrollPeriod2);

        payrollPeriod2.setId(payrollPeriod1.getId());
        assertThat(payrollPeriod1).isEqualTo(payrollPeriod2);

        payrollPeriod2 = getPayrollPeriodSample2();
        assertThat(payrollPeriod1).isNotEqualTo(payrollPeriod2);
    }
}
