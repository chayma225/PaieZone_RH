package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class JobPositionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static JobPosition getJobPositionSample1() {
        return new JobPosition().id(1L).code("code1").title("title1").description("description1");
    }

    public static JobPosition getJobPositionSample2() {
        return new JobPosition().id(2L).code("code2").title("title2").description("description2");
    }

    public static JobPosition getJobPositionRandomSampleGenerator() {
        return new JobPosition()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .title(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString());
    }
}
