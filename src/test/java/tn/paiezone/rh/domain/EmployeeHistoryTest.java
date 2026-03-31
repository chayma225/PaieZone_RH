package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.EmployeeHistoryTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class EmployeeHistoryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(EmployeeHistory.class);
        EmployeeHistory employeeHistory1 = getEmployeeHistorySample1();
        EmployeeHistory employeeHistory2 = new EmployeeHistory();
        assertThat(employeeHistory1).isNotEqualTo(employeeHistory2);

        employeeHistory2.setId(employeeHistory1.getId());
        assertThat(employeeHistory1).isEqualTo(employeeHistory2);

        employeeHistory2 = getEmployeeHistorySample2();
        assertThat(employeeHistory1).isNotEqualTo(employeeHistory2);
    }

    @Test
    void employeeTest() {
        EmployeeHistory employeeHistory = getEmployeeHistoryRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        employeeHistory.setEmployee(employeeBack);
        assertThat(employeeHistory.getEmployee()).isEqualTo(employeeBack);

        employeeHistory.employee(null);
        assertThat(employeeHistory.getEmployee()).isNull();
    }
}
