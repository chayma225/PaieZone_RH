package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class LeaveRequestDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(LeaveRequestDTO.class);
        LeaveRequestDTO leaveRequestDTO1 = new LeaveRequestDTO();
        leaveRequestDTO1.setId(1L);
        LeaveRequestDTO leaveRequestDTO2 = new LeaveRequestDTO();
        assertThat(leaveRequestDTO1).isNotEqualTo(leaveRequestDTO2);
        leaveRequestDTO2.setId(leaveRequestDTO1.getId());
        assertThat(leaveRequestDTO1).isEqualTo(leaveRequestDTO2);
        leaveRequestDTO2.setId(2L);
        assertThat(leaveRequestDTO1).isNotEqualTo(leaveRequestDTO2);
        leaveRequestDTO1.setId(null);
        assertThat(leaveRequestDTO1).isNotEqualTo(leaveRequestDTO2);
    }
}
