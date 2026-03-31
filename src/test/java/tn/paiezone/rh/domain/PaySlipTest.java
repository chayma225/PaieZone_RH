package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.ContractTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.PaySlipTestSamples.*;
import static tn.paiezone.rh.domain.PayrollPeriodTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PaySlipTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PaySlip.class);
        PaySlip paySlip1 = getPaySlipSample1();
        PaySlip paySlip2 = new PaySlip();
        assertThat(paySlip1).isNotEqualTo(paySlip2);

        paySlip2.setId(paySlip1.getId());
        assertThat(paySlip1).isEqualTo(paySlip2);

        paySlip2 = getPaySlipSample2();
        assertThat(paySlip1).isNotEqualTo(paySlip2);
    }

    @Test
    void employeeTest() {
        PaySlip paySlip = getPaySlipRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        paySlip.setEmployee(employeeBack);
        assertThat(paySlip.getEmployee()).isEqualTo(employeeBack);

        paySlip.employee(null);
        assertThat(paySlip.getEmployee()).isNull();
    }

    @Test
    void payrollPeriodTest() {
        PaySlip paySlip = getPaySlipRandomSampleGenerator();
        PayrollPeriod payrollPeriodBack = getPayrollPeriodRandomSampleGenerator();

        paySlip.setPayrollPeriod(payrollPeriodBack);
        assertThat(paySlip.getPayrollPeriod()).isEqualTo(payrollPeriodBack);

        paySlip.payrollPeriod(null);
        assertThat(paySlip.getPayrollPeriod()).isNull();
    }

    @Test
    void contractTest() {
        PaySlip paySlip = getPaySlipRandomSampleGenerator();
        Contract contractBack = getContractRandomSampleGenerator();

        paySlip.setContract(contractBack);
        assertThat(paySlip.getContract()).isEqualTo(contractBack);

        paySlip.contract(null);
        assertThat(paySlip.getContract()).isNull();
    }
}
