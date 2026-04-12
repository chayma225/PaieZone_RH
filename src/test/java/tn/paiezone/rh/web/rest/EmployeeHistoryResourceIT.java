package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.EmployeeHistoryAsserts.*;
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
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.IntegrationTest;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.EmployeeHistory;
import tn.paiezone.rh.repository.EmployeeHistoryRepository;
import tn.paiezone.rh.service.dto.EmployeeHistoryDTO;
import tn.paiezone.rh.service.mapper.EmployeeHistoryMapper;

/**
 * Integration tests for the {@link EmployeeHistoryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class EmployeeHistoryResourceIT {

    private static final String DEFAULT_FIELD_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FIELD_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_OLD_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_OLD_VALUE = "BBBBBBBBBB";

    private static final String DEFAULT_NEW_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_NEW_VALUE = "BBBBBBBBBB";

    private static final Instant DEFAULT_CHANGED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CHANGED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_CHANGED_BY = "AAAAAAAAAA";
    private static final String UPDATED_CHANGED_BY = "BBBBBBBBBB";

    private static final String DEFAULT_REASON = "AAAAAAAAAA";
    private static final String UPDATED_REASON = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/employee-histories";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private EmployeeHistoryRepository employeeHistoryRepository;

    @Autowired
    private EmployeeHistoryMapper employeeHistoryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEmployeeHistoryMockMvc;

    private EmployeeHistory employeeHistory;

    private EmployeeHistory insertedEmployeeHistory;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EmployeeHistory createEntity(EntityManager em) {
        EmployeeHistory employeeHistory = new EmployeeHistory()
            .fieldName(DEFAULT_FIELD_NAME)
            .oldValue(DEFAULT_OLD_VALUE)
            .newValue(DEFAULT_NEW_VALUE)
            .changedAt(DEFAULT_CHANGED_AT)
            .changedBy(DEFAULT_CHANGED_BY)
            .reason(DEFAULT_REASON);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        employeeHistory.setEmployee(employee);
        return employeeHistory;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EmployeeHistory createUpdatedEntity(EntityManager em) {
        EmployeeHistory updatedEmployeeHistory = new EmployeeHistory()
            .fieldName(UPDATED_FIELD_NAME)
            .oldValue(UPDATED_OLD_VALUE)
            .newValue(UPDATED_NEW_VALUE)
            .changedAt(UPDATED_CHANGED_AT)
            .changedBy(UPDATED_CHANGED_BY)
            .reason(UPDATED_REASON);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedEmployeeHistory.setEmployee(employee);
        return updatedEmployeeHistory;
    }

    @BeforeEach
    void initTest() {
        employeeHistory = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedEmployeeHistory != null) {
            employeeHistoryRepository.delete(insertedEmployeeHistory);
            insertedEmployeeHistory = null;
        }
    }

    @Test
    @Transactional
    void createEmployeeHistory() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);
        var returnedEmployeeHistoryDTO = om.readValue(
            restEmployeeHistoryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeHistoryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            EmployeeHistoryDTO.class
        );

        // Validate the EmployeeHistory in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedEmployeeHistory = employeeHistoryMapper.toEntity(returnedEmployeeHistoryDTO);
        assertEmployeeHistoryUpdatableFieldsEquals(returnedEmployeeHistory, getPersistedEmployeeHistory(returnedEmployeeHistory));

        insertedEmployeeHistory = returnedEmployeeHistory;
    }

    @Test
    @Transactional
    void createEmployeeHistoryWithExistingId() throws Exception {
        // Create the EmployeeHistory with an existing ID
        employeeHistory.setId(1L);
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEmployeeHistoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeHistoryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkFieldNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employeeHistory.setFieldName(null);

        // Create the EmployeeHistory, which fails.
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        restEmployeeHistoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeHistoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkChangedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employeeHistory.setChangedAt(null);

        // Create the EmployeeHistory, which fails.
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        restEmployeeHistoryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeHistoryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEmployeeHistories() throws Exception {
        // Initialize the database
        insertedEmployeeHistory = employeeHistoryRepository.saveAndFlush(employeeHistory);

        // Get all the employeeHistoryList
        restEmployeeHistoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(employeeHistory.getId().intValue())))
            .andExpect(jsonPath("$.[*].fieldName").value(hasItem(DEFAULT_FIELD_NAME)))
            .andExpect(jsonPath("$.[*].oldValue").value(hasItem(DEFAULT_OLD_VALUE)))
            .andExpect(jsonPath("$.[*].newValue").value(hasItem(DEFAULT_NEW_VALUE)))
            .andExpect(jsonPath("$.[*].changedAt").value(hasItem(DEFAULT_CHANGED_AT.toString())))
            .andExpect(jsonPath("$.[*].changedBy").value(hasItem(DEFAULT_CHANGED_BY)))
            .andExpect(jsonPath("$.[*].reason").value(hasItem(DEFAULT_REASON)));
    }

    @Test
    @Transactional
    void getEmployeeHistory() throws Exception {
        // Initialize the database
        insertedEmployeeHistory = employeeHistoryRepository.saveAndFlush(employeeHistory);

        // Get the employeeHistory
        restEmployeeHistoryMockMvc
            .perform(get(ENTITY_API_URL_ID, employeeHistory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(employeeHistory.getId().intValue()))
            .andExpect(jsonPath("$.fieldName").value(DEFAULT_FIELD_NAME))
            .andExpect(jsonPath("$.oldValue").value(DEFAULT_OLD_VALUE))
            .andExpect(jsonPath("$.newValue").value(DEFAULT_NEW_VALUE))
            .andExpect(jsonPath("$.changedAt").value(DEFAULT_CHANGED_AT.toString()))
            .andExpect(jsonPath("$.changedBy").value(DEFAULT_CHANGED_BY))
            .andExpect(jsonPath("$.reason").value(DEFAULT_REASON));
    }

    @Test
    @Transactional
    void getNonExistingEmployeeHistory() throws Exception {
        // Get the employeeHistory
        restEmployeeHistoryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingEmployeeHistory() throws Exception {
        // Initialize the database
        insertedEmployeeHistory = employeeHistoryRepository.saveAndFlush(employeeHistory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the employeeHistory
        EmployeeHistory updatedEmployeeHistory = employeeHistoryRepository.findById(employeeHistory.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedEmployeeHistory are not directly saved in db
        em.detach(updatedEmployeeHistory);
        updatedEmployeeHistory
            .fieldName(UPDATED_FIELD_NAME)
            .oldValue(UPDATED_OLD_VALUE)
            .newValue(UPDATED_NEW_VALUE)
            .changedAt(UPDATED_CHANGED_AT)
            .changedBy(UPDATED_CHANGED_BY)
            .reason(UPDATED_REASON);
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(updatedEmployeeHistory);

        restEmployeeHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, employeeHistoryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(employeeHistoryDTO))
            )
            .andExpect(status().isOk());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedEmployeeHistoryToMatchAllProperties(updatedEmployeeHistory);
    }

    @Test
    @Transactional
    void putNonExistingEmployeeHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employeeHistory.setId(longCount.incrementAndGet());

        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEmployeeHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, employeeHistoryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(employeeHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEmployeeHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employeeHistory.setId(longCount.incrementAndGet());

        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeHistoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(employeeHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEmployeeHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employeeHistory.setId(longCount.incrementAndGet());

        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeHistoryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeHistoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEmployeeHistoryWithPatch() throws Exception {
        // Initialize the database
        insertedEmployeeHistory = employeeHistoryRepository.saveAndFlush(employeeHistory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the employeeHistory using partial update
        EmployeeHistory partialUpdatedEmployeeHistory = new EmployeeHistory();
        partialUpdatedEmployeeHistory.setId(employeeHistory.getId());

        partialUpdatedEmployeeHistory
            .oldValue(UPDATED_OLD_VALUE)
            .newValue(UPDATED_NEW_VALUE)
            .changedBy(UPDATED_CHANGED_BY)
            .reason(UPDATED_REASON);

        restEmployeeHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEmployeeHistory.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEmployeeHistory))
            )
            .andExpect(status().isOk());

        // Validate the EmployeeHistory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEmployeeHistoryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedEmployeeHistory, employeeHistory),
            getPersistedEmployeeHistory(employeeHistory)
        );
    }

    @Test
    @Transactional
    void fullUpdateEmployeeHistoryWithPatch() throws Exception {
        // Initialize the database
        insertedEmployeeHistory = employeeHistoryRepository.saveAndFlush(employeeHistory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the employeeHistory using partial update
        EmployeeHistory partialUpdatedEmployeeHistory = new EmployeeHistory();
        partialUpdatedEmployeeHistory.setId(employeeHistory.getId());

        partialUpdatedEmployeeHistory
            .fieldName(UPDATED_FIELD_NAME)
            .oldValue(UPDATED_OLD_VALUE)
            .newValue(UPDATED_NEW_VALUE)
            .changedAt(UPDATED_CHANGED_AT)
            .changedBy(UPDATED_CHANGED_BY)
            .reason(UPDATED_REASON);

        restEmployeeHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEmployeeHistory.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEmployeeHistory))
            )
            .andExpect(status().isOk());

        // Validate the EmployeeHistory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEmployeeHistoryUpdatableFieldsEquals(
            partialUpdatedEmployeeHistory,
            getPersistedEmployeeHistory(partialUpdatedEmployeeHistory)
        );
    }

    @Test
    @Transactional
    void patchNonExistingEmployeeHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employeeHistory.setId(longCount.incrementAndGet());

        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEmployeeHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, employeeHistoryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(employeeHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEmployeeHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employeeHistory.setId(longCount.incrementAndGet());

        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeHistoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(employeeHistoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEmployeeHistory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employeeHistory.setId(longCount.incrementAndGet());

        // Create the EmployeeHistory
        EmployeeHistoryDTO employeeHistoryDTO = employeeHistoryMapper.toDto(employeeHistory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeHistoryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(employeeHistoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the EmployeeHistory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEmployeeHistory() throws Exception {
        // Initialize the database
        insertedEmployeeHistory = employeeHistoryRepository.saveAndFlush(employeeHistory);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the employeeHistory
        restEmployeeHistoryMockMvc
            .perform(delete(ENTITY_API_URL_ID, employeeHistory.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return employeeHistoryRepository.count();
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

    protected EmployeeHistory getPersistedEmployeeHistory(EmployeeHistory employeeHistory) {
        return employeeHistoryRepository.findById(employeeHistory.getId()).orElseThrow();
    }

    protected void assertPersistedEmployeeHistoryToMatchAllProperties(EmployeeHistory expectedEmployeeHistory) {
        assertEmployeeHistoryAllPropertiesEquals(expectedEmployeeHistory, getPersistedEmployeeHistory(expectedEmployeeHistory));
    }

    protected void assertPersistedEmployeeHistoryToMatchUpdatableProperties(EmployeeHistory expectedEmployeeHistory) {
        assertEmployeeHistoryAllUpdatablePropertiesEquals(expectedEmployeeHistory, getPersistedEmployeeHistory(expectedEmployeeHistory));
    }
}
