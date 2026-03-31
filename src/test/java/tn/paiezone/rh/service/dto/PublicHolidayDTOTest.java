package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PublicHolidayDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(PublicHolidayDTO.class);
        PublicHolidayDTO publicHolidayDTO1 = new PublicHolidayDTO();
        publicHolidayDTO1.setId(1L);
        PublicHolidayDTO publicHolidayDTO2 = new PublicHolidayDTO();
        assertThat(publicHolidayDTO1).isNotEqualTo(publicHolidayDTO2);
        publicHolidayDTO2.setId(publicHolidayDTO1.getId());
        assertThat(publicHolidayDTO1).isEqualTo(publicHolidayDTO2);
        publicHolidayDTO2.setId(2L);
        assertThat(publicHolidayDTO1).isNotEqualTo(publicHolidayDTO2);
        publicHolidayDTO1.setId(null);
        assertThat(publicHolidayDTO1).isNotEqualTo(publicHolidayDTO2);
    }
}
