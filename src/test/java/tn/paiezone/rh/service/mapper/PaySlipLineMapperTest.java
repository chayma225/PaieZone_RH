package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.PaySlipLineAsserts.*;
import static tn.paiezone.rh.domain.PaySlipLineTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PaySlipLineMapperTest {

    private PaySlipLineMapper paySlipLineMapper;

    @BeforeEach
    void setUp() {
        paySlipLineMapper = new PaySlipLineMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPaySlipLineSample1();
        var actual = paySlipLineMapper.toEntity(paySlipLineMapper.toDto(expected));
        assertPaySlipLineAllPropertiesEquals(expected, actual);
    }
}
