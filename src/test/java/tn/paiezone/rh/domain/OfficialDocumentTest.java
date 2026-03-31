package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.OfficialDocumentTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class OfficialDocumentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(OfficialDocument.class);
        OfficialDocument officialDocument1 = getOfficialDocumentSample1();
        OfficialDocument officialDocument2 = new OfficialDocument();
        assertThat(officialDocument1).isNotEqualTo(officialDocument2);

        officialDocument2.setId(officialDocument1.getId());
        assertThat(officialDocument1).isEqualTo(officialDocument2);

        officialDocument2 = getOfficialDocumentSample2();
        assertThat(officialDocument1).isNotEqualTo(officialDocument2);
    }

    @Test
    void companyTest() {
        OfficialDocument officialDocument = getOfficialDocumentRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        officialDocument.setCompany(companyBack);
        assertThat(officialDocument.getCompany()).isEqualTo(companyBack);

        officialDocument.company(null);
        assertThat(officialDocument.getCompany()).isNull();
    }

    @Test
    void employeeTest() {
        OfficialDocument officialDocument = getOfficialDocumentRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        officialDocument.setEmployee(employeeBack);
        assertThat(officialDocument.getEmployee()).isEqualTo(employeeBack);

        officialDocument.employee(null);
        assertThat(officialDocument.getEmployee()).isNull();
    }

    @Test
    void generatedByTest() {
        OfficialDocument officialDocument = getOfficialDocumentRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        officialDocument.setGeneratedBy(userProfileBack);
        assertThat(officialDocument.getGeneratedBy()).isEqualTo(userProfileBack);

        officialDocument.generatedBy(null);
        assertThat(officialDocument.getGeneratedBy()).isNull();
    }
}
