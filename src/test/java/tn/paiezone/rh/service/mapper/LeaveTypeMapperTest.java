package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.LeaveTypeAsserts.*;
import static tn.paiezone.rh.domain.LeaveTypeTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LeaveTypeMapperTest {

    private LeaveTypeMapper leaveTypeMapper;

    @BeforeEach
    void setUp() {
        leaveTypeMapper = new LeaveTypeMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getLeaveTypeSample1();
        var actual = leaveTypeMapper.toEntity(leaveTypeMapper.toDto(expected));
        assertLeaveTypeAllPropertiesEquals(expected, actual);
    }
}
