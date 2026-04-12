package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.EmployeeHistoryAsserts.*;
import static tn.paiezone.rh.domain.EmployeeHistoryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EmployeeHistoryMapperTest {

    private EmployeeHistoryMapper employeeHistoryMapper;

    @BeforeEach
    void setUp() {
        employeeHistoryMapper = new EmployeeHistoryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getEmployeeHistorySample1();
        var actual = employeeHistoryMapper.toEntity(employeeHistoryMapper.toDto(expected));
        assertEmployeeHistoryAllPropertiesEquals(expected, actual);
    }
}
