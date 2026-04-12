package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.BonusTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.PaySlipTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class BonusTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Bonus.class);
        Bonus bonus1 = getBonusSample1();
        Bonus bonus2 = new Bonus();
        assertThat(bonus1).isNotEqualTo(bonus2);

        bonus2.setId(bonus1.getId());
        assertThat(bonus1).isEqualTo(bonus2);

        bonus2 = getBonusSample2();
        assertThat(bonus1).isNotEqualTo(bonus2);
    }

    @Test
    void employeeTest() {
        Bonus bonus = getBonusRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        bonus.setEmployee(employeeBack);
        assertThat(bonus.getEmployee()).isEqualTo(employeeBack);

        bonus.employee(null);
        assertThat(bonus.getEmployee()).isNull();
    }

    @Test
    void paySlipTest() {
        Bonus bonus = getBonusRandomSampleGenerator();
        PaySlip paySlipBack = getPaySlipRandomSampleGenerator();

        bonus.setPaySlip(paySlipBack);
        assertThat(bonus.getPaySlip()).isEqualTo(paySlipBack);

        bonus.paySlip(null);
        assertThat(bonus.getPaySlip()).isNull();
    }
}
