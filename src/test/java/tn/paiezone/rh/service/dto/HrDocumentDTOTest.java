package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class HrDocumentDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(HrDocumentDTO.class);
        HrDocumentDTO hrDocumentDTO1 = new HrDocumentDTO();
        hrDocumentDTO1.setId(1L);
        HrDocumentDTO hrDocumentDTO2 = new HrDocumentDTO();
        assertThat(hrDocumentDTO1).isNotEqualTo(hrDocumentDTO2);
        hrDocumentDTO2.setId(hrDocumentDTO1.getId());
        assertThat(hrDocumentDTO1).isEqualTo(hrDocumentDTO2);
        hrDocumentDTO2.setId(2L);
        assertThat(hrDocumentDTO1).isNotEqualTo(hrDocumentDTO2);
        hrDocumentDTO1.setId(null);
        assertThat(hrDocumentDTO1).isNotEqualTo(hrDocumentDTO2);
    }
}
