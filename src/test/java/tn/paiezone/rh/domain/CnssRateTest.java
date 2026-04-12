package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CnssRateTestSamples.*;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class CnssRateTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CnssRate.class);
        CnssRate cnssRate1 = getCnssRateSample1();
        CnssRate cnssRate2 = new CnssRate();
        assertThat(cnssRate1).isNotEqualTo(cnssRate2);

        cnssRate2.setId(cnssRate1.getId());
        assertThat(cnssRate1).isEqualTo(cnssRate2);

        cnssRate2 = getCnssRateSample2();
        assertThat(cnssRate1).isNotEqualTo(cnssRate2);
    }

    @Test
    void companyTest() {
        CnssRate cnssRate = getCnssRateRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        cnssRate.setCompany(companyBack);
        assertThat(cnssRate.getCompany()).isEqualTo(companyBack);

        cnssRate.company(null);
        assertThat(cnssRate.getCompany()).isNull();
    }
}
