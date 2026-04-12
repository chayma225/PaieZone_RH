package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.JobPositionAsserts.*;
import static tn.paiezone.rh.domain.JobPositionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class JobPositionMapperTest {

    private JobPositionMapper jobPositionMapper;

    @BeforeEach
    void setUp() {
        jobPositionMapper = new JobPositionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getJobPositionSample1();
        var actual = jobPositionMapper.toEntity(jobPositionMapper.toDto(expected));
        assertJobPositionAllPropertiesEquals(expected, actual);
    }
}
