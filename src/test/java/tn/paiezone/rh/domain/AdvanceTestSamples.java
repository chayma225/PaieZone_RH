package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class AdvanceTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Advance getAdvanceSample1() {
        return new Advance().id(1L).deductionMonth(1).deductionYear(1).approvedBy("approvedBy1").notes("notes1");
    }

    public static Advance getAdvanceSample2() {
        return new Advance().id(2L).deductionMonth(2).deductionYear(2).approvedBy("approvedBy2").notes("notes2");
    }

    public static Advance getAdvanceRandomSampleGenerator() {
        return new Advance()
            .id(longCount.incrementAndGet())
            .deductionMonth(intCount.incrementAndGet())
            .deductionYear(intCount.incrementAndGet())
            .approvedBy(UUID.randomUUID().toString())
            .notes(UUID.randomUUID().toString());
    }
}
