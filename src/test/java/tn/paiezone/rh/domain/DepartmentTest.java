package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.DepartmentTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class DepartmentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Department.class);
        Department department1 = getDepartmentSample1();
        Department department2 = new Department();
        assertThat(department1).isNotEqualTo(department2);

        department2.setId(department1.getId());
        assertThat(department1).isEqualTo(department2);

        department2 = getDepartmentSample2();
        assertThat(department1).isNotEqualTo(department2);
    }

    @Test
    void companyTest() {
        Department department = getDepartmentRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        department.setCompany(companyBack);
        assertThat(department.getCompany()).isEqualTo(companyBack);

        department.company(null);
        assertThat(department.getCompany()).isNull();
    }

    @Test
    void managerTest() {
        Department department = getDepartmentRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        department.setManager(employeeBack);
        assertThat(department.getManager()).isEqualTo(employeeBack);

        department.manager(null);
        assertThat(department.getManager()).isNull();
    }
}
