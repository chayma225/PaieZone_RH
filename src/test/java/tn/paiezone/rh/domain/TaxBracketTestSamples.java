package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class TaxBracketTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static TaxBracket getTaxBracketSample1() {
        return new TaxBracket().id(1L).year(1).sortOrder(1);
    }

    public static TaxBracket getTaxBracketSample2() {
        return new TaxBracket().id(2L).year(2).sortOrder(2);
    }

    public static TaxBracket getTaxBracketRandomSampleGenerator() {
        return new TaxBracket().id(longCount.incrementAndGet()).year(intCount.incrementAndGet()).sortOrder(intCount.incrementAndGet());
    }
}
