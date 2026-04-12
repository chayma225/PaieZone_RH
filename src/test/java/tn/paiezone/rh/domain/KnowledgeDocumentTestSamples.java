package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class KnowledgeDocumentTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static KnowledgeDocument getKnowledgeDocumentSample1() {
        return new KnowledgeDocument().id(1L).title("title1").category("category1").fileUrl("fileUrl1");
    }

    public static KnowledgeDocument getKnowledgeDocumentSample2() {
        return new KnowledgeDocument().id(2L).title("title2").category("category2").fileUrl("fileUrl2");
    }

    public static KnowledgeDocument getKnowledgeDocumentRandomSampleGenerator() {
        return new KnowledgeDocument()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .category(UUID.randomUUID().toString())
            .fileUrl(UUID.randomUUID().toString());
    }
}
