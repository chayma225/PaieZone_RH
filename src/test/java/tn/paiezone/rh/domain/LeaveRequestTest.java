package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.LeaveRequestTestSamples.*;
import static tn.paiezone.rh.domain.LeaveTypeTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class LeaveRequestTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(LeaveRequest.class);
        LeaveRequest leaveRequest1 = getLeaveRequestSample1();
        LeaveRequest leaveRequest2 = new LeaveRequest();
        assertThat(leaveRequest1).isNotEqualTo(leaveRequest2);

        leaveRequest2.setId(leaveRequest1.getId());
        assertThat(leaveRequest1).isEqualTo(leaveRequest2);

        leaveRequest2 = getLeaveRequestSample2();
        assertThat(leaveRequest1).isNotEqualTo(leaveRequest2);
    }

    @Test
    void employeeTest() {
        LeaveRequest leaveRequest = getLeaveRequestRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        leaveRequest.setEmployee(employeeBack);
        assertThat(leaveRequest.getEmployee()).isEqualTo(employeeBack);

        leaveRequest.employee(null);
        assertThat(leaveRequest.getEmployee()).isNull();
    }

    @Test
    void leaveTypeTest() {
        LeaveRequest leaveRequest = getLeaveRequestRandomSampleGenerator();
        LeaveType leaveTypeBack = getLeaveTypeRandomSampleGenerator();

        leaveRequest.setLeaveType(leaveTypeBack);
        assertThat(leaveRequest.getLeaveType()).isEqualTo(leaveTypeBack);

        leaveRequest.leaveType(null);
        assertThat(leaveRequest.getLeaveType()).isNull();
    }

    @Test
    void approvedByTest() {
        LeaveRequest leaveRequest = getLeaveRequestRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        leaveRequest.setApprovedBy(userProfileBack);
        assertThat(leaveRequest.getApprovedBy()).isEqualTo(userProfileBack);

        leaveRequest.approvedBy(null);
        assertThat(leaveRequest.getApprovedBy()).isNull();
    }
}
