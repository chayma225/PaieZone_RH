package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class ChatSessionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChatSessionDTO.class);
        ChatSessionDTO chatSessionDTO1 = new ChatSessionDTO();
        chatSessionDTO1.setId(1L);
        ChatSessionDTO chatSessionDTO2 = new ChatSessionDTO();
        assertThat(chatSessionDTO1).isNotEqualTo(chatSessionDTO2);
        chatSessionDTO2.setId(chatSessionDTO1.getId());
        assertThat(chatSessionDTO1).isEqualTo(chatSessionDTO2);
        chatSessionDTO2.setId(2L);
        assertThat(chatSessionDTO1).isNotEqualTo(chatSessionDTO2);
        chatSessionDTO1.setId(null);
        assertThat(chatSessionDTO1).isNotEqualTo(chatSessionDTO2);
    }
}
