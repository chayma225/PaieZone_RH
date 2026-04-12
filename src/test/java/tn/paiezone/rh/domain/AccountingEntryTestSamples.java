package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class AccountingEntryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static AccountingEntry getAccountingEntrySample1() {
        return new AccountingEntry()
            .id(1L)
            .journalRef("journalRef1")
            .description("description1")
            .debitAccount("debitAccount1")
            .creditAccount("creditAccount1")
            .exportFormat("exportFormat1")
            .exportRef("exportRef1");
    }

    public static AccountingEntry getAccountingEntrySample2() {
        return new AccountingEntry()
            .id(2L)
            .journalRef("journalRef2")
            .description("description2")
            .debitAccount("debitAccount2")
            .creditAccount("creditAccount2")
            .exportFormat("exportFormat2")
            .exportRef("exportRef2");
    }

    public static AccountingEntry getAccountingEntryRandomSampleGenerator() {
        return new AccountingEntry()
            .id(longCount.incrementAndGet())
            .journalRef(UUID.randomUUID().toString())
            .description(UUID.randomUUID().toString())
            .debitAccount(UUID.randomUUID().toString())
            .creditAccount(UUID.randomUUID().toString())
            .exportFormat(UUID.randomUUID().toString())
            .exportRef(UUID.randomUUID().toString());
    }
}
