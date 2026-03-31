package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.TimeEntryTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class TimeEntryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TimeEntry.class);
        TimeEntry timeEntry1 = getTimeEntrySample1();
        TimeEntry timeEntry2 = new TimeEntry();
        assertThat(timeEntry1).isNotEqualTo(timeEntry2);

        timeEntry2.setId(timeEntry1.getId());
        assertThat(timeEntry1).isEqualTo(timeEntry2);

        timeEntry2 = getTimeEntrySample2();
        assertThat(timeEntry1).isNotEqualTo(timeEntry2);
    }

    @Test
    void employeeTest() {
        TimeEntry timeEntry = getTimeEntryRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        timeEntry.setEmployee(employeeBack);
        assertThat(timeEntry.getEmployee()).isEqualTo(employeeBack);

        timeEntry.employee(null);
        assertThat(timeEntry.getEmployee()).isNull();
    }

    @Test
    void validatedByUserTest() {
        TimeEntry timeEntry = getTimeEntryRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        timeEntry.setValidatedByUser(userProfileBack);
        assertThat(timeEntry.getValidatedByUser()).isEqualTo(userProfileBack);

        timeEntry.validatedByUser(null);
        assertThat(timeEntry.getValidatedByUser()).isNull();
    }
}
