package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.RubriqueAsserts.*;
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
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.IntegrationTest;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Rubrique;
import tn.paiezone.rh.domain.enumeration.RubriqueBase;
import tn.paiezone.rh.domain.enumeration.RubriqueType;
import tn.paiezone.rh.repository.RubriqueRepository;
import tn.paiezone.rh.service.dto.RubriqueDTO;
import tn.paiezone.rh.service.mapper.RubriqueMapper;

/**
 * Integration tests for the {@link RubriqueResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class RubriqueResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_LABEL = "BBBBBBBBBB";

    private static final String DEFAULT_LABEL_AR = "AAAAAAAAAA";
    private static final String UPDATED_LABEL_AR = "BBBBBBBBBB";

    private static final RubriqueType DEFAULT_RUBRIQUE_TYPE = RubriqueType.GAIN;
    private static final RubriqueType UPDATED_RUBRIQUE_TYPE = RubriqueType.DEDUCTION;

    private static final RubriqueBase DEFAULT_BASE = RubriqueBase.FIXED;
    private static final RubriqueBase UPDATED_BASE = RubriqueBase.PERCENT_BRUT;

    private static final BigDecimal DEFAULT_RATE = new BigDecimal(1);
    private static final BigDecimal UPDATED_RATE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_FIXED_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_FIXED_AMOUNT = new BigDecimal(2);

    private static final String DEFAULT_FORMULA = "AAAAAAAAAA";
    private static final String UPDATED_FORMULA = "BBBBBBBBBB";

    private static final Boolean DEFAULT_TAXABLE = false;
    private static final Boolean UPDATED_TAXABLE = true;

    private static final Boolean DEFAULT_CNSS_SALARY = false;
    private static final Boolean UPDATED_CNSS_SALARY = true;

    private static final Boolean DEFAULT_CNSS_EMPLOYER = false;
    private static final Boolean UPDATED_CNSS_EMPLOYER = true;

    private static final Integer DEFAULT_SORT_ORDER = 1;
    private static final Integer UPDATED_SORT_ORDER = 2;

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/rubriques";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private RubriqueRepository rubriqueRepository;

    @Autowired
    private RubriqueMapper rubriqueMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restRubriqueMockMvc;

    private Rubrique rubrique;

    private Rubrique insertedRubrique;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Rubrique createEntity(EntityManager em) {
        Rubrique rubrique = new Rubrique()
            .code(DEFAULT_CODE)
            .label(DEFAULT_LABEL)
            .labelAr(DEFAULT_LABEL_AR)
            .rubriqueType(DEFAULT_RUBRIQUE_TYPE)
            .base(DEFAULT_BASE)
            .rate(DEFAULT_RATE)
            .fixedAmount(DEFAULT_FIXED_AMOUNT)
            .formula(DEFAULT_FORMULA)
            .taxable(DEFAULT_TAXABLE)
            .cnssSalary(DEFAULT_CNSS_SALARY)
            .cnssEmployer(DEFAULT_CNSS_EMPLOYER)
            .sortOrder(DEFAULT_SORT_ORDER)
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
        rubrique.setCompany(company);
        return rubrique;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Rubrique createUpdatedEntity(EntityManager em) {
        Rubrique updatedRubrique = new Rubrique()
            .code(UPDATED_CODE)
            .label(UPDATED_LABEL)
            .labelAr(UPDATED_LABEL_AR)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .base(UPDATED_BASE)
            .rate(UPDATED_RATE)
            .fixedAmount(UPDATED_FIXED_AMOUNT)
            .formula(UPDATED_FORMULA)
            .taxable(UPDATED_TAXABLE)
            .cnssSalary(UPDATED_CNSS_SALARY)
            .cnssEmployer(UPDATED_CNSS_EMPLOYER)
            .sortOrder(UPDATED_SORT_ORDER)
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
        updatedRubrique.setCompany(company);
        return updatedRubrique;
    }

    @BeforeEach
    void initTest() {
        rubrique = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedRubrique != null) {
            rubriqueRepository.delete(insertedRubrique);
            insertedRubrique = null;
        }
    }

    @Test
    @Transactional
    void createRubrique() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);
        var returnedRubriqueDTO = om.readValue(
            restRubriqueMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            RubriqueDTO.class
        );

        // Validate the Rubrique in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedRubrique = rubriqueMapper.toEntity(returnedRubriqueDTO);
        assertRubriqueUpdatableFieldsEquals(returnedRubrique, getPersistedRubrique(returnedRubrique));

        insertedRubrique = returnedRubrique;
    }

    @Test
    @Transactional
    void createRubriqueWithExistingId() throws Exception {
        // Create the Rubrique with an existing ID
        rubrique.setId(1L);
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setCode(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setLabel(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRubriqueTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setRubriqueType(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBaseIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setBase(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTaxableIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setTaxable(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCnssSalaryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setCnssSalary(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCnssEmployerIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setCnssEmployer(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSortOrderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setSortOrder(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        rubrique.setActive(null);

        // Create the Rubrique, which fails.
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        restRubriqueMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllRubriques() throws Exception {
        // Initialize the database
        insertedRubrique = rubriqueRepository.saveAndFlush(rubrique);

        // Get all the rubriqueList
        restRubriqueMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(rubrique.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].label").value(hasItem(DEFAULT_LABEL)))
            .andExpect(jsonPath("$.[*].labelAr").value(hasItem(DEFAULT_LABEL_AR)))
            .andExpect(jsonPath("$.[*].rubriqueType").value(hasItem(DEFAULT_RUBRIQUE_TYPE.toString())))
            .andExpect(jsonPath("$.[*].base").value(hasItem(DEFAULT_BASE.toString())))
            .andExpect(jsonPath("$.[*].rate").value(hasItem(sameNumber(DEFAULT_RATE))))
            .andExpect(jsonPath("$.[*].fixedAmount").value(hasItem(sameNumber(DEFAULT_FIXED_AMOUNT))))
            .andExpect(jsonPath("$.[*].formula").value(hasItem(DEFAULT_FORMULA)))
            .andExpect(jsonPath("$.[*].taxable").value(hasItem(DEFAULT_TAXABLE)))
            .andExpect(jsonPath("$.[*].cnssSalary").value(hasItem(DEFAULT_CNSS_SALARY)))
            .andExpect(jsonPath("$.[*].cnssEmployer").value(hasItem(DEFAULT_CNSS_EMPLOYER)))
            .andExpect(jsonPath("$.[*].sortOrder").value(hasItem(DEFAULT_SORT_ORDER)))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getRubrique() throws Exception {
        // Initialize the database
        insertedRubrique = rubriqueRepository.saveAndFlush(rubrique);

        // Get the rubrique
        restRubriqueMockMvc
            .perform(get(ENTITY_API_URL_ID, rubrique.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(rubrique.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.label").value(DEFAULT_LABEL))
            .andExpect(jsonPath("$.labelAr").value(DEFAULT_LABEL_AR))
            .andExpect(jsonPath("$.rubriqueType").value(DEFAULT_RUBRIQUE_TYPE.toString()))
            .andExpect(jsonPath("$.base").value(DEFAULT_BASE.toString()))
            .andExpect(jsonPath("$.rate").value(sameNumber(DEFAULT_RATE)))
            .andExpect(jsonPath("$.fixedAmount").value(sameNumber(DEFAULT_FIXED_AMOUNT)))
            .andExpect(jsonPath("$.formula").value(DEFAULT_FORMULA))
            .andExpect(jsonPath("$.taxable").value(DEFAULT_TAXABLE))
            .andExpect(jsonPath("$.cnssSalary").value(DEFAULT_CNSS_SALARY))
            .andExpect(jsonPath("$.cnssEmployer").value(DEFAULT_CNSS_EMPLOYER))
            .andExpect(jsonPath("$.sortOrder").value(DEFAULT_SORT_ORDER))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingRubrique() throws Exception {
        // Get the rubrique
        restRubriqueMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingRubrique() throws Exception {
        // Initialize the database
        insertedRubrique = rubriqueRepository.saveAndFlush(rubrique);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the rubrique
        Rubrique updatedRubrique = rubriqueRepository.findById(rubrique.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedRubrique are not directly saved in db
        em.detach(updatedRubrique);
        updatedRubrique
            .code(UPDATED_CODE)
            .label(UPDATED_LABEL)
            .labelAr(UPDATED_LABEL_AR)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .base(UPDATED_BASE)
            .rate(UPDATED_RATE)
            .fixedAmount(UPDATED_FIXED_AMOUNT)
            .formula(UPDATED_FORMULA)
            .taxable(UPDATED_TAXABLE)
            .cnssSalary(UPDATED_CNSS_SALARY)
            .cnssEmployer(UPDATED_CNSS_EMPLOYER)
            .sortOrder(UPDATED_SORT_ORDER)
            .active(UPDATED_ACTIVE);
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(updatedRubrique);

        restRubriqueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, rubriqueDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(rubriqueDTO))
            )
            .andExpect(status().isOk());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedRubriqueToMatchAllProperties(updatedRubrique);
    }

    @Test
    @Transactional
    void putNonExistingRubrique() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        rubrique.setId(longCount.incrementAndGet());

        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRubriqueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, rubriqueDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(rubriqueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchRubrique() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        rubrique.setId(longCount.incrementAndGet());

        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRubriqueMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(rubriqueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamRubrique() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        rubrique.setId(longCount.incrementAndGet());

        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRubriqueMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateRubriqueWithPatch() throws Exception {
        // Initialize the database
        insertedRubrique = rubriqueRepository.saveAndFlush(rubrique);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the rubrique using partial update
        Rubrique partialUpdatedRubrique = new Rubrique();
        partialUpdatedRubrique.setId(rubrique.getId());

        partialUpdatedRubrique
            .rate(UPDATED_RATE)
            .fixedAmount(UPDATED_FIXED_AMOUNT)
            .taxable(UPDATED_TAXABLE)
            .cnssSalary(UPDATED_CNSS_SALARY)
            .cnssEmployer(UPDATED_CNSS_EMPLOYER)
            .sortOrder(UPDATED_SORT_ORDER);

        restRubriqueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRubrique.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRubrique))
            )
            .andExpect(status().isOk());

        // Validate the Rubrique in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRubriqueUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedRubrique, rubrique), getPersistedRubrique(rubrique));
    }

    @Test
    @Transactional
    void fullUpdateRubriqueWithPatch() throws Exception {
        // Initialize the database
        insertedRubrique = rubriqueRepository.saveAndFlush(rubrique);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the rubrique using partial update
        Rubrique partialUpdatedRubrique = new Rubrique();
        partialUpdatedRubrique.setId(rubrique.getId());

        partialUpdatedRubrique
            .code(UPDATED_CODE)
            .label(UPDATED_LABEL)
            .labelAr(UPDATED_LABEL_AR)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .base(UPDATED_BASE)
            .rate(UPDATED_RATE)
            .fixedAmount(UPDATED_FIXED_AMOUNT)
            .formula(UPDATED_FORMULA)
            .taxable(UPDATED_TAXABLE)
            .cnssSalary(UPDATED_CNSS_SALARY)
            .cnssEmployer(UPDATED_CNSS_EMPLOYER)
            .sortOrder(UPDATED_SORT_ORDER)
            .active(UPDATED_ACTIVE);

        restRubriqueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedRubrique.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedRubrique))
            )
            .andExpect(status().isOk());

        // Validate the Rubrique in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertRubriqueUpdatableFieldsEquals(partialUpdatedRubrique, getPersistedRubrique(partialUpdatedRubrique));
    }

    @Test
    @Transactional
    void patchNonExistingRubrique() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        rubrique.setId(longCount.incrementAndGet());

        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restRubriqueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, rubriqueDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(rubriqueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchRubrique() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        rubrique.setId(longCount.incrementAndGet());

        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRubriqueMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(rubriqueDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamRubrique() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        rubrique.setId(longCount.incrementAndGet());

        // Create the Rubrique
        RubriqueDTO rubriqueDTO = rubriqueMapper.toDto(rubrique);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restRubriqueMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(rubriqueDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Rubrique in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteRubrique() throws Exception {
        // Initialize the database
        insertedRubrique = rubriqueRepository.saveAndFlush(rubrique);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the rubrique
        restRubriqueMockMvc
            .perform(delete(ENTITY_API_URL_ID, rubrique.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return rubriqueRepository.count();
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

    protected Rubrique getPersistedRubrique(Rubrique rubrique) {
        return rubriqueRepository.findById(rubrique.getId()).orElseThrow();
    }

    protected void assertPersistedRubriqueToMatchAllProperties(Rubrique expectedRubrique) {
        assertRubriqueAllPropertiesEquals(expectedRubrique, getPersistedRubrique(expectedRubrique));
    }

    protected void assertPersistedRubriqueToMatchUpdatableProperties(Rubrique expectedRubrique) {
        assertRubriqueAllUpdatablePropertiesEquals(expectedRubrique, getPersistedRubrique(expectedRubrique));
    }
}
