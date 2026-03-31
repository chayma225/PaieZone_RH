package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.ChatMessageTestSamples.*;
import static tn.paiezone.rh.domain.ChatSessionTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class ChatMessageTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChatMessage.class);
        ChatMessage chatMessage1 = getChatMessageSample1();
        ChatMessage chatMessage2 = new ChatMessage();
        assertThat(chatMessage1).isNotEqualTo(chatMessage2);

        chatMessage2.setId(chatMessage1.getId());
        assertThat(chatMessage1).isEqualTo(chatMessage2);

        chatMessage2 = getChatMessageSample2();
        assertThat(chatMessage1).isNotEqualTo(chatMessage2);
    }

    @Test
    void sessionTest() {
        ChatMessage chatMessage = getChatMessageRandomSampleGenerator();
        ChatSession chatSessionBack = getChatSessionRandomSampleGenerator();

        chatMessage.setSession(chatSessionBack);
        assertThat(chatMessage.getSession()).isEqualTo(chatSessionBack);

        chatMessage.session(null);
        assertThat(chatMessage.getSession()).isNull();
    }
}
