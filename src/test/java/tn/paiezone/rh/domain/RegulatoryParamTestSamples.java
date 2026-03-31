package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class RegulatoryParamTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static RegulatoryParam getRegulatoryParamSample1() {
        return new RegulatoryParam()
            .id(1L)
            .paramKey("paramKey1")
            .paramLabel("paramLabel1")
            .textValue("textValue1")
            .legalReference("legalReference1");
    }

    public static RegulatoryParam getRegulatoryParamSample2() {
        return new RegulatoryParam()
            .id(2L)
            .paramKey("paramKey2")
            .paramLabel("paramLabel2")
            .textValue("textValue2")
            .legalReference("legalReference2");
    }

    public static RegulatoryParam getRegulatoryParamRandomSampleGenerator() {
        return new RegulatoryParam()
            .id(longCount.incrementAndGet())
            .paramKey(UUID.randomUUID().toString())
            .paramLabel(UUID.randomUUID().toString())
            .textValue(UUID.randomUUID().toString())
            .legalReference(UUID.randomUUID().toString());
    }
}
