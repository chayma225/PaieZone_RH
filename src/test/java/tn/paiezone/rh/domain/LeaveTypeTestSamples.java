package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class LeaveTypeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static LeaveType getLeaveTypeSample1() {
        return new LeaveType().id(1L).label("label1").maxDaysPerYear(1).carryOverDays(1);
    }

    public static LeaveType getLeaveTypeSample2() {
        return new LeaveType().id(2L).label("label2").maxDaysPerYear(2).carryOverDays(2);
    }

    public static LeaveType getLeaveTypeRandomSampleGenerator() {
        return new LeaveType()
            .id(longCount.incrementAndGet())
            .label(UUID.randomUUID().toString())
            .maxDaysPerYear(intCount.incrementAndGet())
            .carryOverDays(intCount.incrementAndGet());
    }
}
