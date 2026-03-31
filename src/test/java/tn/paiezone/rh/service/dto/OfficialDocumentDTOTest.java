package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class OfficialDocumentDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(OfficialDocumentDTO.class);
        OfficialDocumentDTO officialDocumentDTO1 = new OfficialDocumentDTO();
        officialDocumentDTO1.setId(1L);
        OfficialDocumentDTO officialDocumentDTO2 = new OfficialDocumentDTO();
        assertThat(officialDocumentDTO1).isNotEqualTo(officialDocumentDTO2);
        officialDocumentDTO2.setId(officialDocumentDTO1.getId());
        assertThat(officialDocumentDTO1).isEqualTo(officialDocumentDTO2);
        officialDocumentDTO2.setId(2L);
        assertThat(officialDocumentDTO1).isNotEqualTo(officialDocumentDTO2);
        officialDocumentDTO1.setId(null);
        assertThat(officialDocumentDTO1).isNotEqualTo(officialDocumentDTO2);
    }
}
