package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CompanyTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static Company getCompanySample1() {
        return new Company()
            .id(1L)
            .name("name1")
            .tradeName("tradeName1")
            .taxId("taxId1")
            .cnssId("cnssId1")
            .address("address1")
            .city("city1")
            .postalCode("postalCode1")
            .phone("phone1")
            .email("email1")
            .logoUrl("logoUrl1")
            .tenantSchema("tenantSchema1");
    }

    public static Company getCompanySample2() {
        return new Company()
            .id(2L)
            .name("name2")
            .tradeName("tradeName2")
            .taxId("taxId2")
            .cnssId("cnssId2")
            .address("address2")
            .city("city2")
            .postalCode("postalCode2")
            .phone("phone2")
            .email("email2")
            .logoUrl("logoUrl2")
            .tenantSchema("tenantSchema2");
    }

    public static Company getCompanyRandomSampleGenerator() {
        return new Company()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .tradeName(UUID.randomUUID().toString())
            .taxId(UUID.randomUUID().toString())
            .cnssId(UUID.randomUUID().toString())
            .address(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString())
            .postalCode(UUID.randomUUID().toString())
            .phone(UUID.randomUUID().toString())
            .email(UUID.randomUUID().toString())
            .logoUrl(UUID.randomUUID().toString())
            .tenantSchema(UUID.randomUUID().toString());
    }
}
