package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.PublicHolidayTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class PublicHolidayTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(PublicHoliday.class);
        PublicHoliday publicHoliday1 = getPublicHolidaySample1();
        PublicHoliday publicHoliday2 = new PublicHoliday();
        assertThat(publicHoliday1).isNotEqualTo(publicHoliday2);

        publicHoliday2.setId(publicHoliday1.getId());
        assertThat(publicHoliday1).isEqualTo(publicHoliday2);

        publicHoliday2 = getPublicHolidaySample2();
        assertThat(publicHoliday1).isNotEqualTo(publicHoliday2);
    }
}
