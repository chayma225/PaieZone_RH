package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.TaxBracketAsserts.*;
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
import tn.paiezone.rh.domain.TaxBracket;
import tn.paiezone.rh.repository.TaxBracketRepository;
import tn.paiezone.rh.service.dto.TaxBracketDTO;
import tn.paiezone.rh.service.mapper.TaxBracketMapper;

/**
 * Integration tests for the {@link TaxBracketResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TaxBracketResourceIT {

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;

    private static final BigDecimal DEFAULT_MIN_INCOME = new BigDecimal(1);
    private static final BigDecimal UPDATED_MIN_INCOME = new BigDecimal(2);

    private static final BigDecimal DEFAULT_MAX_INCOME = new BigDecimal(1);
    private static final BigDecimal UPDATED_MAX_INCOME = new BigDecimal(2);

    private static final BigDecimal DEFAULT_RATE = new BigDecimal(1);
    private static final BigDecimal UPDATED_RATE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_FIXED_DEDUCTION = new BigDecimal(1);
    private static final BigDecimal UPDATED_FIXED_DEDUCTION = new BigDecimal(2);

    private static final Integer DEFAULT_SORT_ORDER = 1;
    private static final Integer UPDATED_SORT_ORDER = 2;

    private static final String ENTITY_API_URL = "/api/tax-brackets";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TaxBracketRepository taxBracketRepository;

    @Autowired
    private TaxBracketMapper taxBracketMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTaxBracketMockMvc;

    private TaxBracket taxBracket;

    private TaxBracket insertedTaxBracket;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TaxBracket createEntity() {
        return new TaxBracket()
            .year(DEFAULT_YEAR)
            .minIncome(DEFAULT_MIN_INCOME)
            .maxIncome(DEFAULT_MAX_INCOME)
            .rate(DEFAULT_RATE)
            .fixedDeduction(DEFAULT_FIXED_DEDUCTION)
            .sortOrder(DEFAULT_SORT_ORDER);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TaxBracket createUpdatedEntity() {
        return new TaxBracket()
            .year(UPDATED_YEAR)
            .minIncome(UPDATED_MIN_INCOME)
            .maxIncome(UPDATED_MAX_INCOME)
            .rate(UPDATED_RATE)
            .fixedDeduction(UPDATED_FIXED_DEDUCTION)
            .sortOrder(UPDATED_SORT_ORDER);
    }

    @BeforeEach
    void initTest() {
        taxBracket = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedTaxBracket != null) {
            taxBracketRepository.delete(insertedTaxBracket);
            insertedTaxBracket = null;
        }
    }

    @Test
    @Transactional
    void createTaxBracket() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);
        var returnedTaxBracketDTO = om.readValue(
            restTaxBracketMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TaxBracketDTO.class
        );

        // Validate the TaxBracket in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTaxBracket = taxBracketMapper.toEntity(returnedTaxBracketDTO);
        assertTaxBracketUpdatableFieldsEquals(returnedTaxBracket, getPersistedTaxBracket(returnedTaxBracket));

        insertedTaxBracket = returnedTaxBracket;
    }

    @Test
    @Transactional
    void createTaxBracketWithExistingId() throws Exception {
        // Create the TaxBracket with an existing ID
        taxBracket.setId(1L);
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTaxBracketMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        taxBracket.setYear(null);

        // Create the TaxBracket, which fails.
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        restTaxBracketMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMinIncomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        taxBracket.setMinIncome(null);

        // Create the TaxBracket, which fails.
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        restTaxBracketMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        taxBracket.setRate(null);

        // Create the TaxBracket, which fails.
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        restTaxBracketMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFixedDeductionIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        taxBracket.setFixedDeduction(null);

        // Create the TaxBracket, which fails.
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        restTaxBracketMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSortOrderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        taxBracket.setSortOrder(null);

        // Create the TaxBracket, which fails.
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        restTaxBracketMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTaxBrackets() throws Exception {
        // Initialize the database
        insertedTaxBracket = taxBracketRepository.saveAndFlush(taxBracket);

        // Get all the taxBracketList
        restTaxBracketMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(taxBracket.getId().intValue())))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].minIncome").value(hasItem(sameNumber(DEFAULT_MIN_INCOME))))
            .andExpect(jsonPath("$.[*].maxIncome").value(hasItem(sameNumber(DEFAULT_MAX_INCOME))))
            .andExpect(jsonPath("$.[*].rate").value(hasItem(sameNumber(DEFAULT_RATE))))
            .andExpect(jsonPath("$.[*].fixedDeduction").value(hasItem(sameNumber(DEFAULT_FIXED_DEDUCTION))))
            .andExpect(jsonPath("$.[*].sortOrder").value(hasItem(DEFAULT_SORT_ORDER)));
    }

    @Test
    @Transactional
    void getTaxBracket() throws Exception {
        // Initialize the database
        insertedTaxBracket = taxBracketRepository.saveAndFlush(taxBracket);

        // Get the taxBracket
        restTaxBracketMockMvc
            .perform(get(ENTITY_API_URL_ID, taxBracket.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(taxBracket.getId().intValue()))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.minIncome").value(sameNumber(DEFAULT_MIN_INCOME)))
            .andExpect(jsonPath("$.maxIncome").value(sameNumber(DEFAULT_MAX_INCOME)))
            .andExpect(jsonPath("$.rate").value(sameNumber(DEFAULT_RATE)))
            .andExpect(jsonPath("$.fixedDeduction").value(sameNumber(DEFAULT_FIXED_DEDUCTION)))
            .andExpect(jsonPath("$.sortOrder").value(DEFAULT_SORT_ORDER));
    }

    @Test
    @Transactional
    void getNonExistingTaxBracket() throws Exception {
        // Get the taxBracket
        restTaxBracketMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTaxBracket() throws Exception {
        // Initialize the database
        insertedTaxBracket = taxBracketRepository.saveAndFlush(taxBracket);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the taxBracket
        TaxBracket updatedTaxBracket = taxBracketRepository.findById(taxBracket.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTaxBracket are not directly saved in db
        em.detach(updatedTaxBracket);
        updatedTaxBracket
            .year(UPDATED_YEAR)
            .minIncome(UPDATED_MIN_INCOME)
            .maxIncome(UPDATED_MAX_INCOME)
            .rate(UPDATED_RATE)
            .fixedDeduction(UPDATED_FIXED_DEDUCTION)
            .sortOrder(UPDATED_SORT_ORDER);
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(updatedTaxBracket);

        restTaxBracketMockMvc
            .perform(
                put(ENTITY_API_URL_ID, taxBracketDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(taxBracketDTO))
            )
            .andExpect(status().isOk());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTaxBracketToMatchAllProperties(updatedTaxBracket);
    }

    @Test
    @Transactional
    void putNonExistingTaxBracket() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taxBracket.setId(longCount.incrementAndGet());

        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTaxBracketMockMvc
            .perform(
                put(ENTITY_API_URL_ID, taxBracketDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(taxBracketDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTaxBracket() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taxBracket.setId(longCount.incrementAndGet());

        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaxBracketMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(taxBracketDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTaxBracket() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taxBracket.setId(longCount.incrementAndGet());

        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaxBracketMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTaxBracketWithPatch() throws Exception {
        // Initialize the database
        insertedTaxBracket = taxBracketRepository.saveAndFlush(taxBracket);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the taxBracket using partial update
        TaxBracket partialUpdatedTaxBracket = new TaxBracket();
        partialUpdatedTaxBracket.setId(taxBracket.getId());

        partialUpdatedTaxBracket.year(UPDATED_YEAR).rate(UPDATED_RATE).fixedDeduction(UPDATED_FIXED_DEDUCTION);

        restTaxBracketMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTaxBracket.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTaxBracket))
            )
            .andExpect(status().isOk());

        // Validate the TaxBracket in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTaxBracketUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTaxBracket, taxBracket),
            getPersistedTaxBracket(taxBracket)
        );
    }

    @Test
    @Transactional
    void fullUpdateTaxBracketWithPatch() throws Exception {
        // Initialize the database
        insertedTaxBracket = taxBracketRepository.saveAndFlush(taxBracket);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the taxBracket using partial update
        TaxBracket partialUpdatedTaxBracket = new TaxBracket();
        partialUpdatedTaxBracket.setId(taxBracket.getId());

        partialUpdatedTaxBracket
            .year(UPDATED_YEAR)
            .minIncome(UPDATED_MIN_INCOME)
            .maxIncome(UPDATED_MAX_INCOME)
            .rate(UPDATED_RATE)
            .fixedDeduction(UPDATED_FIXED_DEDUCTION)
            .sortOrder(UPDATED_SORT_ORDER);

        restTaxBracketMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTaxBracket.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTaxBracket))
            )
            .andExpect(status().isOk());

        // Validate the TaxBracket in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTaxBracketUpdatableFieldsEquals(partialUpdatedTaxBracket, getPersistedTaxBracket(partialUpdatedTaxBracket));
    }

    @Test
    @Transactional
    void patchNonExistingTaxBracket() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taxBracket.setId(longCount.incrementAndGet());

        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTaxBracketMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, taxBracketDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(taxBracketDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTaxBracket() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taxBracket.setId(longCount.incrementAndGet());

        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaxBracketMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(taxBracketDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTaxBracket() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        taxBracket.setId(longCount.incrementAndGet());

        // Create the TaxBracket
        TaxBracketDTO taxBracketDTO = taxBracketMapper.toDto(taxBracket);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTaxBracketMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(taxBracketDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TaxBracket in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTaxBracket() throws Exception {
        // Initialize the database
        insertedTaxBracket = taxBracketRepository.saveAndFlush(taxBracket);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the taxBracket
        restTaxBracketMockMvc
            .perform(delete(ENTITY_API_URL_ID, taxBracket.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return taxBracketRepository.count();
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

    protected TaxBracket getPersistedTaxBracket(TaxBracket taxBracket) {
        return taxBracketRepository.findById(taxBracket.getId()).orElseThrow();
    }

    protected void assertPersistedTaxBracketToMatchAllProperties(TaxBracket expectedTaxBracket) {
        assertTaxBracketAllPropertiesEquals(expectedTaxBracket, getPersistedTaxBracket(expectedTaxBracket));
    }

    protected void assertPersistedTaxBracketToMatchUpdatableProperties(TaxBracket expectedTaxBracket) {
        assertTaxBracketAllUpdatablePropertiesEquals(expectedTaxBracket, getPersistedTaxBracket(expectedTaxBracket));
    }
}
