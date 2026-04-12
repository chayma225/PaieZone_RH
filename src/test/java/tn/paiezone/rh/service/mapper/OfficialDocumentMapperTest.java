package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.OfficialDocumentAsserts.*;
import static tn.paiezone.rh.domain.OfficialDocumentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OfficialDocumentMapperTest {

    private OfficialDocumentMapper officialDocumentMapper;

    @BeforeEach
    void setUp() {
        officialDocumentMapper = new OfficialDocumentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getOfficialDocumentSample1();
        var actual = officialDocumentMapper.toEntity(officialDocumentMapper.toDto(expected));
        assertOfficialDocumentAllPropertiesEquals(expected, actual);
    }
}
