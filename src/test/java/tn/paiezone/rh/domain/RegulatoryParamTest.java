package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.RegulatoryParamTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class RegulatoryParamTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(RegulatoryParam.class);
        RegulatoryParam regulatoryParam1 = getRegulatoryParamSample1();
        RegulatoryParam regulatoryParam2 = new RegulatoryParam();
        assertThat(regulatoryParam1).isNotEqualTo(regulatoryParam2);

        regulatoryParam2.setId(regulatoryParam1.getId());
        assertThat(regulatoryParam1).isEqualTo(regulatoryParam2);

        regulatoryParam2 = getRegulatoryParamSample2();
        assertThat(regulatoryParam1).isNotEqualTo(regulatoryParam2);
    }
}
