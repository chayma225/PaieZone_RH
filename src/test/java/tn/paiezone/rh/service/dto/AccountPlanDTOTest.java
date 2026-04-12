package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AccountPlanDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AccountPlanDTO.class);
        AccountPlanDTO accountPlanDTO1 = new AccountPlanDTO();
        accountPlanDTO1.setId(1L);
        AccountPlanDTO accountPlanDTO2 = new AccountPlanDTO();
        assertThat(accountPlanDTO1).isNotEqualTo(accountPlanDTO2);
        accountPlanDTO2.setId(accountPlanDTO1.getId());
        assertThat(accountPlanDTO1).isEqualTo(accountPlanDTO2);
        accountPlanDTO2.setId(2L);
        assertThat(accountPlanDTO1).isNotEqualTo(accountPlanDTO2);
        accountPlanDTO1.setId(null);
        assertThat(accountPlanDTO1).isNotEqualTo(accountPlanDTO2);
    }
}
