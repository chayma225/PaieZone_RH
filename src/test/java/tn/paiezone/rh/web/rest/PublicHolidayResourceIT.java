package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.PublicHolidayAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.ZoneId;
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
import tn.paiezone.rh.domain.PublicHoliday;
import tn.paiezone.rh.repository.PublicHolidayRepository;
import tn.paiezone.rh.service.dto.PublicHolidayDTO;
import tn.paiezone.rh.service.mapper.PublicHolidayMapper;

/**
 * Integration tests for the {@link PublicHolidayResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PublicHolidayResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_NAME_AR = "AAAAAAAAAA";
    private static final String UPDATED_NAME_AR = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_HOLIDAY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_HOLIDAY_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;

    private static final Boolean DEFAULT_IS_RECURRING = false;
    private static final Boolean UPDATED_IS_RECURRING = true;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/public-holidays";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PublicHolidayRepository publicHolidayRepository;

    @Autowired
    private PublicHolidayMapper publicHolidayMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPublicHolidayMockMvc;

    private PublicHoliday publicHoliday;

    private PublicHoliday insertedPublicHoliday;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PublicHoliday createEntity() {
        return new PublicHoliday()
            .name(DEFAULT_NAME)
            .nameAr(DEFAULT_NAME_AR)
            .holidayDate(DEFAULT_HOLIDAY_DATE)
            .year(DEFAULT_YEAR)
            .isRecurring(DEFAULT_IS_RECURRING)
            .active(DEFAULT_ACTIVE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PublicHoliday createUpdatedEntity() {
        return new PublicHoliday()
            .name(UPDATED_NAME)
            .nameAr(UPDATED_NAME_AR)
            .holidayDate(UPDATED_HOLIDAY_DATE)
            .year(UPDATED_YEAR)
            .isRecurring(UPDATED_IS_RECURRING)
            .active(UPDATED_ACTIVE);
    }

    @BeforeEach
    void initTest() {
        publicHoliday = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPublicHoliday != null) {
            publicHolidayRepository.delete(insertedPublicHoliday);
            insertedPublicHoliday = null;
        }
    }

    @Test
    @Transactional
    void createPublicHoliday() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);
        var returnedPublicHolidayDTO = om.readValue(
            restPublicHolidayMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PublicHolidayDTO.class
        );

        // Validate the PublicHoliday in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPublicHoliday = publicHolidayMapper.toEntity(returnedPublicHolidayDTO);
        assertPublicHolidayUpdatableFieldsEquals(returnedPublicHoliday, getPersistedPublicHoliday(returnedPublicHoliday));

        insertedPublicHoliday = returnedPublicHoliday;
    }

    @Test
    @Transactional
    void createPublicHolidayWithExistingId() throws Exception {
        // Create the PublicHoliday with an existing ID
        publicHoliday.setId(1L);
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPublicHolidayMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        publicHoliday.setName(null);

        // Create the PublicHoliday, which fails.
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        restPublicHolidayMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkHolidayDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        publicHoliday.setHolidayDate(null);

        // Create the PublicHoliday, which fails.
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        restPublicHolidayMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        publicHoliday.setYear(null);

        // Create the PublicHoliday, which fails.
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        restPublicHolidayMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIsRecurringIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        publicHoliday.setIsRecurring(null);

        // Create the PublicHoliday, which fails.
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        restPublicHolidayMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        publicHoliday.setActive(null);

        // Create the PublicHoliday, which fails.
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        restPublicHolidayMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPublicHolidays() throws Exception {
        // Initialize the database
        insertedPublicHoliday = publicHolidayRepository.saveAndFlush(publicHoliday);

        // Get all the publicHolidayList
        restPublicHolidayMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(publicHoliday.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].nameAr").value(hasItem(DEFAULT_NAME_AR)))
            .andExpect(jsonPath("$.[*].holidayDate").value(hasItem(DEFAULT_HOLIDAY_DATE.toString())))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].isRecurring").value(hasItem(DEFAULT_IS_RECURRING)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getPublicHoliday() throws Exception {
        // Initialize the database
        insertedPublicHoliday = publicHolidayRepository.saveAndFlush(publicHoliday);

        // Get the publicHoliday
        restPublicHolidayMockMvc
            .perform(get(ENTITY_API_URL_ID, publicHoliday.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(publicHoliday.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.nameAr").value(DEFAULT_NAME_AR))
            .andExpect(jsonPath("$.holidayDate").value(DEFAULT_HOLIDAY_DATE.toString()))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.isRecurring").value(DEFAULT_IS_RECURRING))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingPublicHoliday() throws Exception {
        // Get the publicHoliday
        restPublicHolidayMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPublicHoliday() throws Exception {
        // Initialize the database
        insertedPublicHoliday = publicHolidayRepository.saveAndFlush(publicHoliday);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the publicHoliday
        PublicHoliday updatedPublicHoliday = publicHolidayRepository.findById(publicHoliday.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPublicHoliday are not directly saved in db
        em.detach(updatedPublicHoliday);
        updatedPublicHoliday
            .name(UPDATED_NAME)
            .nameAr(UPDATED_NAME_AR)
            .holidayDate(UPDATED_HOLIDAY_DATE)
            .year(UPDATED_YEAR)
            .isRecurring(UPDATED_IS_RECURRING)
            .active(UPDATED_ACTIVE);
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(updatedPublicHoliday);

        restPublicHolidayMockMvc
            .perform(
                put(ENTITY_API_URL_ID, publicHolidayDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(publicHolidayDTO))
            )
            .andExpect(status().isOk());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPublicHolidayToMatchAllProperties(updatedPublicHoliday);
    }

    @Test
    @Transactional
    void putNonExistingPublicHoliday() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        publicHoliday.setId(longCount.incrementAndGet());

        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPublicHolidayMockMvc
            .perform(
                put(ENTITY_API_URL_ID, publicHolidayDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(publicHolidayDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPublicHoliday() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        publicHoliday.setId(longCount.incrementAndGet());

        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPublicHolidayMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(publicHolidayDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPublicHoliday() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        publicHoliday.setId(longCount.incrementAndGet());

        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPublicHolidayMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePublicHolidayWithPatch() throws Exception {
        // Initialize the database
        insertedPublicHoliday = publicHolidayRepository.saveAndFlush(publicHoliday);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the publicHoliday using partial update
        PublicHoliday partialUpdatedPublicHoliday = new PublicHoliday();
        partialUpdatedPublicHoliday.setId(publicHoliday.getId());

        partialUpdatedPublicHoliday.name(UPDATED_NAME).nameAr(UPDATED_NAME_AR);

        restPublicHolidayMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPublicHoliday.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPublicHoliday))
            )
            .andExpect(status().isOk());

        // Validate the PublicHoliday in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPublicHolidayUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPublicHoliday, publicHoliday),
            getPersistedPublicHoliday(publicHoliday)
        );
    }

    @Test
    @Transactional
    void fullUpdatePublicHolidayWithPatch() throws Exception {
        // Initialize the database
        insertedPublicHoliday = publicHolidayRepository.saveAndFlush(publicHoliday);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the publicHoliday using partial update
        PublicHoliday partialUpdatedPublicHoliday = new PublicHoliday();
        partialUpdatedPublicHoliday.setId(publicHoliday.getId());

        partialUpdatedPublicHoliday
            .name(UPDATED_NAME)
            .nameAr(UPDATED_NAME_AR)
            .holidayDate(UPDATED_HOLIDAY_DATE)
            .year(UPDATED_YEAR)
            .isRecurring(UPDATED_IS_RECURRING)
            .active(UPDATED_ACTIVE);

        restPublicHolidayMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPublicHoliday.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPublicHoliday))
            )
            .andExpect(status().isOk());

        // Validate the PublicHoliday in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPublicHolidayUpdatableFieldsEquals(partialUpdatedPublicHoliday, getPersistedPublicHoliday(partialUpdatedPublicHoliday));
    }

    @Test
    @Transactional
    void patchNonExistingPublicHoliday() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        publicHoliday.setId(longCount.incrementAndGet());

        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPublicHolidayMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, publicHolidayDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(publicHolidayDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPublicHoliday() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        publicHoliday.setId(longCount.incrementAndGet());

        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPublicHolidayMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(publicHolidayDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPublicHoliday() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        publicHoliday.setId(longCount.incrementAndGet());

        // Create the PublicHoliday
        PublicHolidayDTO publicHolidayDTO = publicHolidayMapper.toDto(publicHoliday);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPublicHolidayMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(publicHolidayDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PublicHoliday in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePublicHoliday() throws Exception {
        // Initialize the database
        insertedPublicHoliday = publicHolidayRepository.saveAndFlush(publicHoliday);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the publicHoliday
        restPublicHolidayMockMvc
            .perform(delete(ENTITY_API_URL_ID, publicHoliday.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return publicHolidayRepository.count();
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

    protected PublicHoliday getPersistedPublicHoliday(PublicHoliday publicHoliday) {
        return publicHolidayRepository.findById(publicHoliday.getId()).orElseThrow();
    }

    protected void assertPersistedPublicHolidayToMatchAllProperties(PublicHoliday expectedPublicHoliday) {
        assertPublicHolidayAllPropertiesEquals(expectedPublicHoliday, getPersistedPublicHoliday(expectedPublicHoliday));
    }

    protected void assertPersistedPublicHolidayToMatchUpdatableProperties(PublicHoliday expectedPublicHoliday) {
        assertPublicHolidayAllUpdatablePropertiesEquals(expectedPublicHoliday, getPersistedPublicHoliday(expectedPublicHoliday));
    }
}
