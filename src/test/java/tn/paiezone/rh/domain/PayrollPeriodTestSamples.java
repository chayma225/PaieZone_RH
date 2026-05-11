package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class PayrollPeriodTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static PayrollPeriod getPayrollPeriodSample1() {
        return new PayrollPeriod()
            .id(1L)
            .month(1)
            .year(2026);
    }

    public static PayrollPeriod getPayrollPeriodSample2() {
        return new PayrollPeriod()
            .id(2L)
            .month(2)
            .year(2026);
    }

    public static PayrollPeriod getPayrollPeriodRandomSampleGenerator() {
        return new PayrollPeriod()
            .id(longCount.incrementAndGet())
            .month((random.nextInt(12) + 1))
            .year(2024 + random.nextInt(5));
    }
}
