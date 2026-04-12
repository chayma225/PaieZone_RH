package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PaySlipDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PaySlipDTO.class);
        PaySlipDTO paySlipDTO1 = new PaySlipDTO();
        paySlipDTO1.setId(1L);
        PaySlipDTO paySlipDTO2 = new PaySlipDTO();
        assertThat(paySlipDTO1).isNotEqualTo(paySlipDTO2);
        paySlipDTO2.setId(paySlipDTO1.getId());
        assertThat(paySlipDTO1).isEqualTo(paySlipDTO2);
        paySlipDTO2.setId(2L);
        assertThat(paySlipDTO1).isNotEqualTo(paySlipDTO2);
        paySlipDTO1.setId(null);
        assertThat(paySlipDTO1).isNotEqualTo(paySlipDTO2);
    }
}
