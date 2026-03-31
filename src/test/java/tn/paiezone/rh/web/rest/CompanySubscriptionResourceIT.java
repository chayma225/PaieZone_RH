package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.CompanySubscriptionAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.IntegrationTest;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.domain.enumeration.PlanType;
import tn.paiezone.rh.domain.enumeration.SubscriptionStatus;
import tn.paiezone.rh.repository.CompanySubscriptionRepository;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;
import tn.paiezone.rh.service.mapper.CompanySubscriptionMapper;

/**
 * Integration tests for the {@link CompanySubscriptionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CompanySubscriptionResourceIT {

    private static final PlanType DEFAULT_PLAN = PlanType.STARTER;
    private static final PlanType UPDATED_PLAN = PlanType.PME;

    private static final SubscriptionStatus DEFAULT_STATUS = SubscriptionStatus.TRIAL;
    private static final SubscriptionStatus UPDATED_STATUS = SubscriptionStatus.ACTIVE;

    private static final Integer DEFAULT_MAX_EMPLOYEES = 1;
    private static final Integer UPDATED_MAX_EMPLOYEES = 2;

    private static final BigDecimal DEFAULT_PRICE_HT = new BigDecimal(1);
    private static final BigDecimal UPDATED_PRICE_HT = new BigDecimal(2);

    private static final Integer DEFAULT_BILLING_DAY = 1;
    private static final Integer UPDATED_BILLING_DAY = 2;

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_RENEWAL_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_RENEWAL_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/company-subscriptions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CompanySubscriptionRepository companySubscriptionRepository;

    @Autowired
    private CompanySubscriptionMapper companySubscriptionMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCompanySubscriptionMockMvc;

    private CompanySubscription companySubscription;

    private CompanySubscription insertedCompanySubscription;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CompanySubscription createEntity() {
        return new CompanySubscription()
            .plan(DEFAULT_PLAN)
            .status(DEFAULT_STATUS)
            .maxEmployees(DEFAULT_MAX_EMPLOYEES)
            .priceHT(DEFAULT_PRICE_HT)
            .billingDay(DEFAULT_BILLING_DAY)
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE)
            .renewalDate(DEFAULT_RENEWAL_DATE)
            .notes(DEFAULT_NOTES);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CompanySubscription createUpdatedEntity() {
        return new CompanySubscription()
            .plan(UPDATED_PLAN)
            .status(UPDATED_STATUS)
            .maxEmployees(UPDATED_MAX_EMPLOYEES)
            .priceHT(UPDATED_PRICE_HT)
            .billingDay(UPDATED_BILLING_DAY)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .renewalDate(UPDATED_RENEWAL_DATE)
            .notes(UPDATED_NOTES);
    }

    @BeforeEach
    void initTest() {
        companySubscription = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCompanySubscription != null) {
            companySubscriptionRepository.delete(insertedCompanySubscription);
            insertedCompanySubscription = null;
        }
    }

    @Test
    @Transactional
    void createCompanySubscription() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);
        var returnedCompanySubscriptionDTO = om.readValue(
            restCompanySubscriptionMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CompanySubscriptionDTO.class
        );

        // Validate the CompanySubscription in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCompanySubscription = companySubscriptionMapper.toEntity(returnedCompanySubscriptionDTO);
        assertCompanySubscriptionUpdatableFieldsEquals(
            returnedCompanySubscription,
            getPersistedCompanySubscription(returnedCompanySubscription)
        );

        insertedCompanySubscription = returnedCompanySubscription;
    }

    @Test
    @Transactional
    void createCompanySubscriptionWithExistingId() throws Exception {
        // Create the CompanySubscription with an existing ID
        companySubscription.setId(1L);
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPlanIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        companySubscription.setPlan(null);

        // Create the CompanySubscription, which fails.
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        companySubscription.setStatus(null);

        // Create the CompanySubscription, which fails.
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMaxEmployeesIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        companySubscription.setMaxEmployees(null);

        // Create the CompanySubscription, which fails.
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPriceHTIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        companySubscription.setPriceHT(null);

        // Create the CompanySubscription, which fails.
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBillingDayIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        companySubscription.setBillingDay(null);

        // Create the CompanySubscription, which fails.
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStartDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        companySubscription.setStartDate(null);

        // Create the CompanySubscription, which fails.
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        restCompanySubscriptionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCompanySubscriptions() throws Exception {
        // Initialize the database
        insertedCompanySubscription = companySubscriptionRepository.saveAndFlush(companySubscription);

        // Get all the companySubscriptionList
        restCompanySubscriptionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(companySubscription.getId().intValue())))
            .andExpect(jsonPath("$.[*].plan").value(hasItem(DEFAULT_PLAN.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].maxEmployees").value(hasItem(DEFAULT_MAX_EMPLOYEES)))
            .andExpect(jsonPath("$.[*].priceHT").value(hasItem(sameNumber(DEFAULT_PRICE_HT))))
            .andExpect(jsonPath("$.[*].billingDay").value(hasItem(DEFAULT_BILLING_DAY)))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].renewalDate").value(hasItem(DEFAULT_RENEWAL_DATE.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getCompanySubscription() throws Exception {
        // Initialize the database
        insertedCompanySubscription = companySubscriptionRepository.saveAndFlush(companySubscription);

        // Get the companySubscription
        restCompanySubscriptionMockMvc
            .perform(get(ENTITY_API_URL_ID, companySubscription.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(companySubscription.getId().intValue()))
            .andExpect(jsonPath("$.plan").value(DEFAULT_PLAN.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.maxEmployees").value(DEFAULT_MAX_EMPLOYEES))
            .andExpect(jsonPath("$.priceHT").value(sameNumber(DEFAULT_PRICE_HT)))
            .andExpect(jsonPath("$.billingDay").value(DEFAULT_BILLING_DAY))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()))
            .andExpect(jsonPath("$.renewalDate").value(DEFAULT_RENEWAL_DATE.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getNonExistingCompanySubscription() throws Exception {
        // Get the companySubscription
        restCompanySubscriptionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCompanySubscription() throws Exception {
        // Initialize the database
        insertedCompanySubscription = companySubscriptionRepository.saveAndFlush(companySubscription);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the companySubscription
        CompanySubscription updatedCompanySubscription = companySubscriptionRepository.findById(companySubscription.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCompanySubscription are not directly saved in db
        em.detach(updatedCompanySubscription);
        updatedCompanySubscription
            .plan(UPDATED_PLAN)
            .status(UPDATED_STATUS)
            .maxEmployees(UPDATED_MAX_EMPLOYEES)
            .priceHT(UPDATED_PRICE_HT)
            .billingDay(UPDATED_BILLING_DAY)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .renewalDate(UPDATED_RENEWAL_DATE)
            .notes(UPDATED_NOTES);
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(updatedCompanySubscription);

        restCompanySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, companySubscriptionDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(companySubscriptionDTO))
            )
            .andExpect(status().isOk());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCompanySubscriptionToMatchAllProperties(updatedCompanySubscription);
    }

    @Test
    @Transactional
    void putNonExistingCompanySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        companySubscription.setId(longCount.incrementAndGet());

        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCompanySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, companySubscriptionDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(companySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCompanySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        companySubscription.setId(longCount.incrementAndGet());

        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(companySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCompanySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        companySubscription.setId(longCount.incrementAndGet());

        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanySubscriptionMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(companySubscriptionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCompanySubscriptionWithPatch() throws Exception {
        // Initialize the database
        insertedCompanySubscription = companySubscriptionRepository.saveAndFlush(companySubscription);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the companySubscription using partial update
        CompanySubscription partialUpdatedCompanySubscription = new CompanySubscription();
        partialUpdatedCompanySubscription.setId(companySubscription.getId());

        partialUpdatedCompanySubscription
            .status(UPDATED_STATUS)
            .maxEmployees(UPDATED_MAX_EMPLOYEES)
            .startDate(UPDATED_START_DATE)
            .renewalDate(UPDATED_RENEWAL_DATE)
            .notes(UPDATED_NOTES);

        restCompanySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCompanySubscription.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCompanySubscription))
            )
            .andExpect(status().isOk());

        // Validate the CompanySubscription in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCompanySubscriptionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCompanySubscription, companySubscription),
            getPersistedCompanySubscription(companySubscription)
        );
    }

    @Test
    @Transactional
    void fullUpdateCompanySubscriptionWithPatch() throws Exception {
        // Initialize the database
        insertedCompanySubscription = companySubscriptionRepository.saveAndFlush(companySubscription);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the companySubscription using partial update
        CompanySubscription partialUpdatedCompanySubscription = new CompanySubscription();
        partialUpdatedCompanySubscription.setId(companySubscription.getId());

        partialUpdatedCompanySubscription
            .plan(UPDATED_PLAN)
            .status(UPDATED_STATUS)
            .maxEmployees(UPDATED_MAX_EMPLOYEES)
            .priceHT(UPDATED_PRICE_HT)
            .billingDay(UPDATED_BILLING_DAY)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .renewalDate(UPDATED_RENEWAL_DATE)
            .notes(UPDATED_NOTES);

        restCompanySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCompanySubscription.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCompanySubscription))
            )
            .andExpect(status().isOk());

        // Validate the CompanySubscription in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCompanySubscriptionUpdatableFieldsEquals(
            partialUpdatedCompanySubscription,
            getPersistedCompanySubscription(partialUpdatedCompanySubscription)
        );
    }

    @Test
    @Transactional
    void patchNonExistingCompanySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        companySubscription.setId(longCount.incrementAndGet());

        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCompanySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, companySubscriptionDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(companySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCompanySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        companySubscription.setId(longCount.incrementAndGet());

        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(companySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCompanySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        companySubscription.setId(longCount.incrementAndGet());

        // Create the CompanySubscription
        CompanySubscriptionDTO companySubscriptionDTO = companySubscriptionMapper.toDto(companySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCompanySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(companySubscriptionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CompanySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCompanySubscription() throws Exception {
        // Initialize the database
        insertedCompanySubscription = companySubscriptionRepository.saveAndFlush(companySubscription);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the companySubscription
        restCompanySubscriptionMockMvc
            .perform(delete(ENTITY_API_URL_ID, companySubscription.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return companySubscriptionRepository.count();
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

    protected CompanySubscription getPersistedCompanySubscription(CompanySubscription companySubscription) {
        return companySubscriptionRepository.findById(companySubscription.getId()).orElseThrow();
    }

    protected void assertPersistedCompanySubscriptionToMatchAllProperties(CompanySubscription expectedCompanySubscription) {
        assertCompanySubscriptionAllPropertiesEquals(
            expectedCompanySubscription,
            getPersistedCompanySubscription(expectedCompanySubscription)
        );
    }

    protected void assertPersistedCompanySubscriptionToMatchUpdatableProperties(CompanySubscription expectedCompanySubscription) {
        assertCompanySubscriptionAllUpdatablePropertiesEquals(
            expectedCompanySubscription,
            getPersistedCompanySubscription(expectedCompanySubscription)
        );
    }
}
