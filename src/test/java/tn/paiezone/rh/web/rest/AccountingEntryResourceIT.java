package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.AccountingEntryAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.IntegrationTest;
import tn.paiezone.rh.domain.AccountingEntry;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.enumeration.AccountingEntryType;
import tn.paiezone.rh.repository.AccountingEntryRepository;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;
import tn.paiezone.rh.service.mapper.AccountingEntryMapper;

/**
 * Integration tests for the {@link AccountingEntryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AccountingEntryResourceIT {

    private static final LocalDate DEFAULT_ENTRY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_ENTRY_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_JOURNAL_REF = "AAAAAAAAAA";
    private static final String UPDATED_JOURNAL_REF = "BBBBBBBBBB";

    private static final AccountingEntryType DEFAULT_ENTRY_TYPE = AccountingEntryType.SALARY_EXPENSE;
    private static final AccountingEntryType UPDATED_ENTRY_TYPE = AccountingEntryType.CNSS_EXPENSE;

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_DEBIT_ACCOUNT = "AAAAAAAAAA";
    private static final String UPDATED_DEBIT_ACCOUNT = "BBBBBBBBBB";

    private static final String DEFAULT_CREDIT_ACCOUNT = "AAAAAAAAAA";
    private static final String UPDATED_CREDIT_ACCOUNT = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);

    private static final Instant DEFAULT_EXPORTED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_EXPORTED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_EXPORT_FORMAT = "AAAAAAAAAA";
    private static final String UPDATED_EXPORT_FORMAT = "BBBBBBBBBB";

    private static final String DEFAULT_EXPORT_REF = "AAAAAAAAAA";
    private static final String UPDATED_EXPORT_REF = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/accounting-entries";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AccountingEntryRepository accountingEntryRepository;

    @Autowired
    private AccountingEntryMapper accountingEntryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAccountingEntryMockMvc;

    private AccountingEntry accountingEntry;

    private AccountingEntry insertedAccountingEntry;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AccountingEntry createEntity(EntityManager em) {
        AccountingEntry accountingEntry = new AccountingEntry()
            .entryDate(DEFAULT_ENTRY_DATE)
            .journalRef(DEFAULT_JOURNAL_REF)
            .entryType(DEFAULT_ENTRY_TYPE)
            .description(DEFAULT_DESCRIPTION)
            .debitAccount(DEFAULT_DEBIT_ACCOUNT)
            .creditAccount(DEFAULT_CREDIT_ACCOUNT)
            .amount(DEFAULT_AMOUNT)
            .exportedAt(DEFAULT_EXPORTED_AT)
            .exportFormat(DEFAULT_EXPORT_FORMAT)
            .exportRef(DEFAULT_EXPORT_REF);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        accountingEntry.setCompany(company);
        return accountingEntry;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AccountingEntry createUpdatedEntity(EntityManager em) {
        AccountingEntry updatedAccountingEntry = new AccountingEntry()
            .entryDate(UPDATED_ENTRY_DATE)
            .journalRef(UPDATED_JOURNAL_REF)
            .entryType(UPDATED_ENTRY_TYPE)
            .description(UPDATED_DESCRIPTION)
            .debitAccount(UPDATED_DEBIT_ACCOUNT)
            .creditAccount(UPDATED_CREDIT_ACCOUNT)
            .amount(UPDATED_AMOUNT)
            .exportedAt(UPDATED_EXPORTED_AT)
            .exportFormat(UPDATED_EXPORT_FORMAT)
            .exportRef(UPDATED_EXPORT_REF);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createUpdatedEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        updatedAccountingEntry.setCompany(company);
        return updatedAccountingEntry;
    }

    @BeforeEach
    void initTest() {
        accountingEntry = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedAccountingEntry != null) {
            accountingEntryRepository.delete(insertedAccountingEntry);
            insertedAccountingEntry = null;
        }
    }

    @Test
    @Transactional
    void createAccountingEntry() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);
        var returnedAccountingEntryDTO = om.readValue(
            restAccountingEntryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AccountingEntryDTO.class
        );

        // Validate the AccountingEntry in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAccountingEntry = accountingEntryMapper.toEntity(returnedAccountingEntryDTO);
        assertAccountingEntryUpdatableFieldsEquals(returnedAccountingEntry, getPersistedAccountingEntry(returnedAccountingEntry));

        insertedAccountingEntry = returnedAccountingEntry;
    }

    @Test
    @Transactional
    void createAccountingEntryWithExistingId() throws Exception {
        // Create the AccountingEntry with an existing ID
        accountingEntry.setId(1L);
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEntryDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setEntryDate(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkJournalRefIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setJournalRef(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEntryTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setEntryType(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDescriptionIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setDescription(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDebitAccountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setDebitAccount(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreditAccountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setCreditAccount(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountingEntry.setAmount(null);

        // Create the AccountingEntry, which fails.
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        restAccountingEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAccountingEntries() throws Exception {
        // Initialize the database
        insertedAccountingEntry = accountingEntryRepository.saveAndFlush(accountingEntry);

        // Get all the accountingEntryList
        restAccountingEntryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(accountingEntry.getId().intValue())))
            .andExpect(jsonPath("$.[*].entryDate").value(hasItem(DEFAULT_ENTRY_DATE.toString())))
            .andExpect(jsonPath("$.[*].journalRef").value(hasItem(DEFAULT_JOURNAL_REF)))
            .andExpect(jsonPath("$.[*].entryType").value(hasItem(DEFAULT_ENTRY_TYPE.toString())))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].debitAccount").value(hasItem(DEFAULT_DEBIT_ACCOUNT)))
            .andExpect(jsonPath("$.[*].creditAccount").value(hasItem(DEFAULT_CREDIT_ACCOUNT)))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].exportedAt").value(hasItem(DEFAULT_EXPORTED_AT.toString())))
            .andExpect(jsonPath("$.[*].exportFormat").value(hasItem(DEFAULT_EXPORT_FORMAT)))
            .andExpect(jsonPath("$.[*].exportRef").value(hasItem(DEFAULT_EXPORT_REF)));
    }

    @Test
    @Transactional
    void getAccountingEntry() throws Exception {
        // Initialize the database
        insertedAccountingEntry = accountingEntryRepository.saveAndFlush(accountingEntry);

        // Get the accountingEntry
        restAccountingEntryMockMvc
            .perform(get(ENTITY_API_URL_ID, accountingEntry.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(accountingEntry.getId().intValue()))
            .andExpect(jsonPath("$.entryDate").value(DEFAULT_ENTRY_DATE.toString()))
            .andExpect(jsonPath("$.journalRef").value(DEFAULT_JOURNAL_REF))
            .andExpect(jsonPath("$.entryType").value(DEFAULT_ENTRY_TYPE.toString()))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.debitAccount").value(DEFAULT_DEBIT_ACCOUNT))
            .andExpect(jsonPath("$.creditAccount").value(DEFAULT_CREDIT_ACCOUNT))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.exportedAt").value(DEFAULT_EXPORTED_AT.toString()))
            .andExpect(jsonPath("$.exportFormat").value(DEFAULT_EXPORT_FORMAT))
            .andExpect(jsonPath("$.exportRef").value(DEFAULT_EXPORT_REF));
    }

    @Test
    @Transactional
    void getNonExistingAccountingEntry() throws Exception {
        // Get the accountingEntry
        restAccountingEntryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAccountingEntry() throws Exception {
        // Initialize the database
        insertedAccountingEntry = accountingEntryRepository.saveAndFlush(accountingEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the accountingEntry
        AccountingEntry updatedAccountingEntry = accountingEntryRepository.findById(accountingEntry.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAccountingEntry are not directly saved in db
        em.detach(updatedAccountingEntry);
        updatedAccountingEntry
            .entryDate(UPDATED_ENTRY_DATE)
            .journalRef(UPDATED_JOURNAL_REF)
            .entryType(UPDATED_ENTRY_TYPE)
            .description(UPDATED_DESCRIPTION)
            .debitAccount(UPDATED_DEBIT_ACCOUNT)
            .creditAccount(UPDATED_CREDIT_ACCOUNT)
            .amount(UPDATED_AMOUNT)
            .exportedAt(UPDATED_EXPORTED_AT)
            .exportFormat(UPDATED_EXPORT_FORMAT)
            .exportRef(UPDATED_EXPORT_REF);
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(updatedAccountingEntry);

        restAccountingEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, accountingEntryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(accountingEntryDTO))
            )
            .andExpect(status().isOk());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAccountingEntryToMatchAllProperties(updatedAccountingEntry);
    }

    @Test
    @Transactional
    void putNonExistingAccountingEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountingEntry.setId(longCount.incrementAndGet());

        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAccountingEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, accountingEntryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(accountingEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAccountingEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountingEntry.setId(longCount.incrementAndGet());

        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountingEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(accountingEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAccountingEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountingEntry.setId(longCount.incrementAndGet());

        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountingEntryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAccountingEntryWithPatch() throws Exception {
        // Initialize the database
        insertedAccountingEntry = accountingEntryRepository.saveAndFlush(accountingEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the accountingEntry using partial update
        AccountingEntry partialUpdatedAccountingEntry = new AccountingEntry();
        partialUpdatedAccountingEntry.setId(accountingEntry.getId());

        partialUpdatedAccountingEntry
            .entryDate(UPDATED_ENTRY_DATE)
            .journalRef(UPDATED_JOURNAL_REF)
            .debitAccount(UPDATED_DEBIT_ACCOUNT)
            .exportedAt(UPDATED_EXPORTED_AT)
            .exportFormat(UPDATED_EXPORT_FORMAT)
            .exportRef(UPDATED_EXPORT_REF);

        restAccountingEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAccountingEntry.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAccountingEntry))
            )
            .andExpect(status().isOk());

        // Validate the AccountingEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAccountingEntryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedAccountingEntry, accountingEntry),
            getPersistedAccountingEntry(accountingEntry)
        );
    }

    @Test
    @Transactional
    void fullUpdateAccountingEntryWithPatch() throws Exception {
        // Initialize the database
        insertedAccountingEntry = accountingEntryRepository.saveAndFlush(accountingEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the accountingEntry using partial update
        AccountingEntry partialUpdatedAccountingEntry = new AccountingEntry();
        partialUpdatedAccountingEntry.setId(accountingEntry.getId());

        partialUpdatedAccountingEntry
            .entryDate(UPDATED_ENTRY_DATE)
            .journalRef(UPDATED_JOURNAL_REF)
            .entryType(UPDATED_ENTRY_TYPE)
            .description(UPDATED_DESCRIPTION)
            .debitAccount(UPDATED_DEBIT_ACCOUNT)
            .creditAccount(UPDATED_CREDIT_ACCOUNT)
            .amount(UPDATED_AMOUNT)
            .exportedAt(UPDATED_EXPORTED_AT)
            .exportFormat(UPDATED_EXPORT_FORMAT)
            .exportRef(UPDATED_EXPORT_REF);

        restAccountingEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAccountingEntry.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAccountingEntry))
            )
            .andExpect(status().isOk());

        // Validate the AccountingEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAccountingEntryUpdatableFieldsEquals(
            partialUpdatedAccountingEntry,
            getPersistedAccountingEntry(partialUpdatedAccountingEntry)
        );
    }

    @Test
    @Transactional
    void patchNonExistingAccountingEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountingEntry.setId(longCount.incrementAndGet());

        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAccountingEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, accountingEntryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(accountingEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAccountingEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountingEntry.setId(longCount.incrementAndGet());

        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountingEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(accountingEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAccountingEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountingEntry.setId(longCount.incrementAndGet());

        // Create the AccountingEntry
        AccountingEntryDTO accountingEntryDTO = accountingEntryMapper.toDto(accountingEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountingEntryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(accountingEntryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AccountingEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAccountingEntry() throws Exception {
        // Initialize the database
        insertedAccountingEntry = accountingEntryRepository.saveAndFlush(accountingEntry);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the accountingEntry
        restAccountingEntryMockMvc
            .perform(delete(ENTITY_API_URL_ID, accountingEntry.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return accountingEntryRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected AccountingEntry getPersistedAccountingEntry(AccountingEntry accountingEntry) {
        return accountingEntryRepository.findById(accountingEntry.getId()).orElseThrow();
    }

    protected void assertPersistedAccountingEntryToMatchAllProperties(AccountingEntry expectedAccountingEntry) {
        assertAccountingEntryAllPropertiesEquals(expectedAccountingEntry, getPersistedAccountingEntry(expectedAccountingEntry));
    }

    protected void assertPersistedAccountingEntryToMatchUpdatableProperties(AccountingEntry expectedAccountingEntry) {
        assertAccountingEntryAllUpdatablePropertiesEquals(expectedAccountingEntry, getPersistedAccountingEntry(expectedAccountingEntry));
    }
}
