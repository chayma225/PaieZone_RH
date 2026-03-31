package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class RubriqueDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RubriqueDTO.class);
        RubriqueDTO rubriqueDTO1 = new RubriqueDTO();
        rubriqueDTO1.setId(1L);
        RubriqueDTO rubriqueDTO2 = new RubriqueDTO();
        assertThat(rubriqueDTO1).isNotEqualTo(rubriqueDTO2);
        rubriqueDTO2.setId(rubriqueDTO1.getId());
        assertThat(rubriqueDTO1).isEqualTo(rubriqueDTO2);
        rubriqueDTO2.setId(2L);
        assertThat(rubriqueDTO1).isNotEqualTo(rubriqueDTO2);
        rubriqueDTO1.setId(null);
        assertThat(rubriqueDTO1).isNotEqualTo(rubriqueDTO2);
    }
}
