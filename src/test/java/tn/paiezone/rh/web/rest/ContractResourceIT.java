package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.ContractAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
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
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.domain.enumeration.ContractType;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.mapper.ContractMapper;

/**
 * Integration tests for the {@link ContractResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class ContractResourceIT {

    private static final String DEFAULT_REFERENCE = "AAAAAAAAAA";
    private static final String UPDATED_REFERENCE = "BBBBBBBBBB";

    private static final ContractType DEFAULT_CONTRACT_TYPE = ContractType.CDI;
    private static final ContractType UPDATED_CONTRACT_TYPE = ContractType.CDD;

    private static final ContractStatus DEFAULT_STATUS = ContractStatus.DRAFT;
    private static final ContractStatus UPDATED_STATUS = ContractStatus.ACTIVE;

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_START_DATE = LocalDate.ofEpochDay(-1L);

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_END_DATE = LocalDate.ofEpochDay(-1L);

    private static final LocalDate DEFAULT_SIGNED_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_SIGNED_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_SIGNED_DATE = LocalDate.ofEpochDay(-1L);

    private static final BigDecimal DEFAULT_BASE_SALARY = new BigDecimal(1);
    private static final BigDecimal UPDATED_BASE_SALARY = new BigDecimal(2);
    private static final BigDecimal SMALLER_BASE_SALARY = new BigDecimal(1 - 1);

    private static final Integer DEFAULT_WORKING_HOURS_WEEK = 1;
    private static final Integer UPDATED_WORKING_HOURS_WEEK = 2;
    private static final Integer SMALLER_WORKING_HOURS_WEEK = 1 - 1;

    private static final Integer DEFAULT_WORKING_DAYS_WEEK = 1;
    private static final Integer UPDATED_WORKING_DAYS_WEEK = 2;
    private static final Integer SMALLER_WORKING_DAYS_WEEK = 1 - 1;

    private static final String DEFAULT_CONVENTION_COLLECTIVE = "AAAAAAAAAA";
    private static final String UPDATED_CONVENTION_COLLECTIVE = "BBBBBBBBBB";

    private static final Integer DEFAULT_TRIAL_PERIOD_MONTHS = 0;
    private static final Integer UPDATED_TRIAL_PERIOD_MONTHS = 1;
    private static final Integer SMALLER_TRIAL_PERIOD_MONTHS = 0 - 1;

    private static final Integer DEFAULT_RENEWAL_COUNT = 0;
    private static final Integer UPDATED_RENEWAL_COUNT = 1;
    private static final Integer SMALLER_RENEWAL_COUNT = 0 - 1;

    private static final String DEFAULT_DOCUMENT_URL = "AAAAAAAAAA";
    private static final String UPDATED_DOCUMENT_URL = "BBBBBBBBBB";

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/contracts";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractMapper contractMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restContractMockMvc;

    private Contract contract;

    private Contract insertedContract;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Contract createEntity(EntityManager em) {
        Contract contract = new Contract()
            .reference(DEFAULT_REFERENCE)
            .contractType(DEFAULT_CONTRACT_TYPE)
            .status(DEFAULT_STATUS)
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE)
            .signedDate(DEFAULT_SIGNED_DATE)
            .baseSalary(DEFAULT_BASE_SALARY)
            .workingHoursWeek(DEFAULT_WORKING_HOURS_WEEK)
            .workingDaysWeek(DEFAULT_WORKING_DAYS_WEEK)
            .conventionCollective(DEFAULT_CONVENTION_COLLECTIVE)
            .trialPeriodMonths(DEFAULT_TRIAL_PERIOD_MONTHS)
            .renewalCount(DEFAULT_RENEWAL_COUNT)
            .documentUrl(DEFAULT_DOCUMENT_URL)
            .notes(DEFAULT_NOTES)
            .createdAt(DEFAULT_CREATED_AT);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        contract.setEmployee(employee);
        return contract;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Contract createUpdatedEntity(EntityManager em) {
        Contract updatedContract = new Contract()
            .reference(UPDATED_REFERENCE)
            .contractType(UPDATED_CONTRACT_TYPE)
            .status(UPDATED_STATUS)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .signedDate(UPDATED_SIGNED_DATE)
            .baseSalary(UPDATED_BASE_SALARY)
            .workingHoursWeek(UPDATED_WORKING_HOURS_WEEK)
            .workingDaysWeek(UPDATED_WORKING_DAYS_WEEK)
            .conventionCollective(UPDATED_CONVENTION_COLLECTIVE)
            .trialPeriodMonths(UPDATED_TRIAL_PERIOD_MONTHS)
            .renewalCount(UPDATED_RENEWAL_COUNT)
            .documentUrl(UPDATED_DOCUMENT_URL)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedContract.setEmployee(employee);
        return updatedContract;
    }

    @BeforeEach
    void initTest() {
        contract = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedContract != null) {
            contractRepository.delete(insertedContract);
            insertedContract = null;
        }
    }

    @Test
    @Transactional
    void createContract() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);
        var returnedContractDTO = om.readValue(
            restContractMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ContractDTO.class
        );

        // Validate the Contract in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedContract = contractMapper.toEntity(returnedContractDTO);
        assertContractUpdatableFieldsEquals(returnedContract, getPersistedContract(returnedContract));

        insertedContract = returnedContract;
    }

    @Test
    @Transactional
    void createContractWithExistingId() throws Exception {
        // Create the Contract with an existing ID
        contract.setId(1L);
        ContractDTO contractDTO = contractMapper.toDto(contract);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkReferenceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setReference(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkContractTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setContractType(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setStatus(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStartDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setStartDate(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBaseSalaryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setBaseSalary(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkWorkingHoursWeekIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setWorkingHoursWeek(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkWorkingDaysWeekIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setWorkingDaysWeek(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        contract.setCreatedAt(null);

        // Create the Contract, which fails.
        ContractDTO contractDTO = contractMapper.toDto(contract);

        restContractMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllContracts() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList
        restContractMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(contract.getId().intValue())))
            .andExpect(jsonPath("$.[*].reference").value(hasItem(DEFAULT_REFERENCE)))
            .andExpect(jsonPath("$.[*].contractType").value(hasItem(DEFAULT_CONTRACT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].signedDate").value(hasItem(DEFAULT_SIGNED_DATE.toString())))
            .andExpect(jsonPath("$.[*].baseSalary").value(hasItem(sameNumber(DEFAULT_BASE_SALARY))))
            .andExpect(jsonPath("$.[*].workingHoursWeek").value(hasItem(DEFAULT_WORKING_HOURS_WEEK)))
            .andExpect(jsonPath("$.[*].workingDaysWeek").value(hasItem(DEFAULT_WORKING_DAYS_WEEK)))
            .andExpect(jsonPath("$.[*].conventionCollective").value(hasItem(DEFAULT_CONVENTION_COLLECTIVE)))
            .andExpect(jsonPath("$.[*].trialPeriodMonths").value(hasItem(DEFAULT_TRIAL_PERIOD_MONTHS)))
            .andExpect(jsonPath("$.[*].renewalCount").value(hasItem(DEFAULT_RENEWAL_COUNT)))
            .andExpect(jsonPath("$.[*].documentUrl").value(hasItem(DEFAULT_DOCUMENT_URL)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @Test
    @Transactional
    void getContract() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get the contract
        restContractMockMvc
            .perform(get(ENTITY_API_URL_ID, contract.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(contract.getId().intValue()))
            .andExpect(jsonPath("$.reference").value(DEFAULT_REFERENCE))
            .andExpect(jsonPath("$.contractType").value(DEFAULT_CONTRACT_TYPE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()))
            .andExpect(jsonPath("$.signedDate").value(DEFAULT_SIGNED_DATE.toString()))
            .andExpect(jsonPath("$.baseSalary").value(sameNumber(DEFAULT_BASE_SALARY)))
            .andExpect(jsonPath("$.workingHoursWeek").value(DEFAULT_WORKING_HOURS_WEEK))
            .andExpect(jsonPath("$.workingDaysWeek").value(DEFAULT_WORKING_DAYS_WEEK))
            .andExpect(jsonPath("$.conventionCollective").value(DEFAULT_CONVENTION_COLLECTIVE))
            .andExpect(jsonPath("$.trialPeriodMonths").value(DEFAULT_TRIAL_PERIOD_MONTHS))
            .andExpect(jsonPath("$.renewalCount").value(DEFAULT_RENEWAL_COUNT))
            .andExpect(jsonPath("$.documentUrl").value(DEFAULT_DOCUMENT_URL))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getContractsByIdFiltering() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        Long id = contract.getId();

        defaultContractFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultContractFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultContractFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllContractsByReferenceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where reference equals to
        defaultContractFiltering("reference.equals=" + DEFAULT_REFERENCE, "reference.equals=" + UPDATED_REFERENCE);
    }

    @Test
    @Transactional
    void getAllContractsByReferenceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where reference in
        defaultContractFiltering("reference.in=" + DEFAULT_REFERENCE + "," + UPDATED_REFERENCE, "reference.in=" + UPDATED_REFERENCE);
    }

    @Test
    @Transactional
    void getAllContractsByReferenceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where reference is not null
        defaultContractFiltering("reference.specified=true", "reference.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByReferenceContainsSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where reference contains
        defaultContractFiltering("reference.contains=" + DEFAULT_REFERENCE, "reference.contains=" + UPDATED_REFERENCE);
    }

    @Test
    @Transactional
    void getAllContractsByReferenceNotContainsSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where reference does not contain
        defaultContractFiltering("reference.doesNotContain=" + UPDATED_REFERENCE, "reference.doesNotContain=" + DEFAULT_REFERENCE);
    }

    @Test
    @Transactional
    void getAllContractsByContractTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where contractType equals to
        defaultContractFiltering("contractType.equals=" + DEFAULT_CONTRACT_TYPE, "contractType.equals=" + UPDATED_CONTRACT_TYPE);
    }

    @Test
    @Transactional
    void getAllContractsByContractTypeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where contractType in
        defaultContractFiltering(
            "contractType.in=" + DEFAULT_CONTRACT_TYPE + "," + UPDATED_CONTRACT_TYPE,
            "contractType.in=" + UPDATED_CONTRACT_TYPE
        );
    }

    @Test
    @Transactional
    void getAllContractsByContractTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where contractType is not null
        defaultContractFiltering("contractType.specified=true", "contractType.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where status equals to
        defaultContractFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllContractsByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where status in
        defaultContractFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllContractsByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where status is not null
        defaultContractFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate equals to
        defaultContractFiltering("startDate.equals=" + DEFAULT_START_DATE, "startDate.equals=" + UPDATED_START_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate in
        defaultContractFiltering("startDate.in=" + DEFAULT_START_DATE + "," + UPDATED_START_DATE, "startDate.in=" + UPDATED_START_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate is not null
        defaultContractFiltering("startDate.specified=true", "startDate.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate is greater than or equal to
        defaultContractFiltering(
            "startDate.greaterThanOrEqual=" + DEFAULT_START_DATE,
            "startDate.greaterThanOrEqual=" + UPDATED_START_DATE
        );
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate is less than or equal to
        defaultContractFiltering("startDate.lessThanOrEqual=" + DEFAULT_START_DATE, "startDate.lessThanOrEqual=" + SMALLER_START_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate is less than
        defaultContractFiltering("startDate.lessThan=" + UPDATED_START_DATE, "startDate.lessThan=" + DEFAULT_START_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByStartDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where startDate is greater than
        defaultContractFiltering("startDate.greaterThan=" + SMALLER_START_DATE, "startDate.greaterThan=" + DEFAULT_START_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate equals to
        defaultContractFiltering("endDate.equals=" + DEFAULT_END_DATE, "endDate.equals=" + UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate in
        defaultContractFiltering("endDate.in=" + DEFAULT_END_DATE + "," + UPDATED_END_DATE, "endDate.in=" + UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate is not null
        defaultContractFiltering("endDate.specified=true", "endDate.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate is greater than or equal to
        defaultContractFiltering("endDate.greaterThanOrEqual=" + DEFAULT_END_DATE, "endDate.greaterThanOrEqual=" + UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate is less than or equal to
        defaultContractFiltering("endDate.lessThanOrEqual=" + DEFAULT_END_DATE, "endDate.lessThanOrEqual=" + SMALLER_END_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate is less than
        defaultContractFiltering("endDate.lessThan=" + UPDATED_END_DATE, "endDate.lessThan=" + DEFAULT_END_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByEndDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where endDate is greater than
        defaultContractFiltering("endDate.greaterThan=" + SMALLER_END_DATE, "endDate.greaterThan=" + DEFAULT_END_DATE);
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate equals to
        defaultContractFiltering("signedDate.equals=" + DEFAULT_SIGNED_DATE, "signedDate.equals=" + UPDATED_SIGNED_DATE);
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate in
        defaultContractFiltering(
            "signedDate.in=" + DEFAULT_SIGNED_DATE + "," + UPDATED_SIGNED_DATE,
            "signedDate.in=" + UPDATED_SIGNED_DATE
        );
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate is not null
        defaultContractFiltering("signedDate.specified=true", "signedDate.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate is greater than or equal to
        defaultContractFiltering(
            "signedDate.greaterThanOrEqual=" + DEFAULT_SIGNED_DATE,
            "signedDate.greaterThanOrEqual=" + UPDATED_SIGNED_DATE
        );
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate is less than or equal to
        defaultContractFiltering("signedDate.lessThanOrEqual=" + DEFAULT_SIGNED_DATE, "signedDate.lessThanOrEqual=" + SMALLER_SIGNED_DATE);
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate is less than
        defaultContractFiltering("signedDate.lessThan=" + UPDATED_SIGNED_DATE, "signedDate.lessThan=" + DEFAULT_SIGNED_DATE);
    }

    @Test
    @Transactional
    void getAllContractsBySignedDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where signedDate is greater than
        defaultContractFiltering("signedDate.greaterThan=" + SMALLER_SIGNED_DATE, "signedDate.greaterThan=" + DEFAULT_SIGNED_DATE);
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary equals to
        defaultContractFiltering("baseSalary.equals=" + DEFAULT_BASE_SALARY, "baseSalary.equals=" + UPDATED_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary in
        defaultContractFiltering(
            "baseSalary.in=" + DEFAULT_BASE_SALARY + "," + UPDATED_BASE_SALARY,
            "baseSalary.in=" + UPDATED_BASE_SALARY
        );
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary is not null
        defaultContractFiltering("baseSalary.specified=true", "baseSalary.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary is greater than or equal to
        defaultContractFiltering(
            "baseSalary.greaterThanOrEqual=" + DEFAULT_BASE_SALARY,
            "baseSalary.greaterThanOrEqual=" + UPDATED_BASE_SALARY
        );
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary is less than or equal to
        defaultContractFiltering("baseSalary.lessThanOrEqual=" + DEFAULT_BASE_SALARY, "baseSalary.lessThanOrEqual=" + SMALLER_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary is less than
        defaultContractFiltering("baseSalary.lessThan=" + UPDATED_BASE_SALARY, "baseSalary.lessThan=" + DEFAULT_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllContractsByBaseSalaryIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where baseSalary is greater than
        defaultContractFiltering("baseSalary.greaterThan=" + SMALLER_BASE_SALARY, "baseSalary.greaterThan=" + DEFAULT_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek equals to
        defaultContractFiltering(
            "workingHoursWeek.equals=" + DEFAULT_WORKING_HOURS_WEEK,
            "workingHoursWeek.equals=" + UPDATED_WORKING_HOURS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek in
        defaultContractFiltering(
            "workingHoursWeek.in=" + DEFAULT_WORKING_HOURS_WEEK + "," + UPDATED_WORKING_HOURS_WEEK,
            "workingHoursWeek.in=" + UPDATED_WORKING_HOURS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek is not null
        defaultContractFiltering("workingHoursWeek.specified=true", "workingHoursWeek.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek is greater than or equal to
        defaultContractFiltering(
            "workingHoursWeek.greaterThanOrEqual=" + DEFAULT_WORKING_HOURS_WEEK,
            "workingHoursWeek.greaterThanOrEqual=" + (DEFAULT_WORKING_HOURS_WEEK + 1)
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek is less than or equal to
        defaultContractFiltering(
            "workingHoursWeek.lessThanOrEqual=" + DEFAULT_WORKING_HOURS_WEEK,
            "workingHoursWeek.lessThanOrEqual=" + SMALLER_WORKING_HOURS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek is less than
        defaultContractFiltering(
            "workingHoursWeek.lessThan=" + (DEFAULT_WORKING_HOURS_WEEK + 1),
            "workingHoursWeek.lessThan=" + DEFAULT_WORKING_HOURS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingHoursWeekIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingHoursWeek is greater than
        defaultContractFiltering(
            "workingHoursWeek.greaterThan=" + SMALLER_WORKING_HOURS_WEEK,
            "workingHoursWeek.greaterThan=" + DEFAULT_WORKING_HOURS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek equals to
        defaultContractFiltering(
            "workingDaysWeek.equals=" + DEFAULT_WORKING_DAYS_WEEK,
            "workingDaysWeek.equals=" + UPDATED_WORKING_DAYS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek in
        defaultContractFiltering(
            "workingDaysWeek.in=" + DEFAULT_WORKING_DAYS_WEEK + "," + UPDATED_WORKING_DAYS_WEEK,
            "workingDaysWeek.in=" + UPDATED_WORKING_DAYS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek is not null
        defaultContractFiltering("workingDaysWeek.specified=true", "workingDaysWeek.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek is greater than or equal to
        defaultContractFiltering(
            "workingDaysWeek.greaterThanOrEqual=" + DEFAULT_WORKING_DAYS_WEEK,
            "workingDaysWeek.greaterThanOrEqual=" + (DEFAULT_WORKING_DAYS_WEEK + 1)
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek is less than or equal to
        defaultContractFiltering(
            "workingDaysWeek.lessThanOrEqual=" + DEFAULT_WORKING_DAYS_WEEK,
            "workingDaysWeek.lessThanOrEqual=" + SMALLER_WORKING_DAYS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek is less than
        defaultContractFiltering(
            "workingDaysWeek.lessThan=" + (DEFAULT_WORKING_DAYS_WEEK + 1),
            "workingDaysWeek.lessThan=" + DEFAULT_WORKING_DAYS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByWorkingDaysWeekIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where workingDaysWeek is greater than
        defaultContractFiltering(
            "workingDaysWeek.greaterThan=" + SMALLER_WORKING_DAYS_WEEK,
            "workingDaysWeek.greaterThan=" + DEFAULT_WORKING_DAYS_WEEK
        );
    }

    @Test
    @Transactional
    void getAllContractsByConventionCollectiveIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where conventionCollective equals to
        defaultContractFiltering(
            "conventionCollective.equals=" + DEFAULT_CONVENTION_COLLECTIVE,
            "conventionCollective.equals=" + UPDATED_CONVENTION_COLLECTIVE
        );
    }

    @Test
    @Transactional
    void getAllContractsByConventionCollectiveIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where conventionCollective in
        defaultContractFiltering(
            "conventionCollective.in=" + DEFAULT_CONVENTION_COLLECTIVE + "," + UPDATED_CONVENTION_COLLECTIVE,
            "conventionCollective.in=" + UPDATED_CONVENTION_COLLECTIVE
        );
    }

    @Test
    @Transactional
    void getAllContractsByConventionCollectiveIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where conventionCollective is not null
        defaultContractFiltering("conventionCollective.specified=true", "conventionCollective.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByConventionCollectiveContainsSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where conventionCollective contains
        defaultContractFiltering(
            "conventionCollective.contains=" + DEFAULT_CONVENTION_COLLECTIVE,
            "conventionCollective.contains=" + UPDATED_CONVENTION_COLLECTIVE
        );
    }

    @Test
    @Transactional
    void getAllContractsByConventionCollectiveNotContainsSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where conventionCollective does not contain
        defaultContractFiltering(
            "conventionCollective.doesNotContain=" + UPDATED_CONVENTION_COLLECTIVE,
            "conventionCollective.doesNotContain=" + DEFAULT_CONVENTION_COLLECTIVE
        );
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths equals to
        defaultContractFiltering(
            "trialPeriodMonths.equals=" + DEFAULT_TRIAL_PERIOD_MONTHS,
            "trialPeriodMonths.equals=" + UPDATED_TRIAL_PERIOD_MONTHS
        );
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths in
        defaultContractFiltering(
            "trialPeriodMonths.in=" + DEFAULT_TRIAL_PERIOD_MONTHS + "," + UPDATED_TRIAL_PERIOD_MONTHS,
            "trialPeriodMonths.in=" + UPDATED_TRIAL_PERIOD_MONTHS
        );
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths is not null
        defaultContractFiltering("trialPeriodMonths.specified=true", "trialPeriodMonths.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths is greater than or equal to
        defaultContractFiltering(
            "trialPeriodMonths.greaterThanOrEqual=" + DEFAULT_TRIAL_PERIOD_MONTHS,
            "trialPeriodMonths.greaterThanOrEqual=" + (DEFAULT_TRIAL_PERIOD_MONTHS + 1)
        );
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths is less than or equal to
        defaultContractFiltering(
            "trialPeriodMonths.lessThanOrEqual=" + DEFAULT_TRIAL_PERIOD_MONTHS,
            "trialPeriodMonths.lessThanOrEqual=" + SMALLER_TRIAL_PERIOD_MONTHS
        );
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths is less than
        defaultContractFiltering(
            "trialPeriodMonths.lessThan=" + (DEFAULT_TRIAL_PERIOD_MONTHS + 1),
            "trialPeriodMonths.lessThan=" + DEFAULT_TRIAL_PERIOD_MONTHS
        );
    }

    @Test
    @Transactional
    void getAllContractsByTrialPeriodMonthsIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where trialPeriodMonths is greater than
        defaultContractFiltering(
            "trialPeriodMonths.greaterThan=" + SMALLER_TRIAL_PERIOD_MONTHS,
            "trialPeriodMonths.greaterThan=" + DEFAULT_TRIAL_PERIOD_MONTHS
        );
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount equals to
        defaultContractFiltering("renewalCount.equals=" + DEFAULT_RENEWAL_COUNT, "renewalCount.equals=" + UPDATED_RENEWAL_COUNT);
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount in
        defaultContractFiltering(
            "renewalCount.in=" + DEFAULT_RENEWAL_COUNT + "," + UPDATED_RENEWAL_COUNT,
            "renewalCount.in=" + UPDATED_RENEWAL_COUNT
        );
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount is not null
        defaultContractFiltering("renewalCount.specified=true", "renewalCount.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount is greater than or equal to
        defaultContractFiltering(
            "renewalCount.greaterThanOrEqual=" + DEFAULT_RENEWAL_COUNT,
            "renewalCount.greaterThanOrEqual=" + UPDATED_RENEWAL_COUNT
        );
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount is less than or equal to
        defaultContractFiltering(
            "renewalCount.lessThanOrEqual=" + DEFAULT_RENEWAL_COUNT,
            "renewalCount.lessThanOrEqual=" + SMALLER_RENEWAL_COUNT
        );
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount is less than
        defaultContractFiltering("renewalCount.lessThan=" + UPDATED_RENEWAL_COUNT, "renewalCount.lessThan=" + DEFAULT_RENEWAL_COUNT);
    }

    @Test
    @Transactional
    void getAllContractsByRenewalCountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where renewalCount is greater than
        defaultContractFiltering("renewalCount.greaterThan=" + SMALLER_RENEWAL_COUNT, "renewalCount.greaterThan=" + DEFAULT_RENEWAL_COUNT);
    }

    @Test
    @Transactional
    void getAllContractsByDocumentUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where documentUrl equals to
        defaultContractFiltering("documentUrl.equals=" + DEFAULT_DOCUMENT_URL, "documentUrl.equals=" + UPDATED_DOCUMENT_URL);
    }

    @Test
    @Transactional
    void getAllContractsByDocumentUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where documentUrl in
        defaultContractFiltering(
            "documentUrl.in=" + DEFAULT_DOCUMENT_URL + "," + UPDATED_DOCUMENT_URL,
            "documentUrl.in=" + UPDATED_DOCUMENT_URL
        );
    }

    @Test
    @Transactional
    void getAllContractsByDocumentUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where documentUrl is not null
        defaultContractFiltering("documentUrl.specified=true", "documentUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByDocumentUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where documentUrl contains
        defaultContractFiltering("documentUrl.contains=" + DEFAULT_DOCUMENT_URL, "documentUrl.contains=" + UPDATED_DOCUMENT_URL);
    }

    @Test
    @Transactional
    void getAllContractsByDocumentUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where documentUrl does not contain
        defaultContractFiltering(
            "documentUrl.doesNotContain=" + UPDATED_DOCUMENT_URL,
            "documentUrl.doesNotContain=" + DEFAULT_DOCUMENT_URL
        );
    }

    @Test
    @Transactional
    void getAllContractsByCreatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where createdAt equals to
        defaultContractFiltering("createdAt.equals=" + DEFAULT_CREATED_AT, "createdAt.equals=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllContractsByCreatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where createdAt in
        defaultContractFiltering("createdAt.in=" + DEFAULT_CREATED_AT + "," + UPDATED_CREATED_AT, "createdAt.in=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllContractsByCreatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        // Get all the contractList where createdAt is not null
        defaultContractFiltering("createdAt.specified=true", "createdAt.specified=false");
    }

    @Test
    @Transactional
    void getAllContractsByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            contractRepository.saveAndFlush(contract);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        contract.setEmployee(employee);
        contractRepository.saveAndFlush(contract);
        Long employeeId = employee.getId();
        // Get all the contractList where employee equals to employeeId
        defaultContractShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the contractList where employee equals to (employeeId + 1)
        defaultContractShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllContractsByCreatedByIsEqualToSomething() throws Exception {
        UserProfile createdBy;
        if (TestUtil.findAll(em, UserProfile.class).isEmpty()) {
            contractRepository.saveAndFlush(contract);
            createdBy = UserProfileResourceIT.createEntity(em);
        } else {
            createdBy = TestUtil.findAll(em, UserProfile.class).get(0);
        }
        em.persist(createdBy);
        em.flush();
        contract.setCreatedBy(createdBy);
        contractRepository.saveAndFlush(contract);
        Long createdById = createdBy.getId();
        // Get all the contractList where createdBy equals to createdById
        defaultContractShouldBeFound("createdById.equals=" + createdById);

        // Get all the contractList where createdBy equals to (createdById + 1)
        defaultContractShouldNotBeFound("createdById.equals=" + (createdById + 1));
    }

    private void defaultContractFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultContractShouldBeFound(shouldBeFound);
        defaultContractShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultContractShouldBeFound(String filter) throws Exception {
        restContractMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(contract.getId().intValue())))
            .andExpect(jsonPath("$.[*].reference").value(hasItem(DEFAULT_REFERENCE)))
            .andExpect(jsonPath("$.[*].contractType").value(hasItem(DEFAULT_CONTRACT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].signedDate").value(hasItem(DEFAULT_SIGNED_DATE.toString())))
            .andExpect(jsonPath("$.[*].baseSalary").value(hasItem(sameNumber(DEFAULT_BASE_SALARY))))
            .andExpect(jsonPath("$.[*].workingHoursWeek").value(hasItem(DEFAULT_WORKING_HOURS_WEEK)))
            .andExpect(jsonPath("$.[*].workingDaysWeek").value(hasItem(DEFAULT_WORKING_DAYS_WEEK)))
            .andExpect(jsonPath("$.[*].conventionCollective").value(hasItem(DEFAULT_CONVENTION_COLLECTIVE)))
            .andExpect(jsonPath("$.[*].trialPeriodMonths").value(hasItem(DEFAULT_TRIAL_PERIOD_MONTHS)))
            .andExpect(jsonPath("$.[*].renewalCount").value(hasItem(DEFAULT_RENEWAL_COUNT)))
            .andExpect(jsonPath("$.[*].documentUrl").value(hasItem(DEFAULT_DOCUMENT_URL)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));

        // Check, that the count call also returns 1
        restContractMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultContractShouldNotBeFound(String filter) throws Exception {
        restContractMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restContractMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingContract() throws Exception {
        // Get the contract
        restContractMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingContract() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the contract
        Contract updatedContract = contractRepository.findById(contract.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedContract are not directly saved in db
        em.detach(updatedContract);
        updatedContract
            .reference(UPDATED_REFERENCE)
            .contractType(UPDATED_CONTRACT_TYPE)
            .status(UPDATED_STATUS)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .signedDate(UPDATED_SIGNED_DATE)
            .baseSalary(UPDATED_BASE_SALARY)
            .workingHoursWeek(UPDATED_WORKING_HOURS_WEEK)
            .workingDaysWeek(UPDATED_WORKING_DAYS_WEEK)
            .conventionCollective(UPDATED_CONVENTION_COLLECTIVE)
            .trialPeriodMonths(UPDATED_TRIAL_PERIOD_MONTHS)
            .renewalCount(UPDATED_RENEWAL_COUNT)
            .documentUrl(UPDATED_DOCUMENT_URL)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT);
        ContractDTO contractDTO = contractMapper.toDto(updatedContract);

        restContractMockMvc
            .perform(
                put(ENTITY_API_URL_ID, contractDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(contractDTO))
            )
            .andExpect(status().isOk());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedContractToMatchAllProperties(updatedContract);
    }

    @Test
    @Transactional
    void putNonExistingContract() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        contract.setId(longCount.incrementAndGet());

        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restContractMockMvc
            .perform(
                put(ENTITY_API_URL_ID, contractDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(contractDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchContract() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        contract.setId(longCount.incrementAndGet());

        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restContractMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(contractDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamContract() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        contract.setId(longCount.incrementAndGet());

        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restContractMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateContractWithPatch() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the contract using partial update
        Contract partialUpdatedContract = new Contract();
        partialUpdatedContract.setId(contract.getId());

        partialUpdatedContract
            .reference(UPDATED_REFERENCE)
            .contractType(UPDATED_CONTRACT_TYPE)
            .status(UPDATED_STATUS)
            .startDate(UPDATED_START_DATE)
            .workingHoursWeek(UPDATED_WORKING_HOURS_WEEK)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT);

        restContractMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedContract.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedContract))
            )
            .andExpect(status().isOk());

        // Validate the Contract in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertContractUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedContract, contract), getPersistedContract(contract));
    }

    @Test
    @Transactional
    void fullUpdateContractWithPatch() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the contract using partial update
        Contract partialUpdatedContract = new Contract();
        partialUpdatedContract.setId(contract.getId());

        partialUpdatedContract
            .reference(UPDATED_REFERENCE)
            .contractType(UPDATED_CONTRACT_TYPE)
            .status(UPDATED_STATUS)
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .signedDate(UPDATED_SIGNED_DATE)
            .baseSalary(UPDATED_BASE_SALARY)
            .workingHoursWeek(UPDATED_WORKING_HOURS_WEEK)
            .workingDaysWeek(UPDATED_WORKING_DAYS_WEEK)
            .conventionCollective(UPDATED_CONVENTION_COLLECTIVE)
            .trialPeriodMonths(UPDATED_TRIAL_PERIOD_MONTHS)
            .renewalCount(UPDATED_RENEWAL_COUNT)
            .documentUrl(UPDATED_DOCUMENT_URL)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT);

        restContractMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedContract.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedContract))
            )
            .andExpect(status().isOk());

        // Validate the Contract in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertContractUpdatableFieldsEquals(partialUpdatedContract, getPersistedContract(partialUpdatedContract));
    }

    @Test
    @Transactional
    void patchNonExistingContract() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        contract.setId(longCount.incrementAndGet());

        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restContractMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, contractDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(contractDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchContract() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        contract.setId(longCount.incrementAndGet());

        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restContractMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(contractDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamContract() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        contract.setId(longCount.incrementAndGet());

        // Create the Contract
        ContractDTO contractDTO = contractMapper.toDto(contract);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restContractMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(contractDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Contract in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteContract() throws Exception {
        // Initialize the database
        insertedContract = contractRepository.saveAndFlush(contract);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the contract
        restContractMockMvc
            .perform(delete(ENTITY_API_URL_ID, contract.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return contractRepository.count();
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

    protected Contract getPersistedContract(Contract contract) {
        return contractRepository.findById(contract.getId()).orElseThrow();
    }

    protected void assertPersistedContractToMatchAllProperties(Contract expectedContract) {
        assertContractAllPropertiesEquals(expectedContract, getPersistedContract(expectedContract));
    }

    protected void assertPersistedContractToMatchUpdatableProperties(Contract expectedContract) {
        assertContractAllUpdatablePropertiesEquals(expectedContract, getPersistedContract(expectedContract));
    }
}
