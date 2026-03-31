package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AdvanceDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AdvanceDTO.class);
        AdvanceDTO advanceDTO1 = new AdvanceDTO();
        advanceDTO1.setId(1L);
        AdvanceDTO advanceDTO2 = new AdvanceDTO();
        assertThat(advanceDTO1).isNotEqualTo(advanceDTO2);
        advanceDTO2.setId(advanceDTO1.getId());
        assertThat(advanceDTO1).isEqualTo(advanceDTO2);
        advanceDTO2.setId(2L);
        assertThat(advanceDTO1).isNotEqualTo(advanceDTO2);
        advanceDTO1.setId(null);
        assertThat(advanceDTO1).isNotEqualTo(advanceDTO2);
    }
}
