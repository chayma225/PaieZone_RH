package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.ChatSessionTestSamples.*;
import static tn.paiezone.rh.domain.EmployeeTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class ChatSessionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChatSession.class);
        ChatSession chatSession1 = getChatSessionSample1();
        ChatSession chatSession2 = new ChatSession();
        assertThat(chatSession1).isNotEqualTo(chatSession2);

        chatSession2.setId(chatSession1.getId());
        assertThat(chatSession1).isEqualTo(chatSession2);

        chatSession2 = getChatSessionSample2();
        assertThat(chatSession1).isNotEqualTo(chatSession2);
    }

    @Test
    void employeeTest() {
        ChatSession chatSession = getChatSessionRandomSampleGenerator();
        Employee employeeBack = getEmployeeRandomSampleGenerator();

        chatSession.setEmployee(employeeBack);
        assertThat(chatSession.getEmployee()).isEqualTo(employeeBack);

        chatSession.employee(null);
        assertThat(chatSession.getEmployee()).isNull();
    }
}
