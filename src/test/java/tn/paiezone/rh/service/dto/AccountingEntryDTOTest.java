package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AccountingEntryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AccountingEntryDTO.class);
        AccountingEntryDTO accountingEntryDTO1 = new AccountingEntryDTO();
        accountingEntryDTO1.setId(1L);
        AccountingEntryDTO accountingEntryDTO2 = new AccountingEntryDTO();
        assertThat(accountingEntryDTO1).isNotEqualTo(accountingEntryDTO2);
        accountingEntryDTO2.setId(accountingEntryDTO1.getId());
        assertThat(accountingEntryDTO1).isEqualTo(accountingEntryDTO2);
        accountingEntryDTO2.setId(2L);
        assertThat(accountingEntryDTO1).isNotEqualTo(accountingEntryDTO2);
        accountingEntryDTO1.setId(null);
        assertThat(accountingEntryDTO1).isNotEqualTo(accountingEntryDTO2);
    }
}
