package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.DepartmentTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.JobPositionTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class EmployeeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Employee.class);
        Employee employee1 = getEmployeeSample1();
        Employee employee2 = new Employee();
        assertThat(employee1).isNotEqualTo(employee2);

        employee2.setId(employee1.getId());
        assertThat(employee1).isEqualTo(employee2);

        employee2 = getEmployeeSample2();
        assertThat(employee1).isNotEqualTo(employee2);
    }

    @Test
    void companyTest() {
        Employee employee = getEmployeeRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        employee.setCompany(companyBack);
        assertThat(employee.getCompany()).isEqualTo(companyBack);

        employee.company(null);
        assertThat(employee.getCompany()).isNull();
    }

    @Test
    void departmentTest() {
        Employee employee = getEmployeeRandomSampleGenerator();
        Department departmentBack = getDepartmentRandomSampleGenerator();

        employee.setDepartment(departmentBack);
        assertThat(employee.getDepartment()).isEqualTo(departmentBack);

        employee.department(null);
        assertThat(employee.getDepartment()).isNull();
    }

    @Test
    void positionTest() {
        Employee employee = getEmployeeRandomSampleGenerator();
        JobPosition jobPositionBack = getJobPositionRandomSampleGenerator();

        employee.setPosition(jobPositionBack);
        assertThat(employee.getPosition()).isEqualTo(jobPositionBack);

        employee.position(null);
        assertThat(employee.getPosition()).isNull();
    }

    @Test
    void managerTest() {
        Employee employee = getEmployeeRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        employee.setManager(employeeBack);
        assertThat(employee.getManager()).isEqualTo(employeeBack);

        employee.manager(null);
        assertThat(employee.getManager()).isNull();
    }

    @Test
    void userProfileTest() {
        Employee employee = getEmployeeRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        employee.setUserProfile(userProfileBack);
        assertThat(employee.getUserProfile()).isEqualTo(userProfileBack);

        employee.userProfile(null);
        assertThat(employee.getUserProfile()).isNull();
    }
}
