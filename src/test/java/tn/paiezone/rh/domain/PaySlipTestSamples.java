package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class PaySlipTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static PaySlip getPaySlipSample1() {
        return new PaySlip()
            .id(1L)
            .month(1)
            .year(1)
            .workedDays(1)
            .paidLeaveDays(1)
            .unpaidDays(1)
            .pdfUrl("pdfUrl1")
            .bankTransferRef("bankTransferRef1");
    }

    public static PaySlip getPaySlipSample2() {
        return new PaySlip()
            .id(2L)
            .month(2)
            .year(2)
            .workedDays(2)
            .paidLeaveDays(2)
            .unpaidDays(2)
            .pdfUrl("pdfUrl2")
            .bankTransferRef("bankTransferRef2");
    }

    public static PaySlip getPaySlipRandomSampleGenerator() {
        return new PaySlip()
            .id(longCount.incrementAndGet())
            .month(intCount.incrementAndGet())
            .year(intCount.incrementAndGet())
            .workedDays(intCount.incrementAndGet())
            .paidLeaveDays(intCount.incrementAndGet())
            .unpaidDays(intCount.incrementAndGet())
            .pdfUrl(UUID.randomUUID().toString())
            .bankTransferRef(UUID.randomUUID().toString());
    }
}
