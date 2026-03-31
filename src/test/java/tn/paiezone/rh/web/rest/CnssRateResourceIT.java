package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.CnssRateAsserts.*;
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
import tn.paiezone.rh.domain.CnssRate;
import tn.paiezone.rh.repository.CnssRateRepository;
import tn.paiezone.rh.service.dto.CnssRateDTO;
import tn.paiezone.rh.service.mapper.CnssRateMapper;

/**
 * Integration tests for the {@link CnssRateResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CnssRateResourceIT {

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;

    private static final BigDecimal DEFAULT_SALARY_CEILING = new BigDecimal(1);
    private static final BigDecimal UPDATED_SALARY_CEILING = new BigDecimal(2);

    private static final BigDecimal DEFAULT_EMPLOYEE_RATE = new BigDecimal(1);
    private static final BigDecimal UPDATED_EMPLOYEE_RATE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_EMPLOYER_RATE = new BigDecimal(1);
    private static final BigDecimal UPDATED_EMPLOYER_RATE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_CAVIS_EMPLOYEE = new BigDecimal(1);
    private static final BigDecimal UPDATED_CAVIS_EMPLOYEE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_CAVIS_EMPLOYER = new BigDecimal(1);
    private static final BigDecimal UPDATED_CAVIS_EMPLOYER = new BigDecimal(2);

    private static final BigDecimal DEFAULT_SMIG = new BigDecimal(1);
    private static final BigDecimal UPDATED_SMIG = new BigDecimal(2);

    private static final LocalDate DEFAULT_EFFECTIVE_FROM = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_EFFECTIVE_FROM = LocalDate.now(ZoneId.systemDefault());

    private static final String ENTITY_API_URL = "/api/cnss-rates";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CnssRateRepository cnssRateRepository;

    @Autowired
    private CnssRateMapper cnssRateMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCnssRateMockMvc;

    private CnssRate cnssRate;

    private CnssRate insertedCnssRate;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CnssRate createEntity() {
        return new CnssRate()
            .year(DEFAULT_YEAR)
            .salaryCeiling(DEFAULT_SALARY_CEILING)
            .employeeRate(DEFAULT_EMPLOYEE_RATE)
            .employerRate(DEFAULT_EMPLOYER_RATE)
            .cavisEmployee(DEFAULT_CAVIS_EMPLOYEE)
            .cavisEmployer(DEFAULT_CAVIS_EMPLOYER)
            .smig(DEFAULT_SMIG)
            .effectiveFrom(DEFAULT_EFFECTIVE_FROM);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CnssRate createUpdatedEntity() {
        return new CnssRate()
            .year(UPDATED_YEAR)
            .salaryCeiling(UPDATED_SALARY_CEILING)
            .employeeRate(UPDATED_EMPLOYEE_RATE)
            .employerRate(UPDATED_EMPLOYER_RATE)
            .cavisEmployee(UPDATED_CAVIS_EMPLOYEE)
            .cavisEmployer(UPDATED_CAVIS_EMPLOYER)
            .smig(UPDATED_SMIG)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM);
    }

    @BeforeEach
    void initTest() {
        cnssRate = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCnssRate != null) {
            cnssRateRepository.delete(insertedCnssRate);
            insertedCnssRate = null;
        }
    }

    @Test
    @Transactional
    void createCnssRate() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);
        var returnedCnssRateDTO = om.readValue(
            restCnssRateMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CnssRateDTO.class
        );

        // Validate the CnssRate in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCnssRate = cnssRateMapper.toEntity(returnedCnssRateDTO);
        assertCnssRateUpdatableFieldsEquals(returnedCnssRate, getPersistedCnssRate(returnedCnssRate));

        insertedCnssRate = returnedCnssRate;
    }

    @Test
    @Transactional
    void createCnssRateWithExistingId() throws Exception {
        // Create the CnssRate with an existing ID
        cnssRate.setId(1L);
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCnssRateMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cnssRate.setYear(null);

        // Create the CnssRate, which fails.
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        restCnssRateMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEmployeeRateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cnssRate.setEmployeeRate(null);

        // Create the CnssRate, which fails.
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        restCnssRateMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEmployerRateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cnssRate.setEmployerRate(null);

        // Create the CnssRate, which fails.
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        restCnssRateMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSmigIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cnssRate.setSmig(null);

        // Create the CnssRate, which fails.
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        restCnssRateMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEffectiveFromIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cnssRate.setEffectiveFrom(null);

        // Create the CnssRate, which fails.
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        restCnssRateMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCnssRates() throws Exception {
        // Initialize the database
        insertedCnssRate = cnssRateRepository.saveAndFlush(cnssRate);

        // Get all the cnssRateList
        restCnssRateMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cnssRate.getId().intValue())))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].salaryCeiling").value(hasItem(sameNumber(DEFAULT_SALARY_CEILING))))
            .andExpect(jsonPath("$.[*].employeeRate").value(hasItem(sameNumber(DEFAULT_EMPLOYEE_RATE))))
            .andExpect(jsonPath("$.[*].employerRate").value(hasItem(sameNumber(DEFAULT_EMPLOYER_RATE))))
            .andExpect(jsonPath("$.[*].cavisEmployee").value(hasItem(sameNumber(DEFAULT_CAVIS_EMPLOYEE))))
            .andExpect(jsonPath("$.[*].cavisEmployer").value(hasItem(sameNumber(DEFAULT_CAVIS_EMPLOYER))))
            .andExpect(jsonPath("$.[*].smig").value(hasItem(sameNumber(DEFAULT_SMIG))))
            .andExpect(jsonPath("$.[*].effectiveFrom").value(hasItem(DEFAULT_EFFECTIVE_FROM.toString())));
    }

    @Test
    @Transactional
    void getCnssRate() throws Exception {
        // Initialize the database
        insertedCnssRate = cnssRateRepository.saveAndFlush(cnssRate);

        // Get the cnssRate
        restCnssRateMockMvc
            .perform(get(ENTITY_API_URL_ID, cnssRate.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(cnssRate.getId().intValue()))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.salaryCeiling").value(sameNumber(DEFAULT_SALARY_CEILING)))
            .andExpect(jsonPath("$.employeeRate").value(sameNumber(DEFAULT_EMPLOYEE_RATE)))
            .andExpect(jsonPath("$.employerRate").value(sameNumber(DEFAULT_EMPLOYER_RATE)))
            .andExpect(jsonPath("$.cavisEmployee").value(sameNumber(DEFAULT_CAVIS_EMPLOYEE)))
            .andExpect(jsonPath("$.cavisEmployer").value(sameNumber(DEFAULT_CAVIS_EMPLOYER)))
            .andExpect(jsonPath("$.smig").value(sameNumber(DEFAULT_SMIG)))
            .andExpect(jsonPath("$.effectiveFrom").value(DEFAULT_EFFECTIVE_FROM.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCnssRate() throws Exception {
        // Get the cnssRate
        restCnssRateMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCnssRate() throws Exception {
        // Initialize the database
        insertedCnssRate = cnssRateRepository.saveAndFlush(cnssRate);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cnssRate
        CnssRate updatedCnssRate = cnssRateRepository.findById(cnssRate.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCnssRate are not directly saved in db
        em.detach(updatedCnssRate);
        updatedCnssRate
            .year(UPDATED_YEAR)
            .salaryCeiling(UPDATED_SALARY_CEILING)
            .employeeRate(UPDATED_EMPLOYEE_RATE)
            .employerRate(UPDATED_EMPLOYER_RATE)
            .cavisEmployee(UPDATED_CAVIS_EMPLOYEE)
            .cavisEmployer(UPDATED_CAVIS_EMPLOYER)
            .smig(UPDATED_SMIG)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM);
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(updatedCnssRate);

        restCnssRateMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cnssRateDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cnssRateDTO))
            )
            .andExpect(status().isOk());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCnssRateToMatchAllProperties(updatedCnssRate);
    }

    @Test
    @Transactional
    void putNonExistingCnssRate() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cnssRate.setId(longCount.incrementAndGet());

        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCnssRateMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cnssRateDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cnssRateDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCnssRate() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cnssRate.setId(longCount.incrementAndGet());

        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCnssRateMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cnssRateDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCnssRate() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cnssRate.setId(longCount.incrementAndGet());

        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCnssRateMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCnssRateWithPatch() throws Exception {
        // Initialize the database
        insertedCnssRate = cnssRateRepository.saveAndFlush(cnssRate);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cnssRate using partial update
        CnssRate partialUpdatedCnssRate = new CnssRate();
        partialUpdatedCnssRate.setId(cnssRate.getId());

        partialUpdatedCnssRate.employeeRate(UPDATED_EMPLOYEE_RATE).cavisEmployer(UPDATED_CAVIS_EMPLOYER).smig(UPDATED_SMIG);

        restCnssRateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCnssRate.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCnssRate))
            )
            .andExpect(status().isOk());

        // Validate the CnssRate in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCnssRateUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedCnssRate, cnssRate), getPersistedCnssRate(cnssRate));
    }

    @Test
    @Transactional
    void fullUpdateCnssRateWithPatch() throws Exception {
        // Initialize the database
        insertedCnssRate = cnssRateRepository.saveAndFlush(cnssRate);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cnssRate using partial update
        CnssRate partialUpdatedCnssRate = new CnssRate();
        partialUpdatedCnssRate.setId(cnssRate.getId());

        partialUpdatedCnssRate
            .year(UPDATED_YEAR)
            .salaryCeiling(UPDATED_SALARY_CEILING)
            .employeeRate(UPDATED_EMPLOYEE_RATE)
            .employerRate(UPDATED_EMPLOYER_RATE)
            .cavisEmployee(UPDATED_CAVIS_EMPLOYEE)
            .cavisEmployer(UPDATED_CAVIS_EMPLOYER)
            .smig(UPDATED_SMIG)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM);

        restCnssRateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCnssRate.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCnssRate))
            )
            .andExpect(status().isOk());

        // Validate the CnssRate in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCnssRateUpdatableFieldsEquals(partialUpdatedCnssRate, getPersistedCnssRate(partialUpdatedCnssRate));
    }

    @Test
    @Transactional
    void patchNonExistingCnssRate() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cnssRate.setId(longCount.incrementAndGet());

        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCnssRateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, cnssRateDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cnssRateDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCnssRate() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cnssRate.setId(longCount.incrementAndGet());

        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCnssRateMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cnssRateDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCnssRate() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cnssRate.setId(longCount.incrementAndGet());

        // Create the CnssRate
        CnssRateDTO cnssRateDTO = cnssRateMapper.toDto(cnssRate);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCnssRateMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(cnssRateDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CnssRate in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCnssRate() throws Exception {
        // Initialize the database
        insertedCnssRate = cnssRateRepository.saveAndFlush(cnssRate);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the cnssRate
        restCnssRateMockMvc
            .perform(delete(ENTITY_API_URL_ID, cnssRate.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return cnssRateRepository.count();
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

    protected CnssRate getPersistedCnssRate(CnssRate cnssRate) {
        return cnssRateRepository.findById(cnssRate.getId()).orElseThrow();
    }

    protected void assertPersistedCnssRateToMatchAllProperties(CnssRate expectedCnssRate) {
        assertCnssRateAllPropertiesEquals(expectedCnssRate, getPersistedCnssRate(expectedCnssRate));
    }

    protected void assertPersistedCnssRateToMatchUpdatableProperties(CnssRate expectedCnssRate) {
        assertCnssRateAllUpdatablePropertiesEquals(expectedCnssRate, getPersistedCnssRate(expectedCnssRate));
    }
}
