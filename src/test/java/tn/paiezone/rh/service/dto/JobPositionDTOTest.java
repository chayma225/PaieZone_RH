package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class JobPositionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(JobPositionDTO.class);
        JobPositionDTO jobPositionDTO1 = new JobPositionDTO();
        jobPositionDTO1.setId(1L);
        JobPositionDTO jobPositionDTO2 = new JobPositionDTO();
        assertThat(jobPositionDTO1).isNotEqualTo(jobPositionDTO2);
        jobPositionDTO2.setId(jobPositionDTO1.getId());
        assertThat(jobPositionDTO1).isEqualTo(jobPositionDTO2);
        jobPositionDTO2.setId(2L);
        assertThat(jobPositionDTO1).isNotEqualTo(jobPositionDTO2);
        jobPositionDTO1.setId(null);
        assertThat(jobPositionDTO1).isNotEqualTo(jobPositionDTO2);
    }
}
