package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class LeaveRequestTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static LeaveRequest getLeaveRequestSample1() {
        return new LeaveRequest()
            .id(1L)
            .numberOfDays(1)
            .managerComment("managerComment1")
            .employeeComment("employeeComment1")
            .documentUrl("documentUrl1");
    }

    public static LeaveRequest getLeaveRequestSample2() {
        return new LeaveRequest()
            .id(2L)
            .numberOfDays(2)
            .managerComment("managerComment2")
            .employeeComment("employeeComment2")
            .documentUrl("documentUrl2");
    }

    public static LeaveRequest getLeaveRequestRandomSampleGenerator() {
        return new LeaveRequest()
            .id(longCount.incrementAndGet())
            .numberOfDays(intCount.incrementAndGet())
            .managerComment(UUID.randomUUID().toString())
            .employeeComment(UUID.randomUUID().toString())
            .documentUrl(UUID.randomUUID().toString());
    }
}
