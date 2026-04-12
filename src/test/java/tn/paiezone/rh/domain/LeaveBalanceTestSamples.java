package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class LeaveBalanceTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static LeaveBalance getLeaveBalanceSample1() {
        return new LeaveBalance().id(1L).year(1);
    }

    public static LeaveBalance getLeaveBalanceSample2() {
        return new LeaveBalance().id(2L).year(2);
    }

    public static LeaveBalance getLeaveBalanceRandomSampleGenerator() {
        return new LeaveBalance().id(longCount.incrementAndGet()).year(intCount.incrementAndGet());
    }
}
