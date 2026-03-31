package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class BonusDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(BonusDTO.class);
        BonusDTO bonusDTO1 = new BonusDTO();
        bonusDTO1.setId(1L);
        BonusDTO bonusDTO2 = new BonusDTO();
        assertThat(bonusDTO1).isNotEqualTo(bonusDTO2);
        bonusDTO2.setId(bonusDTO1.getId());
        assertThat(bonusDTO1).isEqualTo(bonusDTO2);
        bonusDTO2.setId(2L);
        assertThat(bonusDTO1).isNotEqualTo(bonusDTO2);
        bonusDTO1.setId(null);
        assertThat(bonusDTO1).isNotEqualTo(bonusDTO2);
    }
}
