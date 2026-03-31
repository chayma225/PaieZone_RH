package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class CompanySubscriptionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static CompanySubscription getCompanySubscriptionSample1() {
        return new CompanySubscription().id(1L).maxEmployees(1).billingDay(1).notes("notes1");
    }

    public static CompanySubscription getCompanySubscriptionSample2() {
        return new CompanySubscription().id(2L).maxEmployees(2).billingDay(2).notes("notes2");
    }

    public static CompanySubscription getCompanySubscriptionRandomSampleGenerator() {
        return new CompanySubscription()
            .id(longCount.incrementAndGet())
            .maxEmployees(intCount.incrementAndGet())
            .billingDay(intCount.incrementAndGet())
            .notes(UUID.randomUUID().toString());
    }
}
