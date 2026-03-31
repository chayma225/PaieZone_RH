package tn.paiezone.rh.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class EmployeeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + (2 * Short.MAX_VALUE));

    public static Employee getEmployeeSample1() {
        return new Employee()
            .id(1L)
            .matricule("matricule1")
            .firstName("firstName1")
            .lastName("lastName1")
            .firstNameAr("firstNameAr1")
            .lastNameAr("lastNameAr1")
            .birthPlace("birthPlace1")
            .numberOfChildren(1)
            .nationalId("nationalId1")
            .passportNumber("passportNumber1")
            .nationality("nationality1")
            .address("address1")
            .city("city1")
            .personalEmail("personalEmail1")
            .professionalEmail("professionalEmail1")
            .phoneNumber("phoneNumber1")
            .cnssNumber("cnssNumber1")
            .photoUrl("photoUrl1");
    }

    public static Employee getEmployeeSample2() {
        return new Employee()
            .id(2L)
            .matricule("matricule2")
            .firstName("firstName2")
            .lastName("lastName2")
            .firstNameAr("firstNameAr2")
            .lastNameAr("lastNameAr2")
            .birthPlace("birthPlace2")
            .numberOfChildren(2)
            .nationalId("nationalId2")
            .passportNumber("passportNumber2")
            .nationality("nationality2")
            .address("address2")
            .city("city2")
            .personalEmail("personalEmail2")
            .professionalEmail("professionalEmail2")
            .phoneNumber("phoneNumber2")
            .cnssNumber("cnssNumber2")
            .photoUrl("photoUrl2");
    }

    public static Employee getEmployeeRandomSampleGenerator() {
        return new Employee()
            .id(longCount.incrementAndGet())
            .matricule(UUID.randomUUID().toString())
            .firstName(UUID.randomUUID().toString())
            .lastName(UUID.randomUUID().toString())
            .firstNameAr(UUID.randomUUID().toString())
            .lastNameAr(UUID.randomUUID().toString())
            .birthPlace(UUID.randomUUID().toString())
            .numberOfChildren(intCount.incrementAndGet())
            .nationalId(UUID.randomUUID().toString())
            .passportNumber(UUID.randomUUID().toString())
            .nationality(UUID.randomUUID().toString())
            .address(UUID.randomUUID().toString())
            .city(UUID.randomUUID().toString())
            .personalEmail(UUID.randomUUID().toString())
            .professionalEmail(UUID.randomUUID().toString())
            .phoneNumber(UUID.randomUUID().toString())
            .cnssNumber(UUID.randomUUID().toString())
            .photoUrl(UUID.randomUUID().toString());
    }
}
