package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.LeaveTypeAsserts.*;
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
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.domain.enumeration.LeaveTypeName;
import tn.paiezone.rh.repository.LeaveTypeRepository;
import tn.paiezone.rh.service.dto.LeaveTypeDTO;
import tn.paiezone.rh.service.mapper.LeaveTypeMapper;

/**
 * Integration tests for the {@link LeaveTypeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class LeaveTypeResourceIT {

    private static final LeaveTypeName DEFAULT_NAME = LeaveTypeName.ANNUAL;
    private static final LeaveTypeName UPDATED_NAME = LeaveTypeName.SICK;

    private static final String DEFAULT_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_LABEL = "BBBBBBBBBB";

    private static final Integer DEFAULT_MAX_DAYS_PER_YEAR = 1;
    private static final Integer UPDATED_MAX_DAYS_PER_YEAR = 2;

    private static final Integer DEFAULT_CARRY_OVER_DAYS = 0;
    private static final Integer UPDATED_CARRY_OVER_DAYS = 1;

    private static final Boolean DEFAULT_PAID = false;
    private static final Boolean UPDATED_PAID = true;

    private static final Boolean DEFAULT_REQUIRES_MEDICAL = false;
    private static final Boolean UPDATED_REQUIRES_MEDICAL = true;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/leave-types";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveTypeMapper leaveTypeMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLeaveTypeMockMvc;

    private LeaveType leaveType;

    private LeaveType insertedLeaveType;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LeaveType createEntity(EntityManager em) {
        LeaveType leaveType = new LeaveType()
            .name(DEFAULT_NAME)
            .label(DEFAULT_LABEL)
            .maxDaysPerYear(DEFAULT_MAX_DAYS_PER_YEAR)
            .carryOverDays(DEFAULT_CARRY_OVER_DAYS)
            .paid(DEFAULT_PAID)
            .requiresMedical(DEFAULT_REQUIRES_MEDICAL)
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
        leaveType.setCompany(company);
        return leaveType;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LeaveType createUpdatedEntity(EntityManager em) {
        LeaveType updatedLeaveType = new LeaveType()
            .name(UPDATED_NAME)
            .label(UPDATED_LABEL)
            .maxDaysPerYear(UPDATED_MAX_DAYS_PER_YEAR)
            .carryOverDays(UPDATED_CARRY_OVER_DAYS)
            .paid(UPDATED_PAID)
            .requiresMedical(UPDATED_REQUIRES_MEDICAL)
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
        updatedLeaveType.setCompany(company);
        return updatedLeaveType;
    }

    @BeforeEach
    void initTest() {
        leaveType = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedLeaveType != null) {
            leaveTypeRepository.delete(insertedLeaveType);
            insertedLeaveType = null;
        }
    }

    @Test
    @Transactional
    void createLeaveType() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);
        var returnedLeaveTypeDTO = om.readValue(
            restLeaveTypeMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            LeaveTypeDTO.class
        );

        // Validate the LeaveType in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedLeaveType = leaveTypeMapper.toEntity(returnedLeaveTypeDTO);
        assertLeaveTypeUpdatableFieldsEquals(returnedLeaveType, getPersistedLeaveType(returnedLeaveType));

        insertedLeaveType = returnedLeaveType;
    }

    @Test
    @Transactional
    void createLeaveTypeWithExistingId() throws Exception {
        // Create the LeaveType with an existing ID
        leaveType.setId(1L);
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setName(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setLabel(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMaxDaysPerYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setMaxDaysPerYear(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCarryOverDaysIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setCarryOverDays(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPaidIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setPaid(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRequiresMedicalIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setRequiresMedical(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveType.setActive(null);

        // Create the LeaveType, which fails.
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        restLeaveTypeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllLeaveTypes() throws Exception {
        // Initialize the database
        insertedLeaveType = leaveTypeRepository.saveAndFlush(leaveType);

        // Get all the leaveTypeList
        restLeaveTypeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(leaveType.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].label").value(hasItem(DEFAULT_LABEL)))
            .andExpect(jsonPath("$.[*].maxDaysPerYear").value(hasItem(DEFAULT_MAX_DAYS_PER_YEAR)))
            .andExpect(jsonPath("$.[*].carryOverDays").value(hasItem(DEFAULT_CARRY_OVER_DAYS)))
            .andExpect(jsonPath("$.[*].paid").value(hasItem(DEFAULT_PAID)))
            .andExpect(jsonPath("$.[*].requiresMedical").value(hasItem(DEFAULT_REQUIRES_MEDICAL)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getLeaveType() throws Exception {
        // Initialize the database
        insertedLeaveType = leaveTypeRepository.saveAndFlush(leaveType);

        // Get the leaveType
        restLeaveTypeMockMvc
            .perform(get(ENTITY_API_URL_ID, leaveType.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(leaveType.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.label").value(DEFAULT_LABEL))
            .andExpect(jsonPath("$.maxDaysPerYear").value(DEFAULT_MAX_DAYS_PER_YEAR))
            .andExpect(jsonPath("$.carryOverDays").value(DEFAULT_CARRY_OVER_DAYS))
            .andExpect(jsonPath("$.paid").value(DEFAULT_PAID))
            .andExpect(jsonPath("$.requiresMedical").value(DEFAULT_REQUIRES_MEDICAL))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingLeaveType() throws Exception {
        // Get the leaveType
        restLeaveTypeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingLeaveType() throws Exception {
        // Initialize the database
        insertedLeaveType = leaveTypeRepository.saveAndFlush(leaveType);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveType
        LeaveType updatedLeaveType = leaveTypeRepository.findById(leaveType.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedLeaveType are not directly saved in db
        em.detach(updatedLeaveType);
        updatedLeaveType
            .name(UPDATED_NAME)
            .label(UPDATED_LABEL)
            .maxDaysPerYear(UPDATED_MAX_DAYS_PER_YEAR)
            .carryOverDays(UPDATED_CARRY_OVER_DAYS)
            .paid(UPDATED_PAID)
            .requiresMedical(UPDATED_REQUIRES_MEDICAL)
            .active(UPDATED_ACTIVE);
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(updatedLeaveType);

        restLeaveTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveTypeDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveTypeDTO))
            )
            .andExpect(status().isOk());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedLeaveTypeToMatchAllProperties(updatedLeaveType);
    }

    @Test
    @Transactional
    void putNonExistingLeaveType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveType.setId(longCount.incrementAndGet());

        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveTypeDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchLeaveType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveType.setId(longCount.incrementAndGet());

        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveTypeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLeaveType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveType.setId(longCount.incrementAndGet());

        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveTypeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateLeaveTypeWithPatch() throws Exception {
        // Initialize the database
        insertedLeaveType = leaveTypeRepository.saveAndFlush(leaveType);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveType using partial update
        LeaveType partialUpdatedLeaveType = new LeaveType();
        partialUpdatedLeaveType.setId(leaveType.getId());

        partialUpdatedLeaveType.name(UPDATED_NAME).label(UPDATED_LABEL).maxDaysPerYear(UPDATED_MAX_DAYS_PER_YEAR);

        restLeaveTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaveType.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeaveType))
            )
            .andExpect(status().isOk());

        // Validate the LeaveType in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveTypeUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedLeaveType, leaveType),
            getPersistedLeaveType(leaveType)
        );
    }

    @Test
    @Transactional
    void fullUpdateLeaveTypeWithPatch() throws Exception {
        // Initialize the database
        insertedLeaveType = leaveTypeRepository.saveAndFlush(leaveType);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveType using partial update
        LeaveType partialUpdatedLeaveType = new LeaveType();
        partialUpdatedLeaveType.setId(leaveType.getId());

        partialUpdatedLeaveType
            .name(UPDATED_NAME)
            .label(UPDATED_LABEL)
            .maxDaysPerYear(UPDATED_MAX_DAYS_PER_YEAR)
            .carryOverDays(UPDATED_CARRY_OVER_DAYS)
            .paid(UPDATED_PAID)
            .requiresMedical(UPDATED_REQUIRES_MEDICAL)
            .active(UPDATED_ACTIVE);

        restLeaveTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaveType.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeaveType))
            )
            .andExpect(status().isOk());

        // Validate the LeaveType in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveTypeUpdatableFieldsEquals(partialUpdatedLeaveType, getPersistedLeaveType(partialUpdatedLeaveType));
    }

    @Test
    @Transactional
    void patchNonExistingLeaveType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveType.setId(longCount.incrementAndGet());

        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, leaveTypeDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLeaveType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveType.setId(longCount.incrementAndGet());

        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveTypeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveTypeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLeaveType() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveType.setId(longCount.incrementAndGet());

        // Create the LeaveType
        LeaveTypeDTO leaveTypeDTO = leaveTypeMapper.toDto(leaveType);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveTypeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(leaveTypeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the LeaveType in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteLeaveType() throws Exception {
        // Initialize the database
        insertedLeaveType = leaveTypeRepository.saveAndFlush(leaveType);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the leaveType
        restLeaveTypeMockMvc
            .perform(delete(ENTITY_API_URL_ID, leaveType.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return leaveTypeRepository.count();
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

    protected LeaveType getPersistedLeaveType(LeaveType leaveType) {
        return leaveTypeRepository.findById(leaveType.getId()).orElseThrow();
    }

    protected void assertPersistedLeaveTypeToMatchAllProperties(LeaveType expectedLeaveType) {
        assertLeaveTypeAllPropertiesEquals(expectedLeaveType, getPersistedLeaveType(expectedLeaveType));
    }

    protected void assertPersistedLeaveTypeToMatchUpdatableProperties(LeaveType expectedLeaveType) {
        assertLeaveTypeAllUpdatablePropertiesEquals(expectedLeaveType, getPersistedLeaveType(expectedLeaveType));
    }
}
