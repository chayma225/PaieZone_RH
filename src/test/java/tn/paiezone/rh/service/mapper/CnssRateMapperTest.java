package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.CnssRateAsserts.*;
import static tn.paiezone.rh.domain.CnssRateTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CnssRateMapperTest {

    private CnssRateMapper cnssRateMapper;

    @BeforeEach
    void setUp() {
        cnssRateMapper = new CnssRateMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCnssRateSample1();
        var actual = cnssRateMapper.toEntity(cnssRateMapper.toDto(expected));
        assertCnssRateAllPropertiesEquals(expected, actual);
    }
}
