package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.HrDocumentTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class HrDocumentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(HrDocument.class);
        HrDocument hrDocument1 = getHrDocumentSample1();
        HrDocument hrDocument2 = new HrDocument();
        assertThat(hrDocument1).isNotEqualTo(hrDocument2);

        hrDocument2.setId(hrDocument1.getId());
        assertThat(hrDocument1).isEqualTo(hrDocument2);

        hrDocument2 = getHrDocumentSample2();
        assertThat(hrDocument1).isNotEqualTo(hrDocument2);
    }

    @Test
    void employeeTest() {
        HrDocument hrDocument = getHrDocumentRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        hrDocument.setEmployee(employeeBack);
        assertThat(hrDocument.getEmployee()).isEqualTo(employeeBack);

        hrDocument.employee(null);
        assertThat(hrDocument.getEmployee()).isNull();
    }

    @Test
    void uploadedByTest() {
        HrDocument hrDocument = getHrDocumentRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        hrDocument.setUploadedBy(userProfileBack);
        assertThat(hrDocument.getUploadedBy()).isEqualTo(userProfileBack);

        hrDocument.uploadedBy(null);
        assertThat(hrDocument.getUploadedBy()).isNull();
    }
}
