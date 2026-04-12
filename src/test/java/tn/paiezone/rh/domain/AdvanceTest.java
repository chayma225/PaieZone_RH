package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.AdvanceTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.PaySlipTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AdvanceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Advance.class);
        Advance advance1 = getAdvanceSample1();
        Advance advance2 = new Advance();
        assertThat(advance1).isNotEqualTo(advance2);

        advance2.setId(advance1.getId());
        assertThat(advance1).isEqualTo(advance2);

        advance2 = getAdvanceSample2();
        assertThat(advance1).isNotEqualTo(advance2);
    }

    @Test
    void employeeTest() {
        Advance advance = getAdvanceRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        advance.setEmployee(employeeBack);
        assertThat(advance.getEmployee()).isEqualTo(employeeBack);

        advance.employee(null);
        assertThat(advance.getEmployee()).isNull();
    }

    @Test
    void paySlipTest() {
        Advance advance = getAdvanceRandomSampleGenerator();
        PaySlip paySlipBack = getPaySlipRandomSampleGenerator();

        advance.setPaySlip(paySlipBack);
        assertThat(advance.getPaySlip()).isEqualTo(paySlipBack);

        advance.paySlip(null);
        assertThat(advance.getPaySlip()).isNull();
    }

    @Test
    void approvedByUserTest() {
        Advance advance = getAdvanceRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        advance.setApprovedByUser(userProfileBack);
        assertThat(advance.getApprovedByUser()).isEqualTo(userProfileBack);

        advance.approvedByUser(null);
        assertThat(advance.getApprovedByUser()).isNull();
    }
}
