package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PaySlipLineDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PaySlipLineDTO.class);
        PaySlipLineDTO paySlipLineDTO1 = new PaySlipLineDTO();
        paySlipLineDTO1.setId(1L);
        PaySlipLineDTO paySlipLineDTO2 = new PaySlipLineDTO();
        assertThat(paySlipLineDTO1).isNotEqualTo(paySlipLineDTO2);
        paySlipLineDTO2.setId(paySlipLineDTO1.getId());
        assertThat(paySlipLineDTO1).isEqualTo(paySlipLineDTO2);
        paySlipLineDTO2.setId(2L);
        assertThat(paySlipLineDTO1).isNotEqualTo(paySlipLineDTO2);
        paySlipLineDTO1.setId(null);
        assertThat(paySlipLineDTO1).isNotEqualTo(paySlipLineDTO2);
    }
}
