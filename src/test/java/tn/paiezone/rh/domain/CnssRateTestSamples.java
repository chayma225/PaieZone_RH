package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class CnssRateTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static CnssRate getCnssRateSample1() {
        return new CnssRate().id(1L).year(1);
    }

    public static CnssRate getCnssRateSample2() {
        return new CnssRate().id(2L).year(2);
    }

    public static CnssRate getCnssRateRandomSampleGenerator() {
        return new CnssRate().id(longCount.incrementAndGet()).year(intCount.incrementAndGet());
    }
}
