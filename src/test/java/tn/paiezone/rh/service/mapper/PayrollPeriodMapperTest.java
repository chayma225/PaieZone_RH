package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.PayrollPeriodAsserts.*;
import static tn.paiezone.rh.domain.PayrollPeriodTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PayrollPeriodMapperTest {

    private PayrollPeriodMapper payrollPeriodMapper;

    @BeforeEach
    void setUp() {
        payrollPeriodMapper = new PayrollPeriodMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPayrollPeriodSample1();
        var actual = payrollPeriodMapper.toEntity(payrollPeriodMapper.toDto(expected));
        assertPayrollPeriodAllPropertiesEquals(expected, actual);
    }
}
