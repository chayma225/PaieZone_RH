package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.AdvanceAsserts.*;
import static tn.paiezone.rh.domain.AdvanceTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AdvanceMapperTest {

    private AdvanceMapper advanceMapper;

    @BeforeEach
    void setUp() {
        advanceMapper = new AdvanceMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAdvanceSample1();
        var actual = advanceMapper.toEntity(advanceMapper.toDto(expected));
        assertAdvanceAllPropertiesEquals(expected, actual);
    }
}
