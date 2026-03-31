package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.LeaveBalanceAsserts.*;
import static tn.paiezone.rh.domain.LeaveBalanceTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class LeaveBalanceMapperTest {

    private LeaveBalanceMapper leaveBalanceMapper;

    @BeforeEach
    void setUp() {
        leaveBalanceMapper = new LeaveBalanceMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getLeaveBalanceSample1();
        var actual = leaveBalanceMapper.toEntity(leaveBalanceMapper.toDto(expected));
        assertLeaveBalanceAllPropertiesEquals(expected, actual);
    }
}
