package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.DepartmentTestSamples.*;
import static tn.paiezone.rh.domain.JobPositionTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class JobPositionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(JobPosition.class);
        JobPosition jobPosition1 = getJobPositionSample1();
        JobPosition jobPosition2 = new JobPosition();
        assertThat(jobPosition1).isNotEqualTo(jobPosition2);

        jobPosition2.setId(jobPosition1.getId());
        assertThat(jobPosition1).isEqualTo(jobPosition2);

        jobPosition2 = getJobPositionSample2();
        assertThat(jobPosition1).isNotEqualTo(jobPosition2);
    }

    @Test
    void companyTest() {
        JobPosition jobPosition = getJobPositionRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        jobPosition.setCompany(companyBack);
        assertThat(jobPosition.getCompany()).isEqualTo(companyBack);

        jobPosition.company(null);
        assertThat(jobPosition.getCompany()).isNull();
    }

    @Test
    void departmentTest() {
        JobPosition jobPosition = getJobPositionRandomSampleGenerator();
        Department departmentBack = getDepartmentRandomSampleGenerator();

        jobPosition.setDepartment(departmentBack);
        assertThat(jobPosition.getDepartment()).isEqualTo(departmentBack);

        jobPosition.department(null);
        assertThat(jobPosition.getDepartment()).isNull();
    }
}
