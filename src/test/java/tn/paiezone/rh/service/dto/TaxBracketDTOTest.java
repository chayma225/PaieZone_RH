package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class TaxBracketDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(TaxBracketDTO.class);
        TaxBracketDTO taxBracketDTO1 = new TaxBracketDTO();
        taxBracketDTO1.setId(1L);
        TaxBracketDTO taxBracketDTO2 = new TaxBracketDTO();
        assertThat(taxBracketDTO1).isNotEqualTo(taxBracketDTO2);
        taxBracketDTO2.setId(taxBracketDTO1.getId());
        assertThat(taxBracketDTO1).isEqualTo(taxBracketDTO2);
        taxBracketDTO2.setId(2L);
        assertThat(taxBracketDTO1).isNotEqualTo(taxBracketDTO2);
        taxBracketDTO1.setId(null);
        assertThat(taxBracketDTO1).isNotEqualTo(taxBracketDTO2);
    }
}
