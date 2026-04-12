package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.AccountingEntryAsserts.*;
import static tn.paiezone.rh.domain.AccountingEntryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AccountingEntryMapperTest {

    private AccountingEntryMapper accountingEntryMapper;

    @BeforeEach
    void setUp() {
        accountingEntryMapper = new AccountingEntryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAccountingEntrySample1();
        var actual = accountingEntryMapper.toEntity(accountingEntryMapper.toDto(expected));
        assertAccountingEntryAllPropertiesEquals(expected, actual);
    }
}
