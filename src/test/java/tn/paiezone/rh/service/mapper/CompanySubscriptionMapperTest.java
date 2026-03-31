package tn.paiezone.rh.service.mapper;

import static tn.paiezone.rh.domain.CompanySubscriptionAsserts.*;
import static tn.paiezone.rh.domain.CompanySubscriptionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CompanySubscriptionMapperTest {

    private CompanySubscriptionMapper companySubscriptionMapper;

    @BeforeEach
    void setUp() {
        companySubscriptionMapper = new CompanySubscriptionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCompanySubscriptionSample1();
        var actual = companySubscriptionMapper.toEntity(companySubscriptionMapper.toDto(expected));
        assertCompanySubscriptionAllPropertiesEquals(expected, actual);
    }
}
