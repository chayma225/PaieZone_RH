package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.RubriqueTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class RubriqueTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Rubrique.class);
        Rubrique rubrique1 = getRubriqueSample1();
        Rubrique rubrique2 = new Rubrique();
        assertThat(rubrique1).isNotEqualTo(rubrique2);

        rubrique2.setId(rubrique1.getId());
        assertThat(rubrique1).isEqualTo(rubrique2);

        rubrique2 = getRubriqueSample2();
        assertThat(rubrique1).isNotEqualTo(rubrique2);
    }

    @Test
    void companyTest() {
        Rubrique rubrique = getRubriqueRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        rubrique.setCompany(companyBack);
        assertThat(rubrique.getCompany()).isEqualTo(companyBack);

        rubrique.company(null);
        assertThat(rubrique.getCompany()).isNull();
    }
}
