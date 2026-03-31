package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class ChatMessageDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChatMessageDTO.class);
        ChatMessageDTO chatMessageDTO1 = new ChatMessageDTO();
        chatMessageDTO1.setId(1L);
        ChatMessageDTO chatMessageDTO2 = new ChatMessageDTO();
        assertThat(chatMessageDTO1).isNotEqualTo(chatMessageDTO2);
        chatMessageDTO2.setId(chatMessageDTO1.getId());
        assertThat(chatMessageDTO1).isEqualTo(chatMessageDTO2);
        chatMessageDTO2.setId(2L);
        assertThat(chatMessageDTO1).isNotEqualTo(chatMessageDTO2);
        chatMessageDTO1.setId(null);
        assertThat(chatMessageDTO1).isNotEqualTo(chatMessageDTO2);
    }
}
