package tn.paiezone.rh.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import tn.paiezone.rh.IntegrationTest;

@IntegrationTest
@AutoConfigureMockMvc
class PublicInitResourceIT {

    @Autowired
    private MockMvc restMockMvc;

    @Test
    void initStatus_isPublicAndReturnsPayload() throws Exception {
        restMockMvc
            .perform(get(PublicInitResource.INIT_STATUS_PATH))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.application").value("paieZoneRH"))
            .andExpect(jsonPath("$.phase").value("initialisation-sprint-1"))
            .andExpect(jsonPath("$.ok").value(true));
    }
}
