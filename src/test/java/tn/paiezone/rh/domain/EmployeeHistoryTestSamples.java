package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class EmployeeHistoryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static EmployeeHistory getEmployeeHistorySample1() {
        return new EmployeeHistory()
            .id(1L)
            .fieldName("fieldName1")
            .oldValue("oldValue1")
            .newValue("newValue1")
            .changedBy("changedBy1")
            .reason("reason1");
    }

    public static EmployeeHistory getEmployeeHistorySample2() {
        return new EmployeeHistory()
            .id(2L)
            .fieldName("fieldName2")
            .oldValue("oldValue2")
            .newValue("newValue2")
            .changedBy("changedBy2")
            .reason("reason2");
    }

    public static EmployeeHistory getEmployeeHistoryRandomSampleGenerator() {
        return new EmployeeHistory()
            .id(longCount.incrementAndGet())
            .fieldName(UUID.randomUUID().toString())
            .oldValue(UUID.randomUUID().toString())
            .newValue(UUID.randomUUID().toString())
            .changedBy(UUID.randomUUID().toString())
            .reason(UUID.randomUUID().toString());
    }
}
