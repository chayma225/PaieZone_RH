package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class RubriqueTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Rubrique getRubriqueSample1() {
        return new Rubrique().id(1L).code("code1").label("label1").labelAr("labelAr1").formula("formula1").sortOrder(1);
    }

    public static Rubrique getRubriqueSample2() {
        return new Rubrique().id(2L).code("code2").label("label2").labelAr("labelAr2").formula("formula2").sortOrder(2);
    }

    public static Rubrique getRubriqueRandomSampleGenerator() {
        return new Rubrique()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .label(UUID.randomUUID().toString())
            .labelAr(UUID.randomUUID().toString())
            .formula(UUID.randomUUID().toString())
            .sortOrder(intCount.incrementAndGet());
    }
}
