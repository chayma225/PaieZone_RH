package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class BonusTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Bonus getBonusSample1() {
        return new Bonus().id(1L).label("label1").month(1).year(1).notes("notes1");
    }

    public static Bonus getBonusSample2() {
        return new Bonus().id(2L).label("label2").month(2).year(2).notes("notes2");
    }

    public static Bonus getBonusRandomSampleGenerator() {
        return new Bonus()
            .id(longCount.incrementAndGet())
            .label(UUID.randomUUID().toString())
            .month(intCount.incrementAndGet())
            .year(intCount.incrementAndGet())
            .notes(UUID.randomUUID().toString());
    }
}
