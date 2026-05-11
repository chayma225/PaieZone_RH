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
import tn.paiezone.rh.domain.Advance;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;
import tn.paiezone.rh.repository.AdvanceRepository;
import tn.paiezone.rh.service.dto.AdvanceDTO;
import tn.paiezone.rh.service.mapper.AdvanceMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.AdvanceAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

/**
 * Integration tests for the {@link AdvanceResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class AdvanceResourceIT {

    private static final LocalDate DEFAULT_REQUEST_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_REQUEST_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_REQUEST_DATE = LocalDate.ofEpochDay(-1L);

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_AMOUNT = new BigDecimal(1 - 1);

    private static final Integer DEFAULT_DEDUCTION_MONTH = 1;
    private static final Integer UPDATED_DEDUCTION_MONTH = 2;
    private static final Integer SMALLER_DEDUCTION_MONTH = 1 - 1;

    private static final Integer DEFAULT_DEDUCTION_YEAR = 1;
    private static final Integer UPDATED_DEDUCTION_YEAR = 2;
    private static final Integer SMALLER_DEDUCTION_YEAR = 1 - 1;

    private static final AdvanceStatus DEFAULT_STATUS = AdvanceStatus.REQUESTED;
    private static final AdvanceStatus UPDATED_STATUS = AdvanceStatus.APPROVED;

    private static final String DEFAULT_APPROVED_BY = "AAAAAAAAAA";
    private static final String UPDATED_APPROVED_BY = "BBBBBBBBBB";

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/advances";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AdvanceRepository advanceRepository;

    @Autowired
    private AdvanceMapper advanceMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAdvanceMockMvc;

    private Advance advance;

    private Advance insertedAdvance;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Advance createEntity(EntityManager em) {
        Advance advance = new Advance()
            .requestDate(DEFAULT_REQUEST_DATE)
            .amount(DEFAULT_AMOUNT)
            .deductionMonth(DEFAULT_DEDUCTION_MONTH)
            .deductionYear(DEFAULT_DEDUCTION_YEAR)
            .status(DEFAULT_STATUS)
            .approvedBy(DEFAULT_APPROVED_BY)
            .notes(DEFAULT_NOTES);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        advance.setEmployee(employee);
        return advance;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Advance createUpdatedEntity(EntityManager em) {
        Advance updatedAdvance = new Advance()
            .requestDate(UPDATED_REQUEST_DATE)
            .amount(UPDATED_AMOUNT)
            .deductionMonth(UPDATED_DEDUCTION_MONTH)
            .deductionYear(UPDATED_DEDUCTION_YEAR)
            .status(UPDATED_STATUS)
            .approvedBy(UPDATED_APPROVED_BY)
            .notes(UPDATED_NOTES);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedAdvance.setEmployee(employee);
        return updatedAdvance;
    }

    @BeforeEach
    void initTest() {
        advance = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedAdvance != null) {
            advanceRepository.delete(insertedAdvance);
            insertedAdvance = null;
        }
    }

    @Test
    @Transactional
    void createAdvance() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);
        var returnedAdvanceDTO = om.readValue(
            restAdvanceMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AdvanceDTO.class
        );

        // Validate the Advance in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAdvance = advanceMapper.toEntity(returnedAdvanceDTO);
        assertAdvanceUpdatableFieldsEquals(returnedAdvance, getPersistedAdvance(returnedAdvance));

        insertedAdvance = returnedAdvance;
    }

    @Test
    @Transactional
    void createAdvanceWithExistingId() throws Exception {
        // Create the Advance with an existing ID
        advance.setId(1L);
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAdvanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRequestDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advance.setRequestDate(null);

        // Create the Advance, which fails.
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        restAdvanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advance.setAmount(null);

        // Create the Advance, which fails.
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        restAdvanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        advance.setStatus(null);

        // Create the Advance, which fails.
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        restAdvanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAdvances() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList
        restAdvanceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(advance.getId().intValue())))
            .andExpect(jsonPath("$.[*].requestDate").value(hasItem(DEFAULT_REQUEST_DATE.toString())))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].deductionMonth").value(hasItem(DEFAULT_DEDUCTION_MONTH)))
            .andExpect(jsonPath("$.[*].deductionYear").value(hasItem(DEFAULT_DEDUCTION_YEAR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].approvedBy").value(hasItem(DEFAULT_APPROVED_BY)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getAdvance() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get the advance
        restAdvanceMockMvc
            .perform(get(ENTITY_API_URL_ID, advance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(advance.getId().intValue()))
            .andExpect(jsonPath("$.requestDate").value(DEFAULT_REQUEST_DATE.toString()))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.deductionMonth").value(DEFAULT_DEDUCTION_MONTH))
            .andExpect(jsonPath("$.deductionYear").value(DEFAULT_DEDUCTION_YEAR))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.approvedBy").value(DEFAULT_APPROVED_BY))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getAdvancesByIdFiltering() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        Long id = advance.getId();

        defaultAdvanceFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultAdvanceFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultAdvanceFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate equals to
        defaultAdvanceFiltering("requestDate.equals=" + DEFAULT_REQUEST_DATE, "requestDate.equals=" + UPDATED_REQUEST_DATE);
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate in
        defaultAdvanceFiltering(
            "requestDate.in=" + DEFAULT_REQUEST_DATE + "," + UPDATED_REQUEST_DATE,
            "requestDate.in=" + UPDATED_REQUEST_DATE
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate is not null
        defaultAdvanceFiltering("requestDate.specified=true", "requestDate.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate is greater than or equal to
        defaultAdvanceFiltering(
            "requestDate.greaterThanOrEqual=" + DEFAULT_REQUEST_DATE,
            "requestDate.greaterThanOrEqual=" + UPDATED_REQUEST_DATE
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate is less than or equal to
        defaultAdvanceFiltering(
            "requestDate.lessThanOrEqual=" + DEFAULT_REQUEST_DATE,
            "requestDate.lessThanOrEqual=" + SMALLER_REQUEST_DATE
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate is less than
        defaultAdvanceFiltering("requestDate.lessThan=" + UPDATED_REQUEST_DATE, "requestDate.lessThan=" + DEFAULT_REQUEST_DATE);
    }

    @Test
    @Transactional
    void getAllAdvancesByRequestDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where requestDate is greater than
        defaultAdvanceFiltering("requestDate.greaterThan=" + SMALLER_REQUEST_DATE, "requestDate.greaterThan=" + DEFAULT_REQUEST_DATE);
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount equals to
        defaultAdvanceFiltering("amount.equals=" + DEFAULT_AMOUNT, "amount.equals=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount in
        defaultAdvanceFiltering("amount.in=" + DEFAULT_AMOUNT + "," + UPDATED_AMOUNT, "amount.in=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount is not null
        defaultAdvanceFiltering("amount.specified=true", "amount.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount is greater than or equal to
        defaultAdvanceFiltering("amount.greaterThanOrEqual=" + DEFAULT_AMOUNT, "amount.greaterThanOrEqual=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount is less than or equal to
        defaultAdvanceFiltering("amount.lessThanOrEqual=" + DEFAULT_AMOUNT, "amount.lessThanOrEqual=" + SMALLER_AMOUNT);
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount is less than
        defaultAdvanceFiltering("amount.lessThan=" + UPDATED_AMOUNT, "amount.lessThan=" + DEFAULT_AMOUNT);
    }

    @Test
    @Transactional
    void getAllAdvancesByAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where amount is greater than
        defaultAdvanceFiltering("amount.greaterThan=" + SMALLER_AMOUNT, "amount.greaterThan=" + DEFAULT_AMOUNT);
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth equals to
        defaultAdvanceFiltering("deductionMonth.equals=" + DEFAULT_DEDUCTION_MONTH, "deductionMonth.equals=" + UPDATED_DEDUCTION_MONTH);
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth in
        defaultAdvanceFiltering(
            "deductionMonth.in=" + DEFAULT_DEDUCTION_MONTH + "," + UPDATED_DEDUCTION_MONTH,
            "deductionMonth.in=" + UPDATED_DEDUCTION_MONTH
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth is not null
        defaultAdvanceFiltering("deductionMonth.specified=true", "deductionMonth.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth is greater than or equal to
        defaultAdvanceFiltering(
            "deductionMonth.greaterThanOrEqual=" + DEFAULT_DEDUCTION_MONTH,
            "deductionMonth.greaterThanOrEqual=" + (DEFAULT_DEDUCTION_MONTH + 1)
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth is less than or equal to
        defaultAdvanceFiltering(
            "deductionMonth.lessThanOrEqual=" + DEFAULT_DEDUCTION_MONTH,
            "deductionMonth.lessThanOrEqual=" + SMALLER_DEDUCTION_MONTH
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth is less than
        defaultAdvanceFiltering(
            "deductionMonth.lessThan=" + (DEFAULT_DEDUCTION_MONTH + 1),
            "deductionMonth.lessThan=" + DEFAULT_DEDUCTION_MONTH
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionMonthIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionMonth is greater than
        defaultAdvanceFiltering(
            "deductionMonth.greaterThan=" + SMALLER_DEDUCTION_MONTH,
            "deductionMonth.greaterThan=" + DEFAULT_DEDUCTION_MONTH
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear equals to
        defaultAdvanceFiltering("deductionYear.equals=" + DEFAULT_DEDUCTION_YEAR, "deductionYear.equals=" + UPDATED_DEDUCTION_YEAR);
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear in
        defaultAdvanceFiltering(
            "deductionYear.in=" + DEFAULT_DEDUCTION_YEAR + "," + UPDATED_DEDUCTION_YEAR,
            "deductionYear.in=" + UPDATED_DEDUCTION_YEAR
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear is not null
        defaultAdvanceFiltering("deductionYear.specified=true", "deductionYear.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear is greater than or equal to
        defaultAdvanceFiltering(
            "deductionYear.greaterThanOrEqual=" + DEFAULT_DEDUCTION_YEAR,
            "deductionYear.greaterThanOrEqual=" + UPDATED_DEDUCTION_YEAR
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear is less than or equal to
        defaultAdvanceFiltering(
            "deductionYear.lessThanOrEqual=" + DEFAULT_DEDUCTION_YEAR,
            "deductionYear.lessThanOrEqual=" + SMALLER_DEDUCTION_YEAR
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear is less than
        defaultAdvanceFiltering("deductionYear.lessThan=" + UPDATED_DEDUCTION_YEAR, "deductionYear.lessThan=" + DEFAULT_DEDUCTION_YEAR);
    }

    @Test
    @Transactional
    void getAllAdvancesByDeductionYearIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where deductionYear is greater than
        defaultAdvanceFiltering(
            "deductionYear.greaterThan=" + SMALLER_DEDUCTION_YEAR,
            "deductionYear.greaterThan=" + DEFAULT_DEDUCTION_YEAR
        );
    }

    @Test
    @Transactional
    void getAllAdvancesByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where status equals to
        defaultAdvanceFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllAdvancesByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where status in
        defaultAdvanceFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllAdvancesByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where status is not null
        defaultAdvanceFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByApprovedByIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where approvedBy equals to
        defaultAdvanceFiltering("approvedBy.equals=" + DEFAULT_APPROVED_BY, "approvedBy.equals=" + UPDATED_APPROVED_BY);
    }

    @Test
    @Transactional
    void getAllAdvancesByApprovedByIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where approvedBy in
        defaultAdvanceFiltering("approvedBy.in=" + DEFAULT_APPROVED_BY + "," + UPDATED_APPROVED_BY, "approvedBy.in=" + UPDATED_APPROVED_BY);
    }

    @Test
    @Transactional
    void getAllAdvancesByApprovedByIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where approvedBy is not null
        defaultAdvanceFiltering("approvedBy.specified=true", "approvedBy.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByApprovedByContainsSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where approvedBy contains
        defaultAdvanceFiltering("approvedBy.contains=" + DEFAULT_APPROVED_BY, "approvedBy.contains=" + UPDATED_APPROVED_BY);
    }

    @Test
    @Transactional
    void getAllAdvancesByApprovedByNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where approvedBy does not contain
        defaultAdvanceFiltering("approvedBy.doesNotContain=" + UPDATED_APPROVED_BY, "approvedBy.doesNotContain=" + DEFAULT_APPROVED_BY);
    }

    @Test
    @Transactional
    void getAllAdvancesByNotesIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where notes equals to
        defaultAdvanceFiltering("notes.equals=" + DEFAULT_NOTES, "notes.equals=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllAdvancesByNotesIsInShouldWork() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where notes in
        defaultAdvanceFiltering("notes.in=" + DEFAULT_NOTES + "," + UPDATED_NOTES, "notes.in=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllAdvancesByNotesIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where notes is not null
        defaultAdvanceFiltering("notes.specified=true", "notes.specified=false");
    }

    @Test
    @Transactional
    void getAllAdvancesByNotesContainsSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where notes contains
        defaultAdvanceFiltering("notes.contains=" + DEFAULT_NOTES, "notes.contains=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllAdvancesByNotesNotContainsSomething() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        // Get all the advanceList where notes does not contain
        defaultAdvanceFiltering("notes.doesNotContain=" + UPDATED_NOTES, "notes.doesNotContain=" + DEFAULT_NOTES);
    }

    @Test
    @Transactional
    void getAllAdvancesByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            advanceRepository.saveAndFlush(advance);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        advance.setEmployee(employee);
        advanceRepository.saveAndFlush(advance);
        Long employeeId = employee.getId();
        // Get all the advanceList where employee equals to employeeId
        defaultAdvanceShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the advanceList where employee equals to (employeeId + 1)
        defaultAdvanceShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllAdvancesByPaySlipIsEqualToSomething() throws Exception {
        PaySlip paySlip;
        if (TestUtil.findAll(em, PaySlip.class).isEmpty()) {
            advanceRepository.saveAndFlush(advance);
            paySlip = PaySlipResourceIT.createEntity(em);
        } else {
            paySlip = TestUtil.findAll(em, PaySlip.class).get(0);
        }
        em.persist(paySlip);
        em.flush();
        advance.setPaySlip(paySlip);
        advanceRepository.saveAndFlush(advance);
        Long paySlipId = paySlip.getId();
        // Get all the advanceList where paySlip equals to paySlipId
        defaultAdvanceShouldBeFound("paySlipId.equals=" + paySlipId);

        // Get all the advanceList where paySlip equals to (paySlipId + 1)
        defaultAdvanceShouldNotBeFound("paySlipId.equals=" + (paySlipId + 1));
    }

    @Test
    @Transactional
    void getAllAdvancesByApprovedByUserIsEqualToSomething() throws Exception {
        UserProfile approvedByUser;
        if (TestUtil.findAll(em, UserProfile.class).isEmpty()) {
            advanceRepository.saveAndFlush(advance);
            approvedByUser = UserProfileResourceIT.createEntity(em);
        } else {
            approvedByUser = TestUtil.findAll(em, UserProfile.class).get(0);
        }
        em.persist(approvedByUser);
        em.flush();
        advance.setApprovedBy("admin");
        advanceRepository.saveAndFlush(advance);
        Long approvedByUserId = approvedByUser.getId();
        // Get all the advanceList where approvedByUser equals to approvedByUserId
        defaultAdvanceShouldBeFound("approvedByUserId.equals=" + approvedByUserId);

        // Get all the advanceList where approvedByUser equals to (approvedByUserId + 1)
        defaultAdvanceShouldNotBeFound("approvedByUserId.equals=" + (approvedByUserId + 1));
    }

    private void defaultAdvanceFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultAdvanceShouldBeFound(shouldBeFound);
        defaultAdvanceShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultAdvanceShouldBeFound(String filter) throws Exception {
        restAdvanceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(advance.getId().intValue())))
            .andExpect(jsonPath("$.[*].requestDate").value(hasItem(DEFAULT_REQUEST_DATE.toString())))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].deductionMonth").value(hasItem(DEFAULT_DEDUCTION_MONTH)))
            .andExpect(jsonPath("$.[*].deductionYear").value(hasItem(DEFAULT_DEDUCTION_YEAR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].approvedBy").value(hasItem(DEFAULT_APPROVED_BY)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restAdvanceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultAdvanceShouldNotBeFound(String filter) throws Exception {
        restAdvanceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restAdvanceMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingAdvance() throws Exception {
        // Get the advance
        restAdvanceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAdvance() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the advance
        Advance updatedAdvance = advanceRepository.findById(advance.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedAdvance are not directly saved in db
        em.detach(updatedAdvance);
        updatedAdvance
            .requestDate(UPDATED_REQUEST_DATE)
            .amount(UPDATED_AMOUNT)
            .deductionMonth(UPDATED_DEDUCTION_MONTH)
            .deductionYear(UPDATED_DEDUCTION_YEAR)
            .status(UPDATED_STATUS)
            .approvedBy(UPDATED_APPROVED_BY)
            .notes(UPDATED_NOTES);
        AdvanceDTO advanceDTO = advanceMapper.toDto(updatedAdvance);

        restAdvanceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, advanceDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO))
            )
            .andExpect(status().isOk());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAdvanceToMatchAllProperties(updatedAdvance);
    }

    @Test
    @Transactional
    void putNonExistingAdvance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advance.setId(longCount.incrementAndGet());

        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAdvanceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, advanceDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAdvance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advance.setId(longCount.incrementAndGet());

        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAdvanceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(advanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAdvance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advance.setId(longCount.incrementAndGet());

        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAdvanceMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(advanceDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAdvanceWithPatch() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the advance using partial update
        Advance partialUpdatedAdvance = new Advance();
        partialUpdatedAdvance.setId(advance.getId());

        partialUpdatedAdvance.deductionMonth(UPDATED_DEDUCTION_MONTH).approvedBy(UPDATED_APPROVED_BY);

        restAdvanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAdvance.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAdvance))
            )
            .andExpect(status().isOk());

        // Validate the Advance in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAdvanceUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedAdvance, advance), getPersistedAdvance(advance));
    }

    @Test
    @Transactional
    void fullUpdateAdvanceWithPatch() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the advance using partial update
        Advance partialUpdatedAdvance = new Advance();
        partialUpdatedAdvance.setId(advance.getId());

        partialUpdatedAdvance
            .requestDate(UPDATED_REQUEST_DATE)
            .amount(UPDATED_AMOUNT)
            .deductionMonth(UPDATED_DEDUCTION_MONTH)
            .deductionYear(UPDATED_DEDUCTION_YEAR)
            .status(UPDATED_STATUS)
            .approvedBy(UPDATED_APPROVED_BY)
            .notes(UPDATED_NOTES);

        restAdvanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAdvance.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAdvance))
            )
            .andExpect(status().isOk());

        // Validate the Advance in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAdvanceUpdatableFieldsEquals(partialUpdatedAdvance, getPersistedAdvance(partialUpdatedAdvance));
    }

    @Test
    @Transactional
    void patchNonExistingAdvance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advance.setId(longCount.incrementAndGet());

        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAdvanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, advanceDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(advanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAdvance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advance.setId(longCount.incrementAndGet());

        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAdvanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(advanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAdvance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        advance.setId(longCount.incrementAndGet());

        // Create the Advance
        AdvanceDTO advanceDTO = advanceMapper.toDto(advance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAdvanceMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(advanceDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Advance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAdvance() throws Exception {
        // Initialize the database
        insertedAdvance = advanceRepository.saveAndFlush(advance);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the advance
        restAdvanceMockMvc
            .perform(delete(ENTITY_API_URL_ID, advance.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return advanceRepository.count();
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

    protected Advance getPersistedAdvance(Advance advance) {
        return advanceRepository.findById(advance.getId()).orElseThrow();
    }

    protected void assertPersistedAdvanceToMatchAllProperties(Advance expectedAdvance) {
        assertAdvanceAllPropertiesEquals(expectedAdvance, getPersistedAdvance(expectedAdvance));
    }

    protected void assertPersistedAdvanceToMatchUpdatableProperties(Advance expectedAdvance) {
        assertAdvanceAllUpdatablePropertiesEquals(expectedAdvance, getPersistedAdvance(expectedAdvance));
    }
}
