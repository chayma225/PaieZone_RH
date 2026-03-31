package tn.paiezone.rh.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static tn.paiezone.rh.domain.AccountingEntryTestSamples.*;
import static tn.paiezone.rh.domain.CompanyTestSamples.*;
import static tn.paiezone.rh.domain.PayrollPeriodTestSamples.*;

import org.junit.jupiter.api.Test;
import tn.paiezone.rh.web.rest.TestUtil;

class AccountingEntryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AccountingEntry.class);
        AccountingEntry accountingEntry1 = getAccountingEntrySample1();
        AccountingEntry accountingEntry2 = new AccountingEntry();
        assertThat(accountingEntry1).isNotEqualTo(accountingEntry2);

        accountingEntry2.setId(accountingEntry1.getId());
        assertThat(accountingEntry1).isEqualTo(accountingEntry2);

        accountingEntry2 = getAccountingEntrySample2();
        assertThat(accountingEntry1).isNotEqualTo(accountingEntry2);
    }

    @Test
    void companyTest() {
        AccountingEntry accountingEntry = getAccountingEntryRandomSampleGenerator();
        Company companyBack = getCompanyRandomSampleGenerator();

        accountingEntry.setCompany(companyBack);
        assertThat(accountingEntry.getCompany()).isEqualTo(companyBack);

        accountingEntry.company(null);
        assertThat(accountingEntry.getCompany()).isNull();
    }

    @Test
    void payrollPeriodTest() {
        AccountingEntry accountingEntry = getAccountingEntryRandomSampleGenerator();
        PayrollPeriod payrollPeriodBack = getPayrollPeriodRandomSampleGenerator();

        accountingEntry.setPayrollPeriod(payrollPeriodBack);
        assertThat(accountingEntry.getPayrollPeriod()).isEqualTo(payrollPeriodBack);

        accountingEntry.payrollPeriod(null);
        assertThat(accountingEntry.getPayrollPeriod()).isNull();
    }
}
