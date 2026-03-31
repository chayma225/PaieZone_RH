package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class OfficialDocumentTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static OfficialDocument getOfficialDocumentSample1() {
        return new OfficialDocument().id(1L).title("title1").month(1).year(1).fileUrl("fileUrl1").signedBy("signedBy1").notes("notes1");
    }

    public static OfficialDocument getOfficialDocumentSample2() {
        return new OfficialDocument().id(2L).title("title2").month(2).year(2).fileUrl("fileUrl2").signedBy("signedBy2").notes("notes2");
    }

    public static OfficialDocument getOfficialDocumentRandomSampleGenerator() {
        return new OfficialDocument()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .month(intCount.incrementAndGet())
            .year(intCount.incrementAndGet())
            .fileUrl(UUID.randomUUID().toString())
            .signedBy(UUID.randomUUID().toString())
            .notes(UUID.randomUUID().toString());
    }
}
