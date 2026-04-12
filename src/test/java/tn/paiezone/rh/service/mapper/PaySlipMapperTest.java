package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.PaySlipAsserts.*;
import static tn.paiezone.rh.domain.PaySlipTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PaySlipMapperTest {

    private PaySlipMapper paySlipMapper;

    @BeforeEach
    void setUp() {
        paySlipMapper = new PaySlipMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPaySlipSample1();
        var actual = paySlipMapper.toEntity(paySlipMapper.toDto(expected));
        assertPaySlipAllPropertiesEquals(expected, actual);
    }
}
