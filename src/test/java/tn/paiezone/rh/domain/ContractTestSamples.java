package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ContractTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Contract getContractSample1() {
        return new Contract()
            .id(1L)
            .reference("reference1")
            .workingHoursWeek(1)
            .workingDaysWeek(1)
            .conventionCollective("conventionCollective1")
            .trialPeriodMonths(1)
            .renewalCount(1)
            .documentUrl("documentUrl1");
    }

    public static Contract getContractSample2() {
        return new Contract()
            .id(2L)
            .reference("reference2")
            .workingHoursWeek(2)
            .workingDaysWeek(2)
            .conventionCollective("conventionCollective2")
            .trialPeriodMonths(2)
            .renewalCount(2)
            .documentUrl("documentUrl2");
    }

    public static Contract getContractRandomSampleGenerator() {
        return new Contract()
            .id(longCount.incrementAndGet())
            .reference(UUID.randomUUID().toString())
            .workingHoursWeek(intCount.incrementAndGet())
            .workingDaysWeek(intCount.incrementAndGet())
            .conventionCollective(UUID.randomUUID().toString())
            .trialPeriodMonths(intCount.incrementAndGet())
            .renewalCount(intCount.incrementAndGet())
            .documentUrl(UUID.randomUUID().toString());
    }
}
