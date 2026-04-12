package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class KnowledgeDocumentDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(KnowledgeDocumentDTO.class);
        KnowledgeDocumentDTO knowledgeDocumentDTO1 = new KnowledgeDocumentDTO();
        knowledgeDocumentDTO1.setId(1L);
        KnowledgeDocumentDTO knowledgeDocumentDTO2 = new KnowledgeDocumentDTO();
        assertThat(knowledgeDocumentDTO1).isNotEqualTo(knowledgeDocumentDTO2);
        knowledgeDocumentDTO2.setId(knowledgeDocumentDTO1.getId());
        assertThat(knowledgeDocumentDTO1).isEqualTo(knowledgeDocumentDTO2);
        knowledgeDocumentDTO2.setId(2L);
        assertThat(knowledgeDocumentDTO1).isNotEqualTo(knowledgeDocumentDTO2);
        knowledgeDocumentDTO1.setId(null);
        assertThat(knowledgeDocumentDTO1).isNotEqualTo(knowledgeDocumentDTO2);
    }
}
