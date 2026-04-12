package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.RegulatoryParamAsserts.*;
import static tn.paiezone.rh.domain.RegulatoryParamTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RegulatoryParamMapperTest {

    private RegulatoryParamMapper regulatoryParamMapper;

    @BeforeEach
    void setUp() {
        regulatoryParamMapper = new RegulatoryParamMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRegulatoryParamSample1();
        var actual = regulatoryParamMapper.toEntity(regulatoryParamMapper.toDto(expected));
        assertRegulatoryParamAllPropertiesEquals(expected, actual);
    }
}
