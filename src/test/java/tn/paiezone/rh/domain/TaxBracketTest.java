package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.TaxBracketTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class TaxBracketTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TaxBracket.class);
        TaxBracket taxBracket1 = getTaxBracketSample1();
        TaxBracket taxBracket2 = new TaxBracket();
        assertThat(taxBracket1).isNotEqualTo(taxBracket2);

        taxBracket2.setId(taxBracket1.getId());
        assertThat(taxBracket1).isEqualTo(taxBracket2);

        taxBracket2 = getTaxBracketSample2();
        assertThat(taxBracket1).isNotEqualTo(taxBracket2);
    }

    @Test
    void companyTest() {
        TaxBracket taxBracket = getTaxBracketRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        taxBracket.setCompany(companyBack);
        assertThat(taxBracket.getCompany()).isEqualTo(companyBack);

        taxBracket.company(null);
        assertThat(taxBracket.getCompany()).isNull();
    }
}
