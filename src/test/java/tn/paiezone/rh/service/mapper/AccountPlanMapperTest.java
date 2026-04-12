package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.AccountPlanAsserts.*;
import static tn.paiezone.rh.domain.AccountPlanTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AccountPlanMapperTest {

    private AccountPlanMapper accountPlanMapper;

    @BeforeEach
    void setUp() {
        accountPlanMapper = new AccountPlanMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAccountPlanSample1();
        var actual = accountPlanMapper.toEntity(accountPlanMapper.toDto(expected));
        assertAccountPlanAllPropertiesEquals(expected, actual);
    }
}
