package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.LeaveBalanceTestSamples.*;
import static tn.paiezone.rh.domain.LeaveTypeTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class LeaveBalanceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(LeaveBalance.class);
        LeaveBalance leaveBalance1 = getLeaveBalanceSample1();
        LeaveBalance leaveBalance2 = new LeaveBalance();
        assertThat(leaveBalance1).isNotEqualTo(leaveBalance2);

        leaveBalance2.setId(leaveBalance1.getId());
        assertThat(leaveBalance1).isEqualTo(leaveBalance2);

        leaveBalance2 = getLeaveBalanceSample2();
        assertThat(leaveBalance1).isNotEqualTo(leaveBalance2);
    }

    @Test
    void employeeTest() {
        LeaveBalance leaveBalance = getLeaveBalanceRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        leaveBalance.setEmployee(employeeBack);
        assertThat(leaveBalance.getEmployee()).isEqualTo(employeeBack);

        leaveBalance.employee(null);
        assertThat(leaveBalance.getEmployee()).isNull();
    }

    @Test
    void leaveTypeTest() {
        LeaveBalance leaveBalance = getLeaveBalanceRandomSampleGenerator();
        LeaveType leaveTypeBack = getLeaveTypeRandomSampleGenerator();

        leaveBalance.setLeaveType(leaveTypeBack);
        assertThat(leaveBalance.getLeaveType()).isEqualTo(leaveTypeBack);

        leaveBalance.leaveType(null);
        assertThat(leaveBalance.getLeaveType()).isNull();
    }
}
