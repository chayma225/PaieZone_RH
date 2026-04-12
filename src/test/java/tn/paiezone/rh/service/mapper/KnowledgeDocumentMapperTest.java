package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.KnowledgeDocumentAsserts.*;
import static tn.paiezone.rh.domain.KnowledgeDocumentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class KnowledgeDocumentMapperTest {

    private KnowledgeDocumentMapper knowledgeDocumentMapper;

    @BeforeEach
    void setUp() {
        knowledgeDocumentMapper = new KnowledgeDocumentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getKnowledgeDocumentSample1();
        var actual = knowledgeDocumentMapper.toEntity(knowledgeDocumentMapper.toDto(expected));
        assertKnowledgeDocumentAllPropertiesEquals(expected, actual);
    }
}
