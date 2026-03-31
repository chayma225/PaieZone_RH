package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.KnowledgeDocumentTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class KnowledgeDocumentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(KnowledgeDocument.class);
        KnowledgeDocument knowledgeDocument1 = getKnowledgeDocumentSample1();
        KnowledgeDocument knowledgeDocument2 = new KnowledgeDocument();
        assertThat(knowledgeDocument1).isNotEqualTo(knowledgeDocument2);

        knowledgeDocument2.setId(knowledgeDocument1.getId());
        assertThat(knowledgeDocument1).isEqualTo(knowledgeDocument2);

        knowledgeDocument2 = getKnowledgeDocumentSample2();
        assertThat(knowledgeDocument1).isNotEqualTo(knowledgeDocument2);
    }

    @Test
    void companyTest() {
        KnowledgeDocument knowledgeDocument = getKnowledgeDocumentRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        knowledgeDocument.setCompany(companyBack);
        assertThat(knowledgeDocument.getCompany()).isEqualTo(companyBack);

        knowledgeDocument.company(null);
        assertThat(knowledgeDocument.getCompany()).isNull();
    }
}
