package tn.paiezone.rh.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class RegulatoryParamDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(RegulatoryParamDTO.class);
        RegulatoryParamDTO regulatoryParamDTO1 = new RegulatoryParamDTO();
        regulatoryParamDTO1.setId(1L);
        RegulatoryParamDTO regulatoryParamDTO2 = new RegulatoryParamDTO();
        assertThat(regulatoryParamDTO1).isNotEqualTo(regulatoryParamDTO2);
        regulatoryParamDTO2.setId(regulatoryParamDTO1.getId());
        assertThat(regulatoryParamDTO1).isEqualTo(regulatoryParamDTO2);
        regulatoryParamDTO2.setId(2L);
        assertThat(regulatoryParamDTO1).isNotEqualTo(regulatoryParamDTO2);
        regulatoryParamDTO1.setId(null);
        assertThat(regulatoryParamDTO1).isNotEqualTo(regulatoryParamDTO2);
    }
}
