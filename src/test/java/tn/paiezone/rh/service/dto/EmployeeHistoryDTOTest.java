package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class EmployeeHistoryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EmployeeHistoryDTO.class);
        EmployeeHistoryDTO employeeHistoryDTO1 = new EmployeeHistoryDTO();
        employeeHistoryDTO1.setId(1L);
        EmployeeHistoryDTO employeeHistoryDTO2 = new EmployeeHistoryDTO();
        assertThat(employeeHistoryDTO1).isNotEqualTo(employeeHistoryDTO2);
        employeeHistoryDTO2.setId(employeeHistoryDTO1.getId());
        assertThat(employeeHistoryDTO1).isEqualTo(employeeHistoryDTO2);
        employeeHistoryDTO2.setId(2L);
        assertThat(employeeHistoryDTO1).isNotEqualTo(employeeHistoryDTO2);
        employeeHistoryDTO1.setId(null);
        assertThat(employeeHistoryDTO1).isNotEqualTo(employeeHistoryDTO2);
    }
}
