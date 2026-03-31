package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.AuditLogTestSamples.*;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.UserProfileTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AuditLogTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AuditLog.class);
        AuditLog auditLog1 = getAuditLogSample1();
        AuditLog auditLog2 = new AuditLog();
        assertThat(auditLog1).isNotEqualTo(auditLog2);

        auditLog2.setId(auditLog1.getId());
        assertThat(auditLog1).isEqualTo(auditLog2);

        auditLog2 = getAuditLogSample2();
        assertThat(auditLog1).isNotEqualTo(auditLog2);
    }

    @Test
    void userTest() {
        AuditLog auditLog = getAuditLogRandomSampleGenerator();
        UserProfile userProfileBack = getUserProfileRandomSampleGenerator();

        auditLog.setUser(userProfileBack);
        assertThat(auditLog.getUser()).isEqualTo(userProfileBack);

        auditLog.user(null);
        assertThat(auditLog.getUser()).isNull();
    }

    @Test
    void companyTest() {
        AuditLog auditLog = getAuditLogRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        auditLog.setCompany(companyBack);
        assertThat(auditLog.getCompany()).isEqualTo(companyBack);

        auditLog.company(null);
        assertThat(auditLog.getCompany()).isNull();
    }
}
