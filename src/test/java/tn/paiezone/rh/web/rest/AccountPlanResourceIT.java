package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.AccountPlanAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
import tn.paiezone.rh.domain.AccountPlan;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.repository.AccountPlanRepository;
import tn.paiezone.rh.service.dto.AccountPlanDTO;
import tn.paiezone.rh.service.mapper.AccountPlanMapper;

/**
 * Integration tests for the {@link AccountPlanResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AccountPlanResourceIT {

    private static final String DEFAULT_ACCOUNT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_ACCOUNT_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_ACCOUNT_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_ACCOUNT_LABEL = "BBBBBBBBBB";

    private static final String DEFAULT_ACCOUNT_LABEL_AR = "AAAAAAAAAA";
    private static final String UPDATED_ACCOUNT_LABEL_AR = "BBBBBBBBBB";

    private static final String DEFAULT_ACCOUNT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_ACCOUNT_TYPE = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/account-plans";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AccountPlanRepository accountPlanRepository;

    @Autowired
    private AccountPlanMapper accountPlanMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAccountPlanMockMvc;

    private AccountPlan accountPlan;

    private AccountPlan insertedAccountPlan;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AccountPlan createEntity(EntityManager em) {
        AccountPlan accountPlan = new AccountPlan()
            .accountCode(DEFAULT_ACCOUNT_CODE)
            .accountLabel(DEFAULT_ACCOUNT_LABEL)
            .accountLabelAr(DEFAULT_ACCOUNT_LABEL_AR)
            .accountType(DEFAULT_ACCOUNT_TYPE)
            .active(DEFAULT_ACTIVE);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        accountPlan.setCompany(company);
        return accountPlan;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AccountPlan createUpdatedEntity(EntityManager em) {
        AccountPlan updatedAccountPlan = new AccountPlan()
            .accountCode(UPDATED_ACCOUNT_CODE)
            .accountLabel(UPDATED_ACCOUNT_LABEL)
            .accountLabelAr(UPDATED_ACCOUNT_LABEL_AR)
            .accountType(UPDATED_ACCOUNT_TYPE)
            .active(UPDATED_ACTIVE);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createUpdatedEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        updatedAccountPlan.setCompany(company);
        return updatedAccountPlan;
    }

    @BeforeEach
    void initTest() {
        accountPlan = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedAccountPlan != null) {
            accountPlanRepository.delete(insertedAccountPlan);
            insertedAccountPlan = null;
        }
    }

    @Test
    @Transactional
    void createAccountPlan() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);
        var returnedAccountPlanDTO = om.readValue(
            restAccountPlanMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountPlanDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AccountPlanDTO.class
        );

        // Validate the AccountPlan in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAccountPlan = accountPlanMapper.toEntity(returnedAccountPlanDTO);
        assertAccountPlanUpdatableFieldsEquals(returnedAccountPlan, getPersistedAccountPlan(returnedAccountPlan));

        insertedAccountPlan = returnedAccountPlan;
    }

    @Test
    @Transactional
    void createAccountPlanWithExistingId() throws Exception {
        // Create the AccountPlan with an existing ID
        accountPlan.setId(1L);
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAccountPlanMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountPlanDTO)))
            .andExpect(status().isBadRequest());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkAccountCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountPlan.setAccountCode(null);

        // Create the AccountPlan, which fails.
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        restAccountPlanMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountPlanDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAccountLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountPlan.setAccountLabel(null);

        // Create the AccountPlan, which fails.
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        restAccountPlanMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountPlanDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        accountPlan.setActive(null);

        // Create the AccountPlan, which fails.
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        restAccountPlanMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountPlanDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAccountPlans() throws Exception {
        // Initialize the database
        insertedAccountPlan = accountPlanRepository.saveAndFlush(accountPlan);

        // Get all the accountPlanList
        restAccountPlanMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(accountPlan.getId().intValue())))
            .andExpect(jsonPath("$.[*].accountCode").value(hasItem(DEFAULT_ACCOUNT_CODE)))
            .andExpect(jsonPath("$.[*].accountLabel").value(hasItem(DEFAULT_ACCOUNT_LABEL)))
            .andExpect(jsonPath("$.[*].accountLabelAr").value(hasItem(DEFAULT_ACCOUNT_LABEL_AR)))
            .andExpect(jsonPath("$.[*].accountType").value(hasItem(DEFAULT_ACCOUNT_TYPE)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getAccountPlan() throws Exception {
        // Initialize the database
        insertedAccountPlan = accountPlanRepository.saveAndFlush(accountPlan);

        // Get the accountPlan
        restAccountPlanMockMvc
            .perform(get(ENTITY_API_URL_ID, accountPlan.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(accountPlan.getId().intValue()))
            .andExpect(jsonPath("$.accountCode").value(DEFAULT_ACCOUNT_CODE))
            .andExpect(jsonPath("$.accountLabel").value(DEFAULT_ACCOUNT_LABEL))
            .andExpect(jsonPath("$.accountLabelAr").value(DEFAULT_ACCOUNT_LABEL_AR))
            .andExpect(jsonPath("$.accountType").value(DEFAULT_ACCOUNT_TYPE))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingAccountPlan() throws Exception {
        // Get the accountPlan
        restAccountPlanMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAccountPlan() throws Exception {
        // Initialize the database
        insertedAccountPlan = accountPlanRepository.saveAndFlush(accountPlan);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the accountPlan
        AccountPlan updatedAccountPlan = accountPlanRepository.findById(accountPlan.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAccountPlan are not directly saved in db
        em.detach(updatedAccountPlan);
        updatedAccountPlan
            .accountCode(UPDATED_ACCOUNT_CODE)
            .accountLabel(UPDATED_ACCOUNT_LABEL)
            .accountLabelAr(UPDATED_ACCOUNT_LABEL_AR)
            .accountType(UPDATED_ACCOUNT_TYPE)
            .active(UPDATED_ACTIVE);
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(updatedAccountPlan);

        restAccountPlanMockMvc
            .perform(
                put(ENTITY_API_URL_ID, accountPlanDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(accountPlanDTO))
            )
            .andExpect(status().isOk());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAccountPlanToMatchAllProperties(updatedAccountPlan);
    }

    @Test
    @Transactional
    void putNonExistingAccountPlan() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountPlan.setId(longCount.incrementAndGet());

        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAccountPlanMockMvc
            .perform(
                put(ENTITY_API_URL_ID, accountPlanDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(accountPlanDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAccountPlan() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountPlan.setId(longCount.incrementAndGet());

        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountPlanMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(accountPlanDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAccountPlan() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountPlan.setId(longCount.incrementAndGet());

        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountPlanMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(accountPlanDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAccountPlanWithPatch() throws Exception {
        // Initialize the database
        insertedAccountPlan = accountPlanRepository.saveAndFlush(accountPlan);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the accountPlan using partial update
        AccountPlan partialUpdatedAccountPlan = new AccountPlan();
        partialUpdatedAccountPlan.setId(accountPlan.getId());

        partialUpdatedAccountPlan.accountCode(UPDATED_ACCOUNT_CODE).accountLabel(UPDATED_ACCOUNT_LABEL).active(UPDATED_ACTIVE);

        restAccountPlanMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAccountPlan.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAccountPlan))
            )
            .andExpect(status().isOk());

        // Validate the AccountPlan in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAccountPlanUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedAccountPlan, accountPlan),
            getPersistedAccountPlan(accountPlan)
        );
    }

    @Test
    @Transactional
    void fullUpdateAccountPlanWithPatch() throws Exception {
        // Initialize the database
        insertedAccountPlan = accountPlanRepository.saveAndFlush(accountPlan);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the accountPlan using partial update
        AccountPlan partialUpdatedAccountPlan = new AccountPlan();
        partialUpdatedAccountPlan.setId(accountPlan.getId());

        partialUpdatedAccountPlan
            .accountCode(UPDATED_ACCOUNT_CODE)
            .accountLabel(UPDATED_ACCOUNT_LABEL)
            .accountLabelAr(UPDATED_ACCOUNT_LABEL_AR)
            .accountType(UPDATED_ACCOUNT_TYPE)
            .active(UPDATED_ACTIVE);

        restAccountPlanMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAccountPlan.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAccountPlan))
            )
            .andExpect(status().isOk());

        // Validate the AccountPlan in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAccountPlanUpdatableFieldsEquals(partialUpdatedAccountPlan, getPersistedAccountPlan(partialUpdatedAccountPlan));
    }

    @Test
    @Transactional
    void patchNonExistingAccountPlan() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountPlan.setId(longCount.incrementAndGet());

        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAccountPlanMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, accountPlanDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(accountPlanDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAccountPlan() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountPlan.setId(longCount.incrementAndGet());

        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountPlanMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(accountPlanDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAccountPlan() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        accountPlan.setId(longCount.incrementAndGet());

        // Create the AccountPlan
        AccountPlanDTO accountPlanDTO = accountPlanMapper.toDto(accountPlan);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAccountPlanMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(accountPlanDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the AccountPlan in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAccountPlan() throws Exception {
        // Initialize the database
        insertedAccountPlan = accountPlanRepository.saveAndFlush(accountPlan);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the accountPlan
        restAccountPlanMockMvc
            .perform(delete(ENTITY_API_URL_ID, accountPlan.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return accountPlanRepository.count();
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

    protected AccountPlan getPersistedAccountPlan(AccountPlan accountPlan) {
        return accountPlanRepository.findById(accountPlan.getId()).orElseThrow();
    }

    protected void assertPersistedAccountPlanToMatchAllProperties(AccountPlan expectedAccountPlan) {
        assertAccountPlanAllPropertiesEquals(expectedAccountPlan, getPersistedAccountPlan(expectedAccountPlan));
    }

    protected void assertPersistedAccountPlanToMatchUpdatableProperties(AccountPlan expectedAccountPlan) {
        assertAccountPlanAllUpdatablePropertiesEquals(expectedAccountPlan, getPersistedAccountPlan(expectedAccountPlan));
    }
}
