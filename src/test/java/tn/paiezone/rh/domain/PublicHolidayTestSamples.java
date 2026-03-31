package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class PublicHolidayTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static PublicHoliday getPublicHolidaySample1() {
        return new PublicHoliday().id(1L).name("name1").nameAr("nameAr1").year(1);
    }

    public static PublicHoliday getPublicHolidaySample2() {
        return new PublicHoliday().id(2L).name("name2").nameAr("nameAr2").year(2);
    }

    public static PublicHoliday getPublicHolidayRandomSampleGenerator() {
        return new PublicHoliday()
            .id(longCount.incrementAndGet())
            .name(UUID.randomUUID().toString())
            .nameAr(UUID.randomUUID().toString())
            .year(intCount.incrementAndGet());
    }
}
