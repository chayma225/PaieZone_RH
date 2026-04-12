package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class AuditLogTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static AuditLog getAuditLogSample1() {
        return new AuditLog()
            .id(1L)
            .action("action1")
            .entityType("entityType1")
            .entityId(1L)
            .ipAddress("ipAddress1")
            .userAgent("userAgent1");
    }

    public static AuditLog getAuditLogSample2() {
        return new AuditLog()
            .id(2L)
            .action("action2")
            .entityType("entityType2")
            .entityId(2L)
            .ipAddress("ipAddress2")
            .userAgent("userAgent2");
    }

    public static AuditLog getAuditLogRandomSampleGenerator() {
        return new AuditLog()
            .id(longCount.incrementAndGet())
            .action(UUID.randomUUID().toString())
            .entityType(UUID.randomUUID().toString())
            .entityId(longCount.incrementAndGet())
            .ipAddress(UUID.randomUUID().toString())
            .userAgent(UUID.randomUUID().toString());
    }
}
