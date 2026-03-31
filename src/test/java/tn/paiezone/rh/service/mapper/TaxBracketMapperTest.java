package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.TaxBracketAsserts.*;
import static tn.paiezone.rh.domain.TaxBracketTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TaxBracketMapperTest {

    private TaxBracketMapper taxBracketMapper;

    @BeforeEach
    void setUp() {
        taxBracketMapper = new TaxBracketMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getTaxBracketSample1();
        var actual = taxBracketMapper.toEntity(taxBracketMapper.toDto(expected));
        assertTaxBracketAllPropertiesEquals(expected, actual);
    }
}
