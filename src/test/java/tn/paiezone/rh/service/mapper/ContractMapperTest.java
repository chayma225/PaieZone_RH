package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.ContractAsserts.*;
import static tn.paiezone.rh.domain.ContractTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ContractMapperTest {

    private ContractMapper contractMapper;

    @BeforeEach
    void setUp() {
        contractMapper = new ContractMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getContractSample1();
        var actual = contractMapper.toEntity(contractMapper.toDto(expected));
        assertContractAllPropertiesEquals(expected, actual);
    }
}
