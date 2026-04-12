package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class PaySlipLineTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static PaySlipLine getPaySlipLineSample1() {
        return new PaySlipLine().id(1L).sortOrder(1).rubriqueCode("rubriqueCode1").rubriqueLabel("rubriqueLabel1");
    }

    public static PaySlipLine getPaySlipLineSample2() {
        return new PaySlipLine().id(2L).sortOrder(2).rubriqueCode("rubriqueCode2").rubriqueLabel("rubriqueLabel2");
    }

    public static PaySlipLine getPaySlipLineRandomSampleGenerator() {
        return new PaySlipLine()
            .id(longCount.incrementAndGet())
            .sortOrder(intCount.incrementAndGet())
            .rubriqueCode(UUID.randomUUID().toString())
            .rubriqueLabel(UUID.randomUUID().toString());
    }
}
