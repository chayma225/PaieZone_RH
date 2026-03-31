package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.RubriqueAsserts.*;
import static tn.paiezone.rh.domain.RubriqueTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RubriqueMapperTest {

    private RubriqueMapper rubriqueMapper;

    @BeforeEach
    void setUp() {
        rubriqueMapper = new RubriqueMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getRubriqueSample1();
        var actual = rubriqueMapper.toEntity(rubriqueMapper.toDto(expected));
        assertRubriqueAllPropertiesEquals(expected, actual);
    }
}
