package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UserProfileTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    public static UserProfile getUserProfileSample1() {
        return new UserProfile()
            .id(1L)
            .jhiUserId("jhiUserId1")
            .phoneNumber("phoneNumber1")
            .avatarUrl("avatarUrl1")
            .locale("locale1")
            .twoFactorSecret("twoFactorSecret1");
    }

    public static UserProfile getUserProfileSample2() {
        return new UserProfile()
            .id(2L)
            .jhiUserId("jhiUserId2")
            .phoneNumber("phoneNumber2")
            .avatarUrl("avatarUrl2")
            .locale("locale2")
            .twoFactorSecret("twoFactorSecret2");
    }

    public static UserProfile getUserProfileRandomSampleGenerator() {
        return new UserProfile()
            .id(longCount.incrementAndGet())
            .jhiUserId(UUID.randomUUID().toString())
            .phoneNumber(UUID.randomUUID().toString())
            .avatarUrl(UUID.randomUUID().toString())
            .locale(UUID.randomUUID().toString())
            .twoFactorSecret(UUID.randomUUID().toString());
    }
}
