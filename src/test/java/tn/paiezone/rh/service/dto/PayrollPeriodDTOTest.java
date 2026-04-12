package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PayrollPeriodDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PayrollPeriodDTO.class);
        PayrollPeriodDTO payrollPeriodDTO1 = new PayrollPeriodDTO();
        payrollPeriodDTO1.setId(1L);
        PayrollPeriodDTO payrollPeriodDTO2 = new PayrollPeriodDTO();
        assertThat(payrollPeriodDTO1).isNotEqualTo(payrollPeriodDTO2);
        payrollPeriodDTO2.setId(payrollPeriodDTO1.getId());
        assertThat(payrollPeriodDTO1).isEqualTo(payrollPeriodDTO2);
        payrollPeriodDTO2.setId(2L);
        assertThat(payrollPeriodDTO1).isNotEqualTo(payrollPeriodDTO2);
        payrollPeriodDTO1.setId(null);
        assertThat(payrollPeriodDTO1).isNotEqualTo(payrollPeriodDTO2);
    }
}
