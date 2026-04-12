package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TimeEntryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static TimeEntry getTimeEntrySample1() {
        return new TimeEntry().id(1L).lateMinutes(1).anomalyNote("anomalyNote1").validatedBy("validatedBy1");
    }

    public static TimeEntry getTimeEntrySample2() {
        return new TimeEntry().id(2L).lateMinutes(2).anomalyNote("anomalyNote2").validatedBy("validatedBy2");
    }

    public static TimeEntry getTimeEntryRandomSampleGenerator() {
        return new TimeEntry()
            .id(longCount.incrementAndGet())
            .lateMinutes(intCount.incrementAndGet())
            .anomalyNote(UUID.randomUUID().toString())
            .validatedBy(UUID.randomUUID().toString());
    }
}
