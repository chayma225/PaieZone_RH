package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class HrDocumentTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static HrDocument getHrDocumentSample1() {
        return new HrDocument().id(1L).title("title1").description("description1").fileUrl("fileUrl1").fileSize(1L).mimeType("mimeType1");
    }

    public static HrDocument getHrDocumentSample2() {
        return new HrDocument().id(2L).title("title2").description("description2").fileUrl("fileUrl2").fileSize(2L).mimeType("mimeType2");
    }

    public static HrDocument getHrDocumentRandomSampleGenerator() {
        return new HrDocument()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .fileUrl(UUID.randomUUID().toString())
            .fileSize(longCount.incrementAndGet())
            .mimeType(UUID.randomUUID().toString());
    }
}
