package tn.paiezone.rh.domain;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.AdvanceTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.getEmployeeRandomSampleGenerator;
import static tn.paiezone.rh.domain.PaySlipTestSamples.getPaySlipRandomSampleGenerator;

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
    void approvedByTest() {
        Advance advance = getAdvanceRandomSampleGenerator();
        advance.setApprovedBy("manager1");
        assertThat(advance.getApprovedBy()).isEqualTo("manager1");
        advance.setApprovedBy(null);
        assertThat(advance.getApprovedBy()).isNull();
    }
}
