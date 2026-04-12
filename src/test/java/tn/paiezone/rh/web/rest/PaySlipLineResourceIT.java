package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.PaySlipLineAsserts.*;
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
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.PaySlipLine;
import tn.paiezone.rh.domain.enumeration.RubriqueType;
import tn.paiezone.rh.repository.PaySlipLineRepository;
import tn.paiezone.rh.service.dto.PaySlipLineDTO;
import tn.paiezone.rh.service.mapper.PaySlipLineMapper;

/**
 * Integration tests for the {@link PaySlipLineResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PaySlipLineResourceIT {

    private static final Integer DEFAULT_SORT_ORDER = 1;
    private static final Integer UPDATED_SORT_ORDER = 2;

    private static final String DEFAULT_RUBRIQUE_CODE = "AAAAAAAAAA";
    private static final String UPDATED_RUBRIQUE_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_RUBRIQUE_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_RUBRIQUE_LABEL = "BBBBBBBBBB";

    private static final RubriqueType DEFAULT_RUBRIQUE_TYPE = RubriqueType.GAIN;
    private static final RubriqueType UPDATED_RUBRIQUE_TYPE = RubriqueType.DEDUCTION;

    private static final BigDecimal DEFAULT_BASE = new BigDecimal(1);
    private static final BigDecimal UPDATED_BASE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_RATE = new BigDecimal(1);
    private static final BigDecimal UPDATED_RATE = new BigDecimal(2);

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);

    private static final Boolean DEFAULT_TAXABLE = false;
    private static final Boolean UPDATED_TAXABLE = true;

    private static final String ENTITY_API_URL = "/api/pay-slip-lines";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PaySlipLineRepository paySlipLineRepository;

    @Autowired
    private PaySlipLineMapper paySlipLineMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPaySlipLineMockMvc;

    private PaySlipLine paySlipLine;

    private PaySlipLine insertedPaySlipLine;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PaySlipLine createEntity(EntityManager em) {
        PaySlipLine paySlipLine = new PaySlipLine()
            .sortOrder(DEFAULT_SORT_ORDER)
            .rubriqueCode(DEFAULT_RUBRIQUE_CODE)
            .rubriqueLabel(DEFAULT_RUBRIQUE_LABEL)
            .rubriqueType(DEFAULT_RUBRIQUE_TYPE)
            .base(DEFAULT_BASE)
            .rate(DEFAULT_RATE)
            .amount(DEFAULT_AMOUNT)
            .taxable(DEFAULT_TAXABLE);
        // Add required entity
        PaySlip paySlip;
        if (TestUtil.findAll(em, PaySlip.class).isEmpty()) {
            paySlip = PaySlipResourceIT.createEntity(em);
            em.persist(paySlip);
            em.flush();
        } else {
            paySlip = TestUtil.findAll(em, PaySlip.class).get(0);
        }
        paySlipLine.setPaySlip(paySlip);
        return paySlipLine;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PaySlipLine createUpdatedEntity(EntityManager em) {
        PaySlipLine updatedPaySlipLine = new PaySlipLine()
            .sortOrder(UPDATED_SORT_ORDER)
            .rubriqueCode(UPDATED_RUBRIQUE_CODE)
            .rubriqueLabel(UPDATED_RUBRIQUE_LABEL)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .base(UPDATED_BASE)
            .rate(UPDATED_RATE)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE);
        // Add required entity
        PaySlip paySlip;
        if (TestUtil.findAll(em, PaySlip.class).isEmpty()) {
            paySlip = PaySlipResourceIT.createUpdatedEntity(em);
            em.persist(paySlip);
            em.flush();
        } else {
            paySlip = TestUtil.findAll(em, PaySlip.class).get(0);
        }
        updatedPaySlipLine.setPaySlip(paySlip);
        return updatedPaySlipLine;
    }

    @BeforeEach
    void initTest() {
        paySlipLine = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedPaySlipLine != null) {
            paySlipLineRepository.delete(insertedPaySlipLine);
            insertedPaySlipLine = null;
        }
    }

    @Test
    @Transactional
    void createPaySlipLine() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);
        var returnedPaySlipLineDTO = om.readValue(
            restPaySlipLineMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PaySlipLineDTO.class
        );

        // Validate the PaySlipLine in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPaySlipLine = paySlipLineMapper.toEntity(returnedPaySlipLineDTO);
        assertPaySlipLineUpdatableFieldsEquals(returnedPaySlipLine, getPersistedPaySlipLine(returnedPaySlipLine));

        insertedPaySlipLine = returnedPaySlipLine;
    }

    @Test
    @Transactional
    void createPaySlipLineWithExistingId() throws Exception {
        // Create the PaySlipLine with an existing ID
        paySlipLine.setId(1L);
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSortOrderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlipLine.setSortOrder(null);

        // Create the PaySlipLine, which fails.
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRubriqueCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlipLine.setRubriqueCode(null);

        // Create the PaySlipLine, which fails.
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRubriqueLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlipLine.setRubriqueLabel(null);

        // Create the PaySlipLine, which fails.
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRubriqueTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlipLine.setRubriqueType(null);

        // Create the PaySlipLine, which fails.
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlipLine.setAmount(null);

        // Create the PaySlipLine, which fails.
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTaxableIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlipLine.setTaxable(null);

        // Create the PaySlipLine, which fails.
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        restPaySlipLineMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPaySlipLines() throws Exception {
        // Initialize the database
        insertedPaySlipLine = paySlipLineRepository.saveAndFlush(paySlipLine);

        // Get all the paySlipLineList
        restPaySlipLineMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(paySlipLine.getId().intValue())))
            .andExpect(jsonPath("$.[*].sortOrder").value(hasItem(DEFAULT_SORT_ORDER)))
            .andExpect(jsonPath("$.[*].rubriqueCode").value(hasItem(DEFAULT_RUBRIQUE_CODE)))
            .andExpect(jsonPath("$.[*].rubriqueLabel").value(hasItem(DEFAULT_RUBRIQUE_LABEL)))
            .andExpect(jsonPath("$.[*].rubriqueType").value(hasItem(DEFAULT_RUBRIQUE_TYPE.toString())))
            .andExpect(jsonPath("$.[*].base").value(hasItem(sameNumber(DEFAULT_BASE))))
            .andExpect(jsonPath("$.[*].rate").value(hasItem(sameNumber(DEFAULT_RATE))))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].taxable").value(hasItem(DEFAULT_TAXABLE)));
    }

    @Test
    @Transactional
    void getPaySlipLine() throws Exception {
        // Initialize the database
        insertedPaySlipLine = paySlipLineRepository.saveAndFlush(paySlipLine);

        // Get the paySlipLine
        restPaySlipLineMockMvc
            .perform(get(ENTITY_API_URL_ID, paySlipLine.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(paySlipLine.getId().intValue()))
            .andExpect(jsonPath("$.sortOrder").value(DEFAULT_SORT_ORDER))
            .andExpect(jsonPath("$.rubriqueCode").value(DEFAULT_RUBRIQUE_CODE))
            .andExpect(jsonPath("$.rubriqueLabel").value(DEFAULT_RUBRIQUE_LABEL))
            .andExpect(jsonPath("$.rubriqueType").value(DEFAULT_RUBRIQUE_TYPE.toString()))
            .andExpect(jsonPath("$.base").value(sameNumber(DEFAULT_BASE)))
            .andExpect(jsonPath("$.rate").value(sameNumber(DEFAULT_RATE)))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.taxable").value(DEFAULT_TAXABLE));
    }

    @Test
    @Transactional
    void getNonExistingPaySlipLine() throws Exception {
        // Get the paySlipLine
        restPaySlipLineMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPaySlipLine() throws Exception {
        // Initialize the database
        insertedPaySlipLine = paySlipLineRepository.saveAndFlush(paySlipLine);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the paySlipLine
        PaySlipLine updatedPaySlipLine = paySlipLineRepository.findById(paySlipLine.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPaySlipLine are not directly saved in db
        em.detach(updatedPaySlipLine);
        updatedPaySlipLine
            .sortOrder(UPDATED_SORT_ORDER)
            .rubriqueCode(UPDATED_RUBRIQUE_CODE)
            .rubriqueLabel(UPDATED_RUBRIQUE_LABEL)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .base(UPDATED_BASE)
            .rate(UPDATED_RATE)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE);
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(updatedPaySlipLine);

        restPaySlipLineMockMvc
            .perform(
                put(ENTITY_API_URL_ID, paySlipLineDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(paySlipLineDTO))
            )
            .andExpect(status().isOk());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPaySlipLineToMatchAllProperties(updatedPaySlipLine);
    }

    @Test
    @Transactional
    void putNonExistingPaySlipLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlipLine.setId(longCount.incrementAndGet());

        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPaySlipLineMockMvc
            .perform(
                put(ENTITY_API_URL_ID, paySlipLineDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(paySlipLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPaySlipLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlipLine.setId(longCount.incrementAndGet());

        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipLineMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(paySlipLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPaySlipLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlipLine.setId(longCount.incrementAndGet());

        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipLineMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePaySlipLineWithPatch() throws Exception {
        // Initialize the database
        insertedPaySlipLine = paySlipLineRepository.saveAndFlush(paySlipLine);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the paySlipLine using partial update
        PaySlipLine partialUpdatedPaySlipLine = new PaySlipLine();
        partialUpdatedPaySlipLine.setId(paySlipLine.getId());

        partialUpdatedPaySlipLine
            .rubriqueCode(UPDATED_RUBRIQUE_CODE)
            .rubriqueLabel(UPDATED_RUBRIQUE_LABEL)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .amount(UPDATED_AMOUNT);

        restPaySlipLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPaySlipLine.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPaySlipLine))
            )
            .andExpect(status().isOk());

        // Validate the PaySlipLine in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPaySlipLineUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedPaySlipLine, paySlipLine),
            getPersistedPaySlipLine(paySlipLine)
        );
    }

    @Test
    @Transactional
    void fullUpdatePaySlipLineWithPatch() throws Exception {
        // Initialize the database
        insertedPaySlipLine = paySlipLineRepository.saveAndFlush(paySlipLine);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the paySlipLine using partial update
        PaySlipLine partialUpdatedPaySlipLine = new PaySlipLine();
        partialUpdatedPaySlipLine.setId(paySlipLine.getId());

        partialUpdatedPaySlipLine
            .sortOrder(UPDATED_SORT_ORDER)
            .rubriqueCode(UPDATED_RUBRIQUE_CODE)
            .rubriqueLabel(UPDATED_RUBRIQUE_LABEL)
            .rubriqueType(UPDATED_RUBRIQUE_TYPE)
            .base(UPDATED_BASE)
            .rate(UPDATED_RATE)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE);

        restPaySlipLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPaySlipLine.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPaySlipLine))
            )
            .andExpect(status().isOk());

        // Validate the PaySlipLine in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPaySlipLineUpdatableFieldsEquals(partialUpdatedPaySlipLine, getPersistedPaySlipLine(partialUpdatedPaySlipLine));
    }

    @Test
    @Transactional
    void patchNonExistingPaySlipLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlipLine.setId(longCount.incrementAndGet());

        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPaySlipLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, paySlipLineDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(paySlipLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPaySlipLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlipLine.setId(longCount.incrementAndGet());

        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipLineMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(paySlipLineDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPaySlipLine() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlipLine.setId(longCount.incrementAndGet());

        // Create the PaySlipLine
        PaySlipLineDTO paySlipLineDTO = paySlipLineMapper.toDto(paySlipLine);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipLineMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(paySlipLineDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PaySlipLine in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePaySlipLine() throws Exception {
        // Initialize the database
        insertedPaySlipLine = paySlipLineRepository.saveAndFlush(paySlipLine);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the paySlipLine
        restPaySlipLineMockMvc
            .perform(delete(ENTITY_API_URL_ID, paySlipLine.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return paySlipLineRepository.count();
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

    protected PaySlipLine getPersistedPaySlipLine(PaySlipLine paySlipLine) {
        return paySlipLineRepository.findById(paySlipLine.getId()).orElseThrow();
    }

    protected void assertPersistedPaySlipLineToMatchAllProperties(PaySlipLine expectedPaySlipLine) {
        assertPaySlipLineAllPropertiesEquals(expectedPaySlipLine, getPersistedPaySlipLine(expectedPaySlipLine));
    }

    protected void assertPersistedPaySlipLineToMatchUpdatableProperties(PaySlipLine expectedPaySlipLine) {
        assertPaySlipLineAllUpdatablePropertiesEquals(expectedPaySlipLine, getPersistedPaySlipLine(expectedPaySlipLine));
    }
}
