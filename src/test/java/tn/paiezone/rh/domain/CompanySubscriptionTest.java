package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanySubscriptionTestSamples.*;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class CompanySubscriptionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CompanySubscription.class);
        CompanySubscription companySubscription1 = getCompanySubscriptionSample1();
        CompanySubscription companySubscription2 = new CompanySubscription();
        assertThat(companySubscription1).isNotEqualTo(companySubscription2);

        companySubscription2.setId(companySubscription1.getId());
        assertThat(companySubscription1).isEqualTo(companySubscription2);

        companySubscription2 = getCompanySubscriptionSample2();
        assertThat(companySubscription1).isNotEqualTo(companySubscription2);
    }

    @Test
    void companyTest() {
        CompanySubscription companySubscription = getCompanySubscriptionRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        companySubscription.setCompany(companyBack);
        assertThat(companySubscription.getCompany()).isEqualTo(companyBack);
        assertThat(companyBack.getSubscription()).isEqualTo(companySubscription);

        companySubscription.company(null);
        assertThat(companySubscription.getCompany()).isNull();
        assertThat(companyBack.getSubscription()).isNull();
    }
}
