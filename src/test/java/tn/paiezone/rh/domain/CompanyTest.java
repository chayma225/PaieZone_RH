package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanySubscriptionTestSamples.*;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class CompanyTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Company.class);
        Company company1 = getCompanySample1();
        Company company2 = new Company();
        assertThat(company1).isNotEqualTo(company2);

        company2.setId(company1.getId());
        assertThat(company1).isEqualTo(company2);

        company2 = getCompanySample2();
        assertThat(company1).isNotEqualTo(company2);
    }

    @Test
    void subscriptionTest() {
        Company company = getCompanyRandomSampleGenerator();
        CompanySubscription companySubscriptionBack = getCompanySubscriptionRandomSampleGenerator();

        company.setSubscription(companySubscriptionBack);
        assertThat(company.getSubscription()).isEqualTo(companySubscriptionBack);

        company.subscription(null);
        assertThat(company.getSubscription()).isNull();
    }
}
