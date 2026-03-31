package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.PaySlipLineTestSamples.*;
import static tn.paiezone.rh.domain.PaySlipTestSamples.*;
import static tn.paiezone.rh.domain.RubriqueTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PaySlipLineTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PaySlipLine.class);
        PaySlipLine paySlipLine1 = getPaySlipLineSample1();
        PaySlipLine paySlipLine2 = new PaySlipLine();
        assertThat(paySlipLine1).isNotEqualTo(paySlipLine2);

        paySlipLine2.setId(paySlipLine1.getId());
        assertThat(paySlipLine1).isEqualTo(paySlipLine2);

        paySlipLine2 = getPaySlipLineSample2();
        assertThat(paySlipLine1).isNotEqualTo(paySlipLine2);
    }

    @Test
    void paySlipTest() {
        PaySlipLine paySlipLine = getPaySlipLineRandomSampleGenerator();
        PaySlip paySlipBack = getPaySlipRandomSampleGenerator();

        paySlipLine.setPaySlip(paySlipBack);
        assertThat(paySlipLine.getPaySlip()).isEqualTo(paySlipBack);

        paySlipLine.paySlip(null);
        assertThat(paySlipLine.getPaySlip()).isNull();
    }

    @Test
    void rubriqueTest() {
        PaySlipLine paySlipLine = getPaySlipLineRandomSampleGenerator();
        Rubrique rubriqueBack = getRubriqueRandomSampleGenerator();

        paySlipLine.setRubrique(rubriqueBack);
        assertThat(paySlipLine.getRubrique()).isEqualTo(rubriqueBack);

        paySlipLine.rubrique(null);
        assertThat(paySlipLine.getRubrique()).isNull();
    }
}
