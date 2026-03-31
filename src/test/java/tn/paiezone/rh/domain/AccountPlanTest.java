package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.AccountPlanTestSamples.*;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AccountPlanTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AccountPlan.class);
        AccountPlan accountPlan1 = getAccountPlanSample1();
        AccountPlan accountPlan2 = new AccountPlan();
        assertThat(accountPlan1).isNotEqualTo(accountPlan2);

        accountPlan2.setId(accountPlan1.getId());
        assertThat(accountPlan1).isEqualTo(accountPlan2);

        accountPlan2 = getAccountPlanSample2();
        assertThat(accountPlan1).isNotEqualTo(accountPlan2);
    }

    @Test
    void companyTest() {
        AccountPlan accountPlan = getAccountPlanRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        accountPlan.setCompany(companyBack);
        assertThat(accountPlan.getCompany()).isEqualTo(companyBack);

        accountPlan.company(null);
        assertThat(accountPlan.getCompany()).isNull();
    }
}
