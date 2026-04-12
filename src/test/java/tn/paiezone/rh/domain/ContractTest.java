package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.ContractTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class ContractTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Contract.class);
        Contract contract1 = getContractSample1();
        Contract contract2 = new Contract();
        assertThat(contract1).isNotEqualTo(contract2);

        contract2.setId(contract1.getId());
        assertThat(contract1).isEqualTo(contract2);

        contract2 = getContractSample2();
        assertThat(contract1).isNotEqualTo(contract2);
    }

    @Test
    void employeeTest() {
        Contract contract = getContractRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        contract.setEmployee(employeeBack);
        assertThat(contract.getEmployee()).isEqualTo(employeeBack);

        contract.employee(null);
        assertThat(contract.getEmployee()).isNull();
    }

    @Test
    void createdByTest() {
        Contract contract = getContractRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        contract.setCreatedBy(userProfileBack);
        assertThat(contract.getCreatedBy()).isEqualTo(userProfileBack);

        contract.createdBy(null);
        assertThat(contract.getCreatedBy()).isNull();
    }
}
