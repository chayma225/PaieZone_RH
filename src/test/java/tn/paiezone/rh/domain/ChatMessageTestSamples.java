package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ChatMessageTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static ChatMessage getChatMessageSample1() {
        return new ChatMessage().id(1L).actionTaken("actionTaken1").tokenUsed(1);
    }

    public static ChatMessage getChatMessageSample2() {
        return new ChatMessage().id(2L).actionTaken("actionTaken2").tokenUsed(2);
    }

    public static ChatMessage getChatMessageRandomSampleGenerator() {
        return new ChatMessage()
            .id(longCount.incrementAndGet())
            .actionTaken(UUID.randomUUID().toString())
            .tokenUsed(intCount.incrementAndGet());
    }
}
