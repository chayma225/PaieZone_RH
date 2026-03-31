package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.PayrollPeriodAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;
import tn.paiezone.rh.service.mapper.PayrollPeriodMapper;

/**
 * Integration tests for the {@link PayrollPeriodResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PayrollPeriodResourceIT {

    private static final Integer DEFAULT_MONTH = 1;
    private static final Integer UPDATED_MONTH = 2;

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;

    private static final PayrollStatus DEFAULT_STATUS = PayrollStatus.DRAFT;
    private static final PayrollStatus UPDATED_STATUS = PayrollStatus.CALCULATED;

    private static final Instant DEFAULT_CALCULATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CALCULATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_VALIDATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_VALIDATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_LOCKED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_LOCKED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/payroll-periods";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PayrollPeriodRepository payrollPeriodRepository;

    @Autowired
    private PayrollPeriodMapper payrollPeriodMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPayrollPeriodMockMvc;

    private PayrollPeriod payrollPeriod;

    private PayrollPeriod insertedPayrollPeriod;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PayrollPeriod createEntity(EntityManager em) {
        PayrollPeriod payrollPeriod = new PayrollPeriod()
            .month(DEFAULT_MONTH)
            .year(DEFAULT_YEAR)
            .status(DEFAULT_STATUS)
            .calculatedAt(DEFAULT_CALCULATED_AT)
            .validatedAt(DEFAULT_VALIDATED_AT)
            .lockedAt(DEFAULT_LOCKED_AT)
            .notes(DEFAULT_NOTES);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        payrollPeriod.setCompany(company);
        return payrollPeriod;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PayrollPeriod createUpdatedEntity(EntityManager em) {
        PayrollPeriod updatedPayrollPeriod = new PayrollPeriod()
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .status(UPDATED_STATUS)
            .calculatedAt(UPDATED_CALCULATED_AT)
            .validatedAt(UPDATED_VALIDATED_AT)
            .lockedAt(UPDATED_LOCKED_AT)
            .notes(UPDATED_NOTES);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createUpdatedEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        updatedPayrollPeriod.setCompany(company);
        return updatedPayrollPeriod;
    }

    @BeforeEach
    void initTest() {
        payrollPeriod = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedPayrollPeriod != null) {
            payrollPeriodRepository.delete(insertedPayrollPeriod);
            insertedPayrollPeriod = null;
        }
    }

    @Test
    @Transactional
    void createPayrollPeriod() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);
        var returnedPayrollPeriodDTO = om.readValue(
            restPayrollPeriodMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(payrollPeriodDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PayrollPeriodDTO.class
        );

        // Validate the PayrollPeriod in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPayrollPeriod = payrollPeriodMapper.toEntity(returnedPayrollPeriodDTO);
        assertPayrollPeriodUpdatableFieldsEquals(returnedPayrollPeriod, getPersistedPayrollPeriod(returnedPayrollPeriod));

        insertedPayrollPeriod = returnedPayrollPeriod;
    }

    @Test
    @Transactional
    void createPayrollPeriodWithExistingId() throws Exception {
        // Create the PayrollPeriod with an existing ID
        payrollPeriod.setId(1L);
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPayrollPeriodMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(payrollPeriodDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkMonthIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        payrollPeriod.setMonth(null);

        // Create the PayrollPeriod, which fails.
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        restPayrollPeriodMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(payrollPeriodDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        payrollPeriod.setYear(null);

        // Create the PayrollPeriod, which fails.
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        restPayrollPeriodMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(payrollPeriodDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        payrollPeriod.setStatus(null);

        // Create the PayrollPeriod, which fails.
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        restPayrollPeriodMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(payrollPeriodDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPayrollPeriods() throws Exception {
        // Initialize the database
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        // Get all the payrollPeriodList
        restPayrollPeriodMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(payrollPeriod.getId().intValue())))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].calculatedAt").value(hasItem(DEFAULT_CALCULATED_AT.toString())))
            .andExpect(jsonPath("$.[*].validatedAt").value(hasItem(DEFAULT_VALIDATED_AT.toString())))
            .andExpect(jsonPath("$.[*].lockedAt").value(hasItem(DEFAULT_LOCKED_AT.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getPayrollPeriod() throws Exception {
        // Initialize the database
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        // Get the payrollPeriod
        restPayrollPeriodMockMvc
            .perform(get(ENTITY_API_URL_ID, payrollPeriod.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(payrollPeriod.getId().intValue()))
            .andExpect(jsonPath("$.month").value(DEFAULT_MONTH))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.calculatedAt").value(DEFAULT_CALCULATED_AT.toString()))
            .andExpect(jsonPath("$.validatedAt").value(DEFAULT_VALIDATED_AT.toString()))
            .andExpect(jsonPath("$.lockedAt").value(DEFAULT_LOCKED_AT.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getNonExistingPayrollPeriod() throws Exception {
        // Get the payrollPeriod
        restPayrollPeriodMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPayrollPeriod() throws Exception {
        // Initialize the database
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the payrollPeriod
        PayrollPeriod updatedPayrollPeriod = payrollPeriodRepository.findById(payrollPeriod.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPayrollPeriod are not directly saved in db
        em.detach(updatedPayrollPeriod);
        updatedPayrollPeriod
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .status(UPDATED_STATUS)
            .calculatedAt(UPDATED_CALCULATED_AT)
            .validatedAt(UPDATED_VALIDATED_AT)
            .lockedAt(UPDATED_LOCKED_AT)
            .notes(UPDATED_NOTES);
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(updatedPayrollPeriod);

        restPayrollPeriodMockMvc
            .perform(
                put(ENTITY_API_URL_ID, payrollPeriodDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(payrollPeriodDTO))
            )
            .andExpect(status().isOk());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPayrollPeriodToMatchAllProperties(updatedPayrollPeriod);
    }

    @Test
    @Transactional
    void putNonExistingPayrollPeriod() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        payrollPeriod.setId(longCount.incrementAndGet());

        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPayrollPeriodMockMvc
            .perform(
                put(ENTITY_API_URL_ID, payrollPeriodDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(payrollPeriodDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPayrollPeriod() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        payrollPeriod.setId(longCount.incrementAndGet());

        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPayrollPeriodMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(payrollPeriodDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPayrollPeriod() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        payrollPeriod.setId(longCount.incrementAndGet());

        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPayrollPeriodMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(payrollPeriodDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePayrollPeriodWithPatch() throws Exception {
        // Initialize the database
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the payrollPeriod using partial update
        PayrollPeriod partialUpdatedPayrollPeriod = new PayrollPeriod();
        partialUpdatedPayrollPeriod.setId(payrollPeriod.getId());

        partialUpdatedPayrollPeriod.month(UPDATED_MONTH).calculatedAt(UPDATED_CALCULATED_AT).notes(UPDATED_NOTES);

        restPayrollPeriodMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPayrollPeriod.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPayrollPeriod))
            )
            .andExpect(status().isOk());

        // Validate the PayrollPeriod in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPayrollPeriodUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPayrollPeriod, payrollPeriod),
            getPersistedPayrollPeriod(payrollPeriod)
        );
    }

    @Test
    @Transactional
    void fullUpdatePayrollPeriodWithPatch() throws Exception {
        // Initialize the database
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the payrollPeriod using partial update
        PayrollPeriod partialUpdatedPayrollPeriod = new PayrollPeriod();
        partialUpdatedPayrollPeriod.setId(payrollPeriod.getId());

        partialUpdatedPayrollPeriod
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .status(UPDATED_STATUS)
            .calculatedAt(UPDATED_CALCULATED_AT)
            .validatedAt(UPDATED_VALIDATED_AT)
            .lockedAt(UPDATED_LOCKED_AT)
            .notes(UPDATED_NOTES);

        restPayrollPeriodMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPayrollPeriod.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPayrollPeriod))
            )
            .andExpect(status().isOk());

        // Validate the PayrollPeriod in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPayrollPeriodUpdatableFieldsEquals(partialUpdatedPayrollPeriod, getPersistedPayrollPeriod(partialUpdatedPayrollPeriod));
    }

    @Test
    @Transactional
    void patchNonExistingPayrollPeriod() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        payrollPeriod.setId(longCount.incrementAndGet());

        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPayrollPeriodMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, payrollPeriodDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(payrollPeriodDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPayrollPeriod() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        payrollPeriod.setId(longCount.incrementAndGet());

        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPayrollPeriodMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(payrollPeriodDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPayrollPeriod() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        payrollPeriod.setId(longCount.incrementAndGet());

        // Create the PayrollPeriod
        PayrollPeriodDTO payrollPeriodDTO = payrollPeriodMapper.toDto(payrollPeriod);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPayrollPeriodMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(payrollPeriodDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PayrollPeriod in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePayrollPeriod() throws Exception {
        // Initialize the database
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the payrollPeriod
        restPayrollPeriodMockMvc
            .perform(delete(ENTITY_API_URL_ID, payrollPeriod.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return payrollPeriodRepository.count();
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

    protected PayrollPeriod getPersistedPayrollPeriod(PayrollPeriod payrollPeriod) {
        return payrollPeriodRepository.findById(payrollPeriod.getId()).orElseThrow();
    }

    protected void assertPersistedPayrollPeriodToMatchAllProperties(PayrollPeriod expectedPayrollPeriod) {
        assertPayrollPeriodAllPropertiesEquals(expectedPayrollPeriod, getPersistedPayrollPeriod(expectedPayrollPeriod));
    }

    protected void assertPersistedPayrollPeriodToMatchUpdatableProperties(PayrollPeriod expectedPayrollPeriod) {
        assertPayrollPeriodAllUpdatablePropertiesEquals(expectedPayrollPeriod, getPersistedPayrollPeriod(expectedPayrollPeriod));
    }
}
