package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.HrDocumentAsserts.*;
import static tn.paiezone.rh.domain.HrDocumentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HrDocumentMapperTest {

    private HrDocumentMapper hrDocumentMapper;

    @BeforeEach
    void setUp() {
        hrDocumentMapper = new HrDocumentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getHrDocumentSample1();
        var actual = hrDocumentMapper.toEntity(hrDocumentMapper.toDto(expected));
        assertHrDocumentAllPropertiesEquals(expected, actual);
    }
}
