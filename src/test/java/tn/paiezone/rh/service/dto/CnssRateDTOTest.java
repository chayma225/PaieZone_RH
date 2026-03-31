package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class CnssRateDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CnssRateDTO.class);
        CnssRateDTO cnssRateDTO1 = new CnssRateDTO();
        cnssRateDTO1.setId(1L);
        CnssRateDTO cnssRateDTO2 = new CnssRateDTO();
        assertThat(cnssRateDTO1).isNotEqualTo(cnssRateDTO2);
        cnssRateDTO2.setId(cnssRateDTO1.getId());
        assertThat(cnssRateDTO1).isEqualTo(cnssRateDTO2);
        cnssRateDTO2.setId(2L);
        assertThat(cnssRateDTO1).isNotEqualTo(cnssRateDTO2);
        cnssRateDTO1.setId(null);
        assertThat(cnssRateDTO1).isNotEqualTo(cnssRateDTO2);
    }
}
