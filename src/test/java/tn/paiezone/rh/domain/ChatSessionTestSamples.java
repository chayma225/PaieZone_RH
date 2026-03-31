package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ChatSessionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static ChatSession getChatSessionSample1() {
        return new ChatSession().id(1L).escalatedTo("escalatedTo1").satisfactionScore(1);
    }

    public static ChatSession getChatSessionSample2() {
        return new ChatSession().id(2L).escalatedTo("escalatedTo2").satisfactionScore(2);
    }

    public static ChatSession getChatSessionRandomSampleGenerator() {
        return new ChatSession()
            .id(longCount.incrementAndGet())
            .escalatedTo(UUID.randomUUID().toString())
            .satisfactionScore(intCount.incrementAndGet());
    }
}
