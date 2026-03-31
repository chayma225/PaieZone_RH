package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.PayrollPeriodTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

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

    @Test
    void companyTest() {
        PayrollPeriod payrollPeriod = getPayrollPeriodRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        payrollPeriod.setCompany(companyBack);
        assertThat(payrollPeriod.getCompany()).isEqualTo(companyBack);

        payrollPeriod.company(null);
        assertThat(payrollPeriod.getCompany()).isNull();
    }

    @Test
    void createdByTest() {
        PayrollPeriod payrollPeriod = getPayrollPeriodRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        payrollPeriod.setCreatedBy(userProfileBack);
        assertThat(payrollPeriod.getCreatedBy()).isEqualTo(userProfileBack);

        payrollPeriod.createdBy(null);
        assertThat(payrollPeriod.getCreatedBy()).isNull();
    }
}
