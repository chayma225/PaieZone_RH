package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.PublicHolidayAsserts.*;
import static tn.paiezone.rh.domain.PublicHolidayTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PublicHolidayMapperTest {

    private PublicHolidayMapper publicHolidayMapper;

    @BeforeEach
    void setUp() {
        publicHolidayMapper = new PublicHolidayMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getPublicHolidaySample1();
        var actual = publicHolidayMapper.toEntity(publicHolidayMapper.toDto(expected));
        assertPublicHolidayAllPropertiesEquals(expected, actual);
    }
}
