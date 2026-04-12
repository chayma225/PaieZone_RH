package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.BonusAsserts.*;
import static tn.paiezone.rh.domain.BonusTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BonusMapperTest {

    private BonusMapper bonusMapper;

    @BeforeEach
    void setUp() {
        bonusMapper = new BonusMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getBonusSample1();
        var actual = bonusMapper.toEntity(bonusMapper.toDto(expected));
        assertBonusAllPropertiesEquals(expected, actual);
    }
}
