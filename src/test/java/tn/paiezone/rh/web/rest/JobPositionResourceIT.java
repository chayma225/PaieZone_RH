package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.JobPositionAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.repository.JobPositionRepository;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.service.mapper.JobPositionMapper;

/**
 * Integration tests for the {@link JobPositionResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class JobPositionResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_MIN_SALARY = new BigDecimal(1);
    private static final BigDecimal UPDATED_MIN_SALARY = new BigDecimal(2);

    private static final BigDecimal DEFAULT_MAX_SALARY = new BigDecimal(1);
    private static final BigDecimal UPDATED_MAX_SALARY = new BigDecimal(2);

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/job-positions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private JobPositionRepository jobPositionRepository;

    @Autowired
    private JobPositionMapper jobPositionMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restJobPositionMockMvc;

    private JobPosition jobPosition;

    private JobPosition insertedJobPosition;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static JobPosition createEntity(EntityManager em) {
        JobPosition jobPosition = new JobPosition()
            .code(DEFAULT_CODE)
            .title(DEFAULT_TITLE)
            .description(DEFAULT_DESCRIPTION)
            .minSalary(DEFAULT_MIN_SALARY)
            .maxSalary(DEFAULT_MAX_SALARY)
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
        jobPosition.setCompany(company);
        return jobPosition;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static JobPosition createUpdatedEntity(EntityManager em) {
        JobPosition updatedJobPosition = new JobPosition()
            .code(UPDATED_CODE)
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .minSalary(UPDATED_MIN_SALARY)
            .maxSalary(UPDATED_MAX_SALARY)
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
        updatedJobPosition.setCompany(company);
        return updatedJobPosition;
    }

    @BeforeEach
    void initTest() {
        jobPosition = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedJobPosition != null) {
            jobPositionRepository.delete(insertedJobPosition);
            insertedJobPosition = null;
        }
    }

    @Test
    @Transactional
    void createJobPosition() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);
        var returnedJobPositionDTO = om.readValue(
            restJobPositionMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(jobPositionDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            JobPositionDTO.class
        );

        // Validate the JobPosition in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedJobPosition = jobPositionMapper.toEntity(returnedJobPositionDTO);
        assertJobPositionUpdatableFieldsEquals(returnedJobPosition, getPersistedJobPosition(returnedJobPosition));

        insertedJobPosition = returnedJobPosition;
    }

    @Test
    @Transactional
    void createJobPositionWithExistingId() throws Exception {
        // Create the JobPosition with an existing ID
        jobPosition.setId(1L);
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restJobPositionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(jobPositionDTO)))
            .andExpect(status().isBadRequest());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        jobPosition.setCode(null);

        // Create the JobPosition, which fails.
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        restJobPositionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(jobPositionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        jobPosition.setTitle(null);

        // Create the JobPosition, which fails.
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        restJobPositionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(jobPositionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        jobPosition.setActive(null);

        // Create the JobPosition, which fails.
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        restJobPositionMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(jobPositionDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllJobPositions() throws Exception {
        // Initialize the database
        insertedJobPosition = jobPositionRepository.saveAndFlush(jobPosition);

        // Get all the jobPositionList
        restJobPositionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(jobPosition.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].minSalary").value(hasItem(sameNumber(DEFAULT_MIN_SALARY))))
            .andExpect(jsonPath("$.[*].maxSalary").value(hasItem(sameNumber(DEFAULT_MAX_SALARY))))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getJobPosition() throws Exception {
        // Initialize the database
        insertedJobPosition = jobPositionRepository.saveAndFlush(jobPosition);

        // Get the jobPosition
        restJobPositionMockMvc
            .perform(get(ENTITY_API_URL_ID, jobPosition.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(jobPosition.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.minSalary").value(sameNumber(DEFAULT_MIN_SALARY)))
            .andExpect(jsonPath("$.maxSalary").value(sameNumber(DEFAULT_MAX_SALARY)))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingJobPosition() throws Exception {
        // Get the jobPosition
        restJobPositionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingJobPosition() throws Exception {
        // Initialize the database
        insertedJobPosition = jobPositionRepository.saveAndFlush(jobPosition);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the jobPosition
        JobPosition updatedJobPosition = jobPositionRepository.findById(jobPosition.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedJobPosition are not directly saved in db
        em.detach(updatedJobPosition);
        updatedJobPosition
            .code(UPDATED_CODE)
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .minSalary(UPDATED_MIN_SALARY)
            .maxSalary(UPDATED_MAX_SALARY)
            .active(UPDATED_ACTIVE);
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(updatedJobPosition);

        restJobPositionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, jobPositionDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(jobPositionDTO))
            )
            .andExpect(status().isOk());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedJobPositionToMatchAllProperties(updatedJobPosition);
    }

    @Test
    @Transactional
    void putNonExistingJobPosition() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        jobPosition.setId(longCount.incrementAndGet());

        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restJobPositionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, jobPositionDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(jobPositionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchJobPosition() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        jobPosition.setId(longCount.incrementAndGet());

        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restJobPositionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(jobPositionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamJobPosition() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        jobPosition.setId(longCount.incrementAndGet());

        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restJobPositionMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(jobPositionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateJobPositionWithPatch() throws Exception {
        // Initialize the database
        insertedJobPosition = jobPositionRepository.saveAndFlush(jobPosition);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the jobPosition using partial update
        JobPosition partialUpdatedJobPosition = new JobPosition();
        partialUpdatedJobPosition.setId(jobPosition.getId());

        partialUpdatedJobPosition.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).maxSalary(UPDATED_MAX_SALARY);

        restJobPositionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedJobPosition.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedJobPosition))
            )
            .andExpect(status().isOk());

        // Validate the JobPosition in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertJobPositionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedJobPosition, jobPosition),
            getPersistedJobPosition(jobPosition)
        );
    }

    @Test
    @Transactional
    void fullUpdateJobPositionWithPatch() throws Exception {
        // Initialize the database
        insertedJobPosition = jobPositionRepository.saveAndFlush(jobPosition);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the jobPosition using partial update
        JobPosition partialUpdatedJobPosition = new JobPosition();
        partialUpdatedJobPosition.setId(jobPosition.getId());

        partialUpdatedJobPosition
            .code(UPDATED_CODE)
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .minSalary(UPDATED_MIN_SALARY)
            .maxSalary(UPDATED_MAX_SALARY)
            .active(UPDATED_ACTIVE);

        restJobPositionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedJobPosition.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedJobPosition))
            )
            .andExpect(status().isOk());

        // Validate the JobPosition in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertJobPositionUpdatableFieldsEquals(partialUpdatedJobPosition, getPersistedJobPosition(partialUpdatedJobPosition));
    }

    @Test
    @Transactional
    void patchNonExistingJobPosition() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        jobPosition.setId(longCount.incrementAndGet());

        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restJobPositionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, jobPositionDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(jobPositionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchJobPosition() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        jobPosition.setId(longCount.incrementAndGet());

        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restJobPositionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(jobPositionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamJobPosition() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        jobPosition.setId(longCount.incrementAndGet());

        // Create the JobPosition
        JobPositionDTO jobPositionDTO = jobPositionMapper.toDto(jobPosition);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restJobPositionMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(jobPositionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the JobPosition in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteJobPosition() throws Exception {
        // Initialize the database
        insertedJobPosition = jobPositionRepository.saveAndFlush(jobPosition);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the jobPosition
        restJobPositionMockMvc
            .perform(delete(ENTITY_API_URL_ID, jobPosition.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return jobPositionRepository.count();
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

    protected JobPosition getPersistedJobPosition(JobPosition jobPosition) {
        return jobPositionRepository.findById(jobPosition.getId()).orElseThrow();
    }

    protected void assertPersistedJobPositionToMatchAllProperties(JobPosition expectedJobPosition) {
        assertJobPositionAllPropertiesEquals(expectedJobPosition, getPersistedJobPosition(expectedJobPosition));
    }

    protected void assertPersistedJobPositionToMatchUpdatableProperties(JobPosition expectedJobPosition) {
        assertJobPositionAllUpdatablePropertiesEquals(expectedJobPosition, getPersistedJobPosition(expectedJobPosition));
    }
}
