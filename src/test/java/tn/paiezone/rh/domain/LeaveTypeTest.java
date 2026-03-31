package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.LeaveTypeTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class LeaveTypeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(LeaveType.class);
        LeaveType leaveType1 = getLeaveTypeSample1();
        LeaveType leaveType2 = new LeaveType();
        assertThat(leaveType1).isNotEqualTo(leaveType2);

        leaveType2.setId(leaveType1.getId());
        assertThat(leaveType1).isEqualTo(leaveType2);

        leaveType2 = getLeaveTypeSample2();
        assertThat(leaveType1).isNotEqualTo(leaveType2);
    }

    @Test
    void companyTest() {
        LeaveType leaveType = getLeaveTypeRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        leaveType.setCompany(companyBack);
        assertThat(leaveType.getCompany()).isEqualTo(companyBack);

        leaveType.company(null);
        assertThat(leaveType.getCompany()).isNull();
    }
}
