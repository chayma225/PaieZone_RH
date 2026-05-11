package tn.paiezone.rh.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
import tn.paiezone.rh.domain.RegulatoryParam;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.dto.RegulatoryParamDTO;
import tn.paiezone.rh.service.mapper.RegulatoryParamMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.RegulatoryParamAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

/**
 * Integration tests for the {@link RegulatoryParamResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RegulatoryParamResourceIT {

    private static final String DEFAULT_PARAM_KEY = "AAAAAAAAAA";
    private static final String UPDATED_PARAM_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_PARAM_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_PARAM_LABEL = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_NUMERIC_VALUE = new BigDecimal(1);
    private static final BigDecimal UPDATED_NUMERIC_VALUE = new BigDecimal(2);

    private static final String DEFAULT_TEXT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_TEXT_VALUE = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_EFFECTIVE_FROM = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_EFFECTIVE_FROM = LocalDate.now(ZoneId.systemDefault());

    private static final LocalDate DEFAULT_EFFECTIVE_TO = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_EFFECTIVE_TO = LocalDate.now(ZoneId.systemDefault());

    private static final String DEFAULT_LEGAL_REFERENCE = "AAAAAAAAAA";
    private static final String UPDATED_LEGAL_REFERENCE = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/regulatory-params";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RegulatoryParamRepository regulatoryParamRepository;

    @Autowired
    private RegulatoryParamMapper regulatoryParamMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRegulatoryParamMockMvc;

    private RegulatoryParam regulatoryParam;

    private RegulatoryParam insertedRegulatoryParam;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RegulatoryParam createEntity() {
        return new RegulatoryParam()
            .paramKey(DEFAULT_PARAM_KEY)
            .paramLabel(DEFAULT_PARAM_LABEL)
            .numericValue(DEFAULT_NUMERIC_VALUE)
            .stringValue(DEFAULT_TEXT_VALUE)
            .effectiveFrom(DEFAULT_EFFECTIVE_FROM)
            .effectiveTo(DEFAULT_EFFECTIVE_TO)
            .legalReference(DEFAULT_LEGAL_REFERENCE)
            .active(DEFAULT_ACTIVE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static RegulatoryParam createUpdatedEntity() {
        return new RegulatoryParam()
            .paramKey(UPDATED_PARAM_KEY)
            .paramLabel(UPDATED_PARAM_LABEL)
            .numericValue(UPDATED_NUMERIC_VALUE)
            .stringValue(UPDATED_TEXT_VALUE)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM)
            .effectiveTo(UPDATED_EFFECTIVE_TO)
            .legalReference(UPDATED_LEGAL_REFERENCE)
            .active(UPDATED_ACTIVE);
    }

    @BeforeEach
    void initTest() {
        regulatoryParam = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedRegulatoryParam != null) {
            regulatoryParamRepository.delete(insertedRegulatoryParam);
            insertedRegulatoryParam = null;
        }
    }

    @Test
    @Transactional
    void createRegulatoryParam() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);
        var returnedRegulatoryParamDTO = om.readValue(
            restRegulatoryParamMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RegulatoryParamDTO.class
        );

        // Validate the RegulatoryParam in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRegulatoryParam = regulatoryParamMapper.toEntity(returnedRegulatoryParamDTO);
        assertRegulatoryParamUpdatableFieldsEquals(returnedRegulatoryParam, getPersistedRegulatoryParam(returnedRegulatoryParam));

        insertedRegulatoryParam = returnedRegulatoryParam;
    }

    @Test
    @Transactional
    void createRegulatoryParamWithExistingId() throws Exception {
        // Create the RegulatoryParam with an existing ID
        regulatoryParam.setId(1L);
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRegulatoryParamMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isBadRequest());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkParamKeyIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        regulatoryParam.setParamKey(null);

        // Create the RegulatoryParam, which fails.
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        restRegulatoryParamMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkParamLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        regulatoryParam.setParamLabel(null);

        // Create the RegulatoryParam, which fails.
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        restRegulatoryParamMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEffectiveFromIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        regulatoryParam.setEffectiveFrom(null);

        // Create the RegulatoryParam, which fails.
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        restRegulatoryParamMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        regulatoryParam.setActive(null);

        // Create the RegulatoryParam, which fails.
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        restRegulatoryParamMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRegulatoryParams() throws Exception {
        // Initialize the database
        insertedRegulatoryParam = regulatoryParamRepository.saveAndFlush(regulatoryParam);

        // Get all the regulatoryParamList
        restRegulatoryParamMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(regulatoryParam.getId().intValue())))
            .andExpect(jsonPath("$.[*].paramKey").value(hasItem(DEFAULT_PARAM_KEY)))
            .andExpect(jsonPath("$.[*].paramLabel").value(hasItem(DEFAULT_PARAM_LABEL)))
            .andExpect(jsonPath("$.[*].numericValue").value(hasItem(sameNumber(DEFAULT_NUMERIC_VALUE))))
            .andExpect(jsonPath("$.[*].stringValue").value(hasItem(DEFAULT_TEXT_VALUE)))
            .andExpect(jsonPath("$.[*].effectiveFrom").value(hasItem(DEFAULT_EFFECTIVE_FROM.toString())))
            .andExpect(jsonPath("$.[*].effectiveTo").value(hasItem(DEFAULT_EFFECTIVE_TO.toString())))
            .andExpect(jsonPath("$.[*].legalReference").value(hasItem(DEFAULT_LEGAL_REFERENCE)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getRegulatoryParam() throws Exception {
        // Initialize the database
        insertedRegulatoryParam = regulatoryParamRepository.saveAndFlush(regulatoryParam);

        // Get the regulatoryParam
        restRegulatoryParamMockMvc
            .perform(get(ENTITY_API_URL_ID, regulatoryParam.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(regulatoryParam.getId().intValue()))
            .andExpect(jsonPath("$.paramKey").value(DEFAULT_PARAM_KEY))
            .andExpect(jsonPath("$.paramLabel").value(DEFAULT_PARAM_LABEL))
            .andExpect(jsonPath("$.numericValue").value(sameNumber(DEFAULT_NUMERIC_VALUE)))
            .andExpect(jsonPath("$.stringValue").value(DEFAULT_TEXT_VALUE))
            .andExpect(jsonPath("$.effectiveFrom").value(DEFAULT_EFFECTIVE_FROM.toString()))
            .andExpect(jsonPath("$.effectiveTo").value(DEFAULT_EFFECTIVE_TO.toString()))
            .andExpect(jsonPath("$.legalReference").value(DEFAULT_LEGAL_REFERENCE))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingRegulatoryParam() throws Exception {
        // Get the regulatoryParam
        restRegulatoryParamMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRegulatoryParam() throws Exception {
        // Initialize the database
        insertedRegulatoryParam = regulatoryParamRepository.saveAndFlush(regulatoryParam);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the regulatoryParam
        RegulatoryParam updatedRegulatoryParam = regulatoryParamRepository.findById(regulatoryParam.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRegulatoryParam are not directly saved in db
        em.detach(updatedRegulatoryParam);
        updatedRegulatoryParam
            .paramKey(UPDATED_PARAM_KEY)
            .paramLabel(UPDATED_PARAM_LABEL)
            .numericValue(UPDATED_NUMERIC_VALUE)
            .stringValue(UPDATED_TEXT_VALUE)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM)
            .effectiveTo(UPDATED_EFFECTIVE_TO)
            .legalReference(UPDATED_LEGAL_REFERENCE)
            .active(UPDATED_ACTIVE);
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(updatedRegulatoryParam);

        restRegulatoryParamMockMvc
            .perform(
                put(ENTITY_API_URL_ID, regulatoryParamDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(regulatoryParamDTO))
            )
            .andExpect(status().isOk());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRegulatoryParamToMatchAllProperties(updatedRegulatoryParam);
    }

    @Test
    @Transactional
    void putNonExistingRegulatoryParam() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulatoryParam.setId(longCount.incrementAndGet());

        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRegulatoryParamMockMvc
            .perform(
                put(ENTITY_API_URL_ID, regulatoryParamDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(regulatoryParamDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRegulatoryParam() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulatoryParam.setId(longCount.incrementAndGet());

        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulatoryParamMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(regulatoryParamDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRegulatoryParam() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulatoryParam.setId(longCount.incrementAndGet());

        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulatoryParamMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRegulatoryParamWithPatch() throws Exception {
        // Initialize the database
        insertedRegulatoryParam = regulatoryParamRepository.saveAndFlush(regulatoryParam);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the regulatoryParam using partial update
        RegulatoryParam partialUpdatedRegulatoryParam = new RegulatoryParam();
        partialUpdatedRegulatoryParam.setId(regulatoryParam.getId());

        partialUpdatedRegulatoryParam
            .paramKey(UPDATED_PARAM_KEY)
            .numericValue(UPDATED_NUMERIC_VALUE)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM)
            .legalReference(UPDATED_LEGAL_REFERENCE);

        restRegulatoryParamMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRegulatoryParam.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRegulatoryParam))
            )
            .andExpect(status().isOk());

        // Validate the RegulatoryParam in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRegulatoryParamUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedRegulatoryParam, regulatoryParam),
            getPersistedRegulatoryParam(regulatoryParam)
        );
    }

    @Test
    @Transactional
    void fullUpdateRegulatoryParamWithPatch() throws Exception {
        // Initialize the database
        insertedRegulatoryParam = regulatoryParamRepository.saveAndFlush(regulatoryParam);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the regulatoryParam using partial update
        RegulatoryParam partialUpdatedRegulatoryParam = new RegulatoryParam();
        partialUpdatedRegulatoryParam.setId(regulatoryParam.getId());

        partialUpdatedRegulatoryParam
            .paramKey(UPDATED_PARAM_KEY)
            .paramLabel(UPDATED_PARAM_LABEL)
            .numericValue(UPDATED_NUMERIC_VALUE)
            .stringValue(UPDATED_TEXT_VALUE)
            .effectiveFrom(UPDATED_EFFECTIVE_FROM)
            .effectiveTo(UPDATED_EFFECTIVE_TO)
            .legalReference(UPDATED_LEGAL_REFERENCE)
            .active(UPDATED_ACTIVE);

        restRegulatoryParamMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRegulatoryParam.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRegulatoryParam))
            )
            .andExpect(status().isOk());

        // Validate the RegulatoryParam in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRegulatoryParamUpdatableFieldsEquals(
            partialUpdatedRegulatoryParam,
            getPersistedRegulatoryParam(partialUpdatedRegulatoryParam)
        );
    }

    @Test
    @Transactional
    void patchNonExistingRegulatoryParam() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulatoryParam.setId(longCount.incrementAndGet());

        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRegulatoryParamMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, regulatoryParamDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(regulatoryParamDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRegulatoryParam() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulatoryParam.setId(longCount.incrementAndGet());

        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulatoryParamMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(regulatoryParamDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRegulatoryParam() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        regulatoryParam.setId(longCount.incrementAndGet());

        // Create the RegulatoryParam
        RegulatoryParamDTO regulatoryParamDTO = regulatoryParamMapper.toDto(regulatoryParam);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRegulatoryParamMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(regulatoryParamDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the RegulatoryParam in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRegulatoryParam() throws Exception {
        // Initialize the database
        insertedRegulatoryParam = regulatoryParamRepository.saveAndFlush(regulatoryParam);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the regulatoryParam
        restRegulatoryParamMockMvc
            .perform(delete(ENTITY_API_URL_ID, regulatoryParam.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return regulatoryParamRepository.count();
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

    protected RegulatoryParam getPersistedRegulatoryParam(RegulatoryParam regulatoryParam) {
        return regulatoryParamRepository.findById(regulatoryParam.getId()).orElseThrow();
    }

    protected void assertPersistedRegulatoryParamToMatchAllProperties(RegulatoryParam expectedRegulatoryParam) {
        assertRegulatoryParamAllPropertiesEquals(expectedRegulatoryParam, getPersistedRegulatoryParam(expectedRegulatoryParam));
    }

    protected void assertPersistedRegulatoryParamToMatchUpdatableProperties(RegulatoryParam expectedRegulatoryParam) {
        assertRegulatoryParamAllUpdatablePropertiesEquals(expectedRegulatoryParam, getPersistedRegulatoryParam(expectedRegulatoryParam));
    }
}
