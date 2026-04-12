package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class AccountPlanTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static AccountPlan getAccountPlanSample1() {
        return new AccountPlan()
            .id(1L)
            .accountCode("accountCode1")
            .accountLabel("accountLabel1")
            .accountLabelAr("accountLabelAr1")
            .accountType("accountType1");
    }

    public static AccountPlan getAccountPlanSample2() {
        return new AccountPlan()
            .id(2L)
            .accountCode("accountCode2")
            .accountLabel("accountLabel2")
            .accountLabelAr("accountLabelAr2")
            .accountType("accountType2");
    }

    public static AccountPlan getAccountPlanRandomSampleGenerator() {
        return new AccountPlan()
            .id(longCount.incrementAndGet())
            .accountCode(UUID.randomUUID().toString())
            .accountLabel(UUID.randomUUID().toString())
            .accountLabelAr(UUID.randomUUID().toString())
            .accountType(UUID.randomUUID().toString());
    }
}
