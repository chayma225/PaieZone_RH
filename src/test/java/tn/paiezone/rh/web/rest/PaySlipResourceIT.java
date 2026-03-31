package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.PaySlipAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;
import static tn.paiezone.rh.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.Instant;
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
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.dto.PaySlipDTO;
import tn.paiezone.rh.service.mapper.PaySlipMapper;

/**
 * Integration tests for the {@link PaySlipResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PaySlipResourceIT {

    private static final Integer DEFAULT_MONTH = 1;
    private static final Integer UPDATED_MONTH = 2;
    private static final Integer SMALLER_MONTH = 1 - 1;

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;
    private static final Integer SMALLER_YEAR = 1 - 1;

    private static final BigDecimal DEFAULT_BASE_SALARY = new BigDecimal(1);
    private static final BigDecimal UPDATED_BASE_SALARY = new BigDecimal(2);
    private static final BigDecimal SMALLER_BASE_SALARY = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TOTAL_GAINS = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_GAINS = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL_GAINS = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TOTAL_DEDUCTIONS = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_DEDUCTIONS = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL_DEDUCTIONS = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_GROSS_SALARY = new BigDecimal(1);
    private static final BigDecimal UPDATED_GROSS_SALARY = new BigDecimal(2);
    private static final BigDecimal SMALLER_GROSS_SALARY = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_CNSS_SALARY_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_CNSS_SALARY_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_CNSS_SALARY_AMOUNT = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_CAVIS_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_CAVIS_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_CAVIS_AMOUNT = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TAXABLE_INCOME = new BigDecimal(1);
    private static final BigDecimal UPDATED_TAXABLE_INCOME = new BigDecimal(2);
    private static final BigDecimal SMALLER_TAXABLE_INCOME = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_IRPP_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_IRPP_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_IRPP_AMOUNT = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_NET_SALARY = new BigDecimal(1);
    private static final BigDecimal UPDATED_NET_SALARY = new BigDecimal(2);
    private static final BigDecimal SMALLER_NET_SALARY = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_EMPLOYER_CNSS = new BigDecimal(1);
    private static final BigDecimal UPDATED_EMPLOYER_CNSS = new BigDecimal(2);
    private static final BigDecimal SMALLER_EMPLOYER_CNSS = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_EMPLOYER_CAVIS = new BigDecimal(1);
    private static final BigDecimal UPDATED_EMPLOYER_CAVIS = new BigDecimal(2);
    private static final BigDecimal SMALLER_EMPLOYER_CAVIS = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_TOTAL_EMPLOYER_COST = new BigDecimal(1);
    private static final BigDecimal UPDATED_TOTAL_EMPLOYER_COST = new BigDecimal(2);
    private static final BigDecimal SMALLER_TOTAL_EMPLOYER_COST = new BigDecimal(1 - 1);

    private static final Integer DEFAULT_WORKED_DAYS = 1;
    private static final Integer UPDATED_WORKED_DAYS = 2;
    private static final Integer SMALLER_WORKED_DAYS = 1 - 1;

    private static final Integer DEFAULT_PAID_LEAVE_DAYS = 1;
    private static final Integer UPDATED_PAID_LEAVE_DAYS = 2;
    private static final Integer SMALLER_PAID_LEAVE_DAYS = 1 - 1;

    private static final Integer DEFAULT_UNPAID_DAYS = 1;
    private static final Integer UPDATED_UNPAID_DAYS = 2;
    private static final Integer SMALLER_UNPAID_DAYS = 1 - 1;

    private static final BigDecimal DEFAULT_OVERTIME_HOURS = new BigDecimal(1);
    private static final BigDecimal UPDATED_OVERTIME_HOURS = new BigDecimal(2);
    private static final BigDecimal SMALLER_OVERTIME_HOURS = new BigDecimal(1 - 1);

    private static final PayrollStatus DEFAULT_STATUS = PayrollStatus.DRAFT;
    private static final PayrollStatus UPDATED_STATUS = PayrollStatus.CALCULATED;

    private static final String DEFAULT_PDF_URL = "AAAAAAAAAA";
    private static final String UPDATED_PDF_URL = "BBBBBBBBBB";

    private static final Instant DEFAULT_GENERATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_GENERATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_SENT_TO_EMPLOYEE_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_SENT_TO_EMPLOYEE_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_BANK_TRANSFER_REF = "AAAAAAAAAA";
    private static final String UPDATED_BANK_TRANSFER_REF = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/pay-slips";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PaySlipRepository paySlipRepository;

    @Autowired
    private PaySlipMapper paySlipMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPaySlipMockMvc;

    private PaySlip paySlip;

    private PaySlip insertedPaySlip;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PaySlip createEntity(EntityManager em) {
        PaySlip paySlip = new PaySlip()
            .month(DEFAULT_MONTH)
            .year(DEFAULT_YEAR)
            .baseSalary(DEFAULT_BASE_SALARY)
            .totalGains(DEFAULT_TOTAL_GAINS)
            .totalDeductions(DEFAULT_TOTAL_DEDUCTIONS)
            .grossSalary(DEFAULT_GROSS_SALARY)
            .cnssSalaryAmount(DEFAULT_CNSS_SALARY_AMOUNT)
            .cavisAmount(DEFAULT_CAVIS_AMOUNT)
            .taxableIncome(DEFAULT_TAXABLE_INCOME)
            .irppAmount(DEFAULT_IRPP_AMOUNT)
            .netSalary(DEFAULT_NET_SALARY)
            .employerCnss(DEFAULT_EMPLOYER_CNSS)
            .employerCavis(DEFAULT_EMPLOYER_CAVIS)
            .totalEmployerCost(DEFAULT_TOTAL_EMPLOYER_COST)
            .workedDays(DEFAULT_WORKED_DAYS)
            .paidLeaveDays(DEFAULT_PAID_LEAVE_DAYS)
            .unpaidDays(DEFAULT_UNPAID_DAYS)
            .overtimeHours(DEFAULT_OVERTIME_HOURS)
            .status(DEFAULT_STATUS)
            .pdfUrl(DEFAULT_PDF_URL)
            .generatedAt(DEFAULT_GENERATED_AT)
            .sentToEmployeeAt(DEFAULT_SENT_TO_EMPLOYEE_AT)
            .bankTransferRef(DEFAULT_BANK_TRANSFER_REF);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        paySlip.setEmployee(employee);
        // Add required entity
        PayrollPeriod payrollPeriod;
        if (TestUtil.findAll(em, PayrollPeriod.class).isEmpty()) {
            payrollPeriod = PayrollPeriodResourceIT.createEntity(em);
            em.persist(payrollPeriod);
            em.flush();
        } else {
            payrollPeriod = TestUtil.findAll(em, PayrollPeriod.class).get(0);
        }
        paySlip.setPayrollPeriod(payrollPeriod);
        // Add required entity
        Contract contract;
        if (TestUtil.findAll(em, Contract.class).isEmpty()) {
            contract = ContractResourceIT.createEntity(em);
            em.persist(contract);
            em.flush();
        } else {
            contract = TestUtil.findAll(em, Contract.class).get(0);
        }
        paySlip.setContract(contract);
        return paySlip;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static PaySlip createUpdatedEntity(EntityManager em) {
        PaySlip updatedPaySlip = new PaySlip()
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .baseSalary(UPDATED_BASE_SALARY)
            .totalGains(UPDATED_TOTAL_GAINS)
            .totalDeductions(UPDATED_TOTAL_DEDUCTIONS)
            .grossSalary(UPDATED_GROSS_SALARY)
            .cnssSalaryAmount(UPDATED_CNSS_SALARY_AMOUNT)
            .cavisAmount(UPDATED_CAVIS_AMOUNT)
            .taxableIncome(UPDATED_TAXABLE_INCOME)
            .irppAmount(UPDATED_IRPP_AMOUNT)
            .netSalary(UPDATED_NET_SALARY)
            .employerCnss(UPDATED_EMPLOYER_CNSS)
            .employerCavis(UPDATED_EMPLOYER_CAVIS)
            .totalEmployerCost(UPDATED_TOTAL_EMPLOYER_COST)
            .workedDays(UPDATED_WORKED_DAYS)
            .paidLeaveDays(UPDATED_PAID_LEAVE_DAYS)
            .unpaidDays(UPDATED_UNPAID_DAYS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .status(UPDATED_STATUS)
            .pdfUrl(UPDATED_PDF_URL)
            .generatedAt(UPDATED_GENERATED_AT)
            .sentToEmployeeAt(UPDATED_SENT_TO_EMPLOYEE_AT)
            .bankTransferRef(UPDATED_BANK_TRANSFER_REF);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedPaySlip.setEmployee(employee);
        // Add required entity
        PayrollPeriod payrollPeriod;
        if (TestUtil.findAll(em, PayrollPeriod.class).isEmpty()) {
            payrollPeriod = PayrollPeriodResourceIT.createUpdatedEntity(em);
            em.persist(payrollPeriod);
            em.flush();
        } else {
            payrollPeriod = TestUtil.findAll(em, PayrollPeriod.class).get(0);
        }
        updatedPaySlip.setPayrollPeriod(payrollPeriod);
        // Add required entity
        Contract contract;
        if (TestUtil.findAll(em, Contract.class).isEmpty()) {
            contract = ContractResourceIT.createUpdatedEntity(em);
            em.persist(contract);
            em.flush();
        } else {
            contract = TestUtil.findAll(em, Contract.class).get(0);
        }
        updatedPaySlip.setContract(contract);
        return updatedPaySlip;
    }

    @BeforeEach
    void initTest() {
        paySlip = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedPaySlip != null) {
            paySlipRepository.delete(insertedPaySlip);
            insertedPaySlip = null;
        }
    }

    @Test
    @Transactional
    void createPaySlip() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);
        var returnedPaySlipDTO = om.readValue(
            restPaySlipMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PaySlipDTO.class
        );

        // Validate the PaySlip in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPaySlip = paySlipMapper.toEntity(returnedPaySlipDTO);
        assertPaySlipUpdatableFieldsEquals(returnedPaySlip, getPersistedPaySlip(returnedPaySlip));

        insertedPaySlip = returnedPaySlip;
    }

    @Test
    @Transactional
    void createPaySlipWithExistingId() throws Exception {
        // Create the PaySlip with an existing ID
        paySlip.setId(1L);
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkMonthIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setMonth(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setYear(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBaseSalaryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setBaseSalary(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTotalGainsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setTotalGains(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTotalDeductionsIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setTotalDeductions(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGrossSalaryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setGrossSalary(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCnssSalaryAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setCnssSalaryAmount(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTaxableIncomeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setTaxableIncome(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkIrppAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setIrppAmount(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNetSalaryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setNetSalary(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEmployerCnssIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setEmployerCnss(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTotalEmployerCostIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setTotalEmployerCost(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        paySlip.setStatus(null);

        // Create the PaySlip, which fails.
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        restPaySlipMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPaySlips() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList
        restPaySlipMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(paySlip.getId().intValue())))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].baseSalary").value(hasItem(sameNumber(DEFAULT_BASE_SALARY))))
            .andExpect(jsonPath("$.[*].totalGains").value(hasItem(sameNumber(DEFAULT_TOTAL_GAINS))))
            .andExpect(jsonPath("$.[*].totalDeductions").value(hasItem(sameNumber(DEFAULT_TOTAL_DEDUCTIONS))))
            .andExpect(jsonPath("$.[*].grossSalary").value(hasItem(sameNumber(DEFAULT_GROSS_SALARY))))
            .andExpect(jsonPath("$.[*].cnssSalaryAmount").value(hasItem(sameNumber(DEFAULT_CNSS_SALARY_AMOUNT))))
            .andExpect(jsonPath("$.[*].cavisAmount").value(hasItem(sameNumber(DEFAULT_CAVIS_AMOUNT))))
            .andExpect(jsonPath("$.[*].taxableIncome").value(hasItem(sameNumber(DEFAULT_TAXABLE_INCOME))))
            .andExpect(jsonPath("$.[*].irppAmount").value(hasItem(sameNumber(DEFAULT_IRPP_AMOUNT))))
            .andExpect(jsonPath("$.[*].netSalary").value(hasItem(sameNumber(DEFAULT_NET_SALARY))))
            .andExpect(jsonPath("$.[*].employerCnss").value(hasItem(sameNumber(DEFAULT_EMPLOYER_CNSS))))
            .andExpect(jsonPath("$.[*].employerCavis").value(hasItem(sameNumber(DEFAULT_EMPLOYER_CAVIS))))
            .andExpect(jsonPath("$.[*].totalEmployerCost").value(hasItem(sameNumber(DEFAULT_TOTAL_EMPLOYER_COST))))
            .andExpect(jsonPath("$.[*].workedDays").value(hasItem(DEFAULT_WORKED_DAYS)))
            .andExpect(jsonPath("$.[*].paidLeaveDays").value(hasItem(DEFAULT_PAID_LEAVE_DAYS)))
            .andExpect(jsonPath("$.[*].unpaidDays").value(hasItem(DEFAULT_UNPAID_DAYS)))
            .andExpect(jsonPath("$.[*].overtimeHours").value(hasItem(sameNumber(DEFAULT_OVERTIME_HOURS))))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].pdfUrl").value(hasItem(DEFAULT_PDF_URL)))
            .andExpect(jsonPath("$.[*].generatedAt").value(hasItem(DEFAULT_GENERATED_AT.toString())))
            .andExpect(jsonPath("$.[*].sentToEmployeeAt").value(hasItem(DEFAULT_SENT_TO_EMPLOYEE_AT.toString())))
            .andExpect(jsonPath("$.[*].bankTransferRef").value(hasItem(DEFAULT_BANK_TRANSFER_REF)));
    }

    @Test
    @Transactional
    void getPaySlip() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get the paySlip
        restPaySlipMockMvc
            .perform(get(ENTITY_API_URL_ID, paySlip.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(paySlip.getId().intValue()))
            .andExpect(jsonPath("$.month").value(DEFAULT_MONTH))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.baseSalary").value(sameNumber(DEFAULT_BASE_SALARY)))
            .andExpect(jsonPath("$.totalGains").value(sameNumber(DEFAULT_TOTAL_GAINS)))
            .andExpect(jsonPath("$.totalDeductions").value(sameNumber(DEFAULT_TOTAL_DEDUCTIONS)))
            .andExpect(jsonPath("$.grossSalary").value(sameNumber(DEFAULT_GROSS_SALARY)))
            .andExpect(jsonPath("$.cnssSalaryAmount").value(sameNumber(DEFAULT_CNSS_SALARY_AMOUNT)))
            .andExpect(jsonPath("$.cavisAmount").value(sameNumber(DEFAULT_CAVIS_AMOUNT)))
            .andExpect(jsonPath("$.taxableIncome").value(sameNumber(DEFAULT_TAXABLE_INCOME)))
            .andExpect(jsonPath("$.irppAmount").value(sameNumber(DEFAULT_IRPP_AMOUNT)))
            .andExpect(jsonPath("$.netSalary").value(sameNumber(DEFAULT_NET_SALARY)))
            .andExpect(jsonPath("$.employerCnss").value(sameNumber(DEFAULT_EMPLOYER_CNSS)))
            .andExpect(jsonPath("$.employerCavis").value(sameNumber(DEFAULT_EMPLOYER_CAVIS)))
            .andExpect(jsonPath("$.totalEmployerCost").value(sameNumber(DEFAULT_TOTAL_EMPLOYER_COST)))
            .andExpect(jsonPath("$.workedDays").value(DEFAULT_WORKED_DAYS))
            .andExpect(jsonPath("$.paidLeaveDays").value(DEFAULT_PAID_LEAVE_DAYS))
            .andExpect(jsonPath("$.unpaidDays").value(DEFAULT_UNPAID_DAYS))
            .andExpect(jsonPath("$.overtimeHours").value(sameNumber(DEFAULT_OVERTIME_HOURS)))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.pdfUrl").value(DEFAULT_PDF_URL))
            .andExpect(jsonPath("$.generatedAt").value(DEFAULT_GENERATED_AT.toString()))
            .andExpect(jsonPath("$.sentToEmployeeAt").value(DEFAULT_SENT_TO_EMPLOYEE_AT.toString()))
            .andExpect(jsonPath("$.bankTransferRef").value(DEFAULT_BANK_TRANSFER_REF));
    }

    @Test
    @Transactional
    void getPaySlipsByIdFiltering() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        Long id = paySlip.getId();

        defaultPaySlipFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultPaySlipFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultPaySlipFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month equals to
        defaultPaySlipFiltering("month.equals=" + DEFAULT_MONTH, "month.equals=" + UPDATED_MONTH);
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month in
        defaultPaySlipFiltering("month.in=" + DEFAULT_MONTH + "," + UPDATED_MONTH, "month.in=" + UPDATED_MONTH);
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month is not null
        defaultPaySlipFiltering("month.specified=true", "month.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month is greater than or equal to
        defaultPaySlipFiltering("month.greaterThanOrEqual=" + DEFAULT_MONTH, "month.greaterThanOrEqual=" + (DEFAULT_MONTH + 1));
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month is less than or equal to
        defaultPaySlipFiltering("month.lessThanOrEqual=" + DEFAULT_MONTH, "month.lessThanOrEqual=" + SMALLER_MONTH);
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month is less than
        defaultPaySlipFiltering("month.lessThan=" + (DEFAULT_MONTH + 1), "month.lessThan=" + DEFAULT_MONTH);
    }

    @Test
    @Transactional
    void getAllPaySlipsByMonthIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where month is greater than
        defaultPaySlipFiltering("month.greaterThan=" + SMALLER_MONTH, "month.greaterThan=" + DEFAULT_MONTH);
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year equals to
        defaultPaySlipFiltering("year.equals=" + DEFAULT_YEAR, "year.equals=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year in
        defaultPaySlipFiltering("year.in=" + DEFAULT_YEAR + "," + UPDATED_YEAR, "year.in=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year is not null
        defaultPaySlipFiltering("year.specified=true", "year.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year is greater than or equal to
        defaultPaySlipFiltering("year.greaterThanOrEqual=" + DEFAULT_YEAR, "year.greaterThanOrEqual=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year is less than or equal to
        defaultPaySlipFiltering("year.lessThanOrEqual=" + DEFAULT_YEAR, "year.lessThanOrEqual=" + SMALLER_YEAR);
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year is less than
        defaultPaySlipFiltering("year.lessThan=" + UPDATED_YEAR, "year.lessThan=" + DEFAULT_YEAR);
    }

    @Test
    @Transactional
    void getAllPaySlipsByYearIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where year is greater than
        defaultPaySlipFiltering("year.greaterThan=" + SMALLER_YEAR, "year.greaterThan=" + DEFAULT_YEAR);
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary equals to
        defaultPaySlipFiltering("baseSalary.equals=" + DEFAULT_BASE_SALARY, "baseSalary.equals=" + UPDATED_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary in
        defaultPaySlipFiltering("baseSalary.in=" + DEFAULT_BASE_SALARY + "," + UPDATED_BASE_SALARY, "baseSalary.in=" + UPDATED_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary is not null
        defaultPaySlipFiltering("baseSalary.specified=true", "baseSalary.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary is greater than or equal to
        defaultPaySlipFiltering(
            "baseSalary.greaterThanOrEqual=" + DEFAULT_BASE_SALARY,
            "baseSalary.greaterThanOrEqual=" + UPDATED_BASE_SALARY
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary is less than or equal to
        defaultPaySlipFiltering("baseSalary.lessThanOrEqual=" + DEFAULT_BASE_SALARY, "baseSalary.lessThanOrEqual=" + SMALLER_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary is less than
        defaultPaySlipFiltering("baseSalary.lessThan=" + UPDATED_BASE_SALARY, "baseSalary.lessThan=" + DEFAULT_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByBaseSalaryIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where baseSalary is greater than
        defaultPaySlipFiltering("baseSalary.greaterThan=" + SMALLER_BASE_SALARY, "baseSalary.greaterThan=" + DEFAULT_BASE_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains equals to
        defaultPaySlipFiltering("totalGains.equals=" + DEFAULT_TOTAL_GAINS, "totalGains.equals=" + UPDATED_TOTAL_GAINS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains in
        defaultPaySlipFiltering("totalGains.in=" + DEFAULT_TOTAL_GAINS + "," + UPDATED_TOTAL_GAINS, "totalGains.in=" + UPDATED_TOTAL_GAINS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains is not null
        defaultPaySlipFiltering("totalGains.specified=true", "totalGains.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains is greater than or equal to
        defaultPaySlipFiltering(
            "totalGains.greaterThanOrEqual=" + DEFAULT_TOTAL_GAINS,
            "totalGains.greaterThanOrEqual=" + UPDATED_TOTAL_GAINS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains is less than or equal to
        defaultPaySlipFiltering("totalGains.lessThanOrEqual=" + DEFAULT_TOTAL_GAINS, "totalGains.lessThanOrEqual=" + SMALLER_TOTAL_GAINS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains is less than
        defaultPaySlipFiltering("totalGains.lessThan=" + UPDATED_TOTAL_GAINS, "totalGains.lessThan=" + DEFAULT_TOTAL_GAINS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalGainsIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalGains is greater than
        defaultPaySlipFiltering("totalGains.greaterThan=" + SMALLER_TOTAL_GAINS, "totalGains.greaterThan=" + DEFAULT_TOTAL_GAINS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions equals to
        defaultPaySlipFiltering("totalDeductions.equals=" + DEFAULT_TOTAL_DEDUCTIONS, "totalDeductions.equals=" + UPDATED_TOTAL_DEDUCTIONS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions in
        defaultPaySlipFiltering(
            "totalDeductions.in=" + DEFAULT_TOTAL_DEDUCTIONS + "," + UPDATED_TOTAL_DEDUCTIONS,
            "totalDeductions.in=" + UPDATED_TOTAL_DEDUCTIONS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions is not null
        defaultPaySlipFiltering("totalDeductions.specified=true", "totalDeductions.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions is greater than or equal to
        defaultPaySlipFiltering(
            "totalDeductions.greaterThanOrEqual=" + DEFAULT_TOTAL_DEDUCTIONS,
            "totalDeductions.greaterThanOrEqual=" + UPDATED_TOTAL_DEDUCTIONS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions is less than or equal to
        defaultPaySlipFiltering(
            "totalDeductions.lessThanOrEqual=" + DEFAULT_TOTAL_DEDUCTIONS,
            "totalDeductions.lessThanOrEqual=" + SMALLER_TOTAL_DEDUCTIONS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions is less than
        defaultPaySlipFiltering(
            "totalDeductions.lessThan=" + UPDATED_TOTAL_DEDUCTIONS,
            "totalDeductions.lessThan=" + DEFAULT_TOTAL_DEDUCTIONS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalDeductionsIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalDeductions is greater than
        defaultPaySlipFiltering(
            "totalDeductions.greaterThan=" + SMALLER_TOTAL_DEDUCTIONS,
            "totalDeductions.greaterThan=" + DEFAULT_TOTAL_DEDUCTIONS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary equals to
        defaultPaySlipFiltering("grossSalary.equals=" + DEFAULT_GROSS_SALARY, "grossSalary.equals=" + UPDATED_GROSS_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary in
        defaultPaySlipFiltering(
            "grossSalary.in=" + DEFAULT_GROSS_SALARY + "," + UPDATED_GROSS_SALARY,
            "grossSalary.in=" + UPDATED_GROSS_SALARY
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary is not null
        defaultPaySlipFiltering("grossSalary.specified=true", "grossSalary.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary is greater than or equal to
        defaultPaySlipFiltering(
            "grossSalary.greaterThanOrEqual=" + DEFAULT_GROSS_SALARY,
            "grossSalary.greaterThanOrEqual=" + UPDATED_GROSS_SALARY
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary is less than or equal to
        defaultPaySlipFiltering(
            "grossSalary.lessThanOrEqual=" + DEFAULT_GROSS_SALARY,
            "grossSalary.lessThanOrEqual=" + SMALLER_GROSS_SALARY
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary is less than
        defaultPaySlipFiltering("grossSalary.lessThan=" + UPDATED_GROSS_SALARY, "grossSalary.lessThan=" + DEFAULT_GROSS_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByGrossSalaryIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where grossSalary is greater than
        defaultPaySlipFiltering("grossSalary.greaterThan=" + SMALLER_GROSS_SALARY, "grossSalary.greaterThan=" + DEFAULT_GROSS_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount equals to
        defaultPaySlipFiltering(
            "cnssSalaryAmount.equals=" + DEFAULT_CNSS_SALARY_AMOUNT,
            "cnssSalaryAmount.equals=" + UPDATED_CNSS_SALARY_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount in
        defaultPaySlipFiltering(
            "cnssSalaryAmount.in=" + DEFAULT_CNSS_SALARY_AMOUNT + "," + UPDATED_CNSS_SALARY_AMOUNT,
            "cnssSalaryAmount.in=" + UPDATED_CNSS_SALARY_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount is not null
        defaultPaySlipFiltering("cnssSalaryAmount.specified=true", "cnssSalaryAmount.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount is greater than or equal to
        defaultPaySlipFiltering(
            "cnssSalaryAmount.greaterThanOrEqual=" + DEFAULT_CNSS_SALARY_AMOUNT,
            "cnssSalaryAmount.greaterThanOrEqual=" + UPDATED_CNSS_SALARY_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount is less than or equal to
        defaultPaySlipFiltering(
            "cnssSalaryAmount.lessThanOrEqual=" + DEFAULT_CNSS_SALARY_AMOUNT,
            "cnssSalaryAmount.lessThanOrEqual=" + SMALLER_CNSS_SALARY_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount is less than
        defaultPaySlipFiltering(
            "cnssSalaryAmount.lessThan=" + UPDATED_CNSS_SALARY_AMOUNT,
            "cnssSalaryAmount.lessThan=" + DEFAULT_CNSS_SALARY_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCnssSalaryAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cnssSalaryAmount is greater than
        defaultPaySlipFiltering(
            "cnssSalaryAmount.greaterThan=" + SMALLER_CNSS_SALARY_AMOUNT,
            "cnssSalaryAmount.greaterThan=" + DEFAULT_CNSS_SALARY_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount equals to
        defaultPaySlipFiltering("cavisAmount.equals=" + DEFAULT_CAVIS_AMOUNT, "cavisAmount.equals=" + UPDATED_CAVIS_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount in
        defaultPaySlipFiltering(
            "cavisAmount.in=" + DEFAULT_CAVIS_AMOUNT + "," + UPDATED_CAVIS_AMOUNT,
            "cavisAmount.in=" + UPDATED_CAVIS_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount is not null
        defaultPaySlipFiltering("cavisAmount.specified=true", "cavisAmount.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount is greater than or equal to
        defaultPaySlipFiltering(
            "cavisAmount.greaterThanOrEqual=" + DEFAULT_CAVIS_AMOUNT,
            "cavisAmount.greaterThanOrEqual=" + UPDATED_CAVIS_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount is less than or equal to
        defaultPaySlipFiltering(
            "cavisAmount.lessThanOrEqual=" + DEFAULT_CAVIS_AMOUNT,
            "cavisAmount.lessThanOrEqual=" + SMALLER_CAVIS_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount is less than
        defaultPaySlipFiltering("cavisAmount.lessThan=" + UPDATED_CAVIS_AMOUNT, "cavisAmount.lessThan=" + DEFAULT_CAVIS_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByCavisAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where cavisAmount is greater than
        defaultPaySlipFiltering("cavisAmount.greaterThan=" + SMALLER_CAVIS_AMOUNT, "cavisAmount.greaterThan=" + DEFAULT_CAVIS_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome equals to
        defaultPaySlipFiltering("taxableIncome.equals=" + DEFAULT_TAXABLE_INCOME, "taxableIncome.equals=" + UPDATED_TAXABLE_INCOME);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome in
        defaultPaySlipFiltering(
            "taxableIncome.in=" + DEFAULT_TAXABLE_INCOME + "," + UPDATED_TAXABLE_INCOME,
            "taxableIncome.in=" + UPDATED_TAXABLE_INCOME
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome is not null
        defaultPaySlipFiltering("taxableIncome.specified=true", "taxableIncome.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome is greater than or equal to
        defaultPaySlipFiltering(
            "taxableIncome.greaterThanOrEqual=" + DEFAULT_TAXABLE_INCOME,
            "taxableIncome.greaterThanOrEqual=" + UPDATED_TAXABLE_INCOME
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome is less than or equal to
        defaultPaySlipFiltering(
            "taxableIncome.lessThanOrEqual=" + DEFAULT_TAXABLE_INCOME,
            "taxableIncome.lessThanOrEqual=" + SMALLER_TAXABLE_INCOME
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome is less than
        defaultPaySlipFiltering("taxableIncome.lessThan=" + UPDATED_TAXABLE_INCOME, "taxableIncome.lessThan=" + DEFAULT_TAXABLE_INCOME);
    }

    @Test
    @Transactional
    void getAllPaySlipsByTaxableIncomeIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where taxableIncome is greater than
        defaultPaySlipFiltering(
            "taxableIncome.greaterThan=" + SMALLER_TAXABLE_INCOME,
            "taxableIncome.greaterThan=" + DEFAULT_TAXABLE_INCOME
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount equals to
        defaultPaySlipFiltering("irppAmount.equals=" + DEFAULT_IRPP_AMOUNT, "irppAmount.equals=" + UPDATED_IRPP_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount in
        defaultPaySlipFiltering("irppAmount.in=" + DEFAULT_IRPP_AMOUNT + "," + UPDATED_IRPP_AMOUNT, "irppAmount.in=" + UPDATED_IRPP_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount is not null
        defaultPaySlipFiltering("irppAmount.specified=true", "irppAmount.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount is greater than or equal to
        defaultPaySlipFiltering(
            "irppAmount.greaterThanOrEqual=" + DEFAULT_IRPP_AMOUNT,
            "irppAmount.greaterThanOrEqual=" + UPDATED_IRPP_AMOUNT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount is less than or equal to
        defaultPaySlipFiltering("irppAmount.lessThanOrEqual=" + DEFAULT_IRPP_AMOUNT, "irppAmount.lessThanOrEqual=" + SMALLER_IRPP_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount is less than
        defaultPaySlipFiltering("irppAmount.lessThan=" + UPDATED_IRPP_AMOUNT, "irppAmount.lessThan=" + DEFAULT_IRPP_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByIrppAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where irppAmount is greater than
        defaultPaySlipFiltering("irppAmount.greaterThan=" + SMALLER_IRPP_AMOUNT, "irppAmount.greaterThan=" + DEFAULT_IRPP_AMOUNT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary equals to
        defaultPaySlipFiltering("netSalary.equals=" + DEFAULT_NET_SALARY, "netSalary.equals=" + UPDATED_NET_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary in
        defaultPaySlipFiltering("netSalary.in=" + DEFAULT_NET_SALARY + "," + UPDATED_NET_SALARY, "netSalary.in=" + UPDATED_NET_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary is not null
        defaultPaySlipFiltering("netSalary.specified=true", "netSalary.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary is greater than or equal to
        defaultPaySlipFiltering("netSalary.greaterThanOrEqual=" + DEFAULT_NET_SALARY, "netSalary.greaterThanOrEqual=" + UPDATED_NET_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary is less than or equal to
        defaultPaySlipFiltering("netSalary.lessThanOrEqual=" + DEFAULT_NET_SALARY, "netSalary.lessThanOrEqual=" + SMALLER_NET_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary is less than
        defaultPaySlipFiltering("netSalary.lessThan=" + UPDATED_NET_SALARY, "netSalary.lessThan=" + DEFAULT_NET_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByNetSalaryIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where netSalary is greater than
        defaultPaySlipFiltering("netSalary.greaterThan=" + SMALLER_NET_SALARY, "netSalary.greaterThan=" + DEFAULT_NET_SALARY);
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss equals to
        defaultPaySlipFiltering("employerCnss.equals=" + DEFAULT_EMPLOYER_CNSS, "employerCnss.equals=" + UPDATED_EMPLOYER_CNSS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss in
        defaultPaySlipFiltering(
            "employerCnss.in=" + DEFAULT_EMPLOYER_CNSS + "," + UPDATED_EMPLOYER_CNSS,
            "employerCnss.in=" + UPDATED_EMPLOYER_CNSS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss is not null
        defaultPaySlipFiltering("employerCnss.specified=true", "employerCnss.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss is greater than or equal to
        defaultPaySlipFiltering(
            "employerCnss.greaterThanOrEqual=" + DEFAULT_EMPLOYER_CNSS,
            "employerCnss.greaterThanOrEqual=" + UPDATED_EMPLOYER_CNSS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss is less than or equal to
        defaultPaySlipFiltering(
            "employerCnss.lessThanOrEqual=" + DEFAULT_EMPLOYER_CNSS,
            "employerCnss.lessThanOrEqual=" + SMALLER_EMPLOYER_CNSS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss is less than
        defaultPaySlipFiltering("employerCnss.lessThan=" + UPDATED_EMPLOYER_CNSS, "employerCnss.lessThan=" + DEFAULT_EMPLOYER_CNSS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCnssIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCnss is greater than
        defaultPaySlipFiltering("employerCnss.greaterThan=" + SMALLER_EMPLOYER_CNSS, "employerCnss.greaterThan=" + DEFAULT_EMPLOYER_CNSS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis equals to
        defaultPaySlipFiltering("employerCavis.equals=" + DEFAULT_EMPLOYER_CAVIS, "employerCavis.equals=" + UPDATED_EMPLOYER_CAVIS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis in
        defaultPaySlipFiltering(
            "employerCavis.in=" + DEFAULT_EMPLOYER_CAVIS + "," + UPDATED_EMPLOYER_CAVIS,
            "employerCavis.in=" + UPDATED_EMPLOYER_CAVIS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis is not null
        defaultPaySlipFiltering("employerCavis.specified=true", "employerCavis.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis is greater than or equal to
        defaultPaySlipFiltering(
            "employerCavis.greaterThanOrEqual=" + DEFAULT_EMPLOYER_CAVIS,
            "employerCavis.greaterThanOrEqual=" + UPDATED_EMPLOYER_CAVIS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis is less than or equal to
        defaultPaySlipFiltering(
            "employerCavis.lessThanOrEqual=" + DEFAULT_EMPLOYER_CAVIS,
            "employerCavis.lessThanOrEqual=" + SMALLER_EMPLOYER_CAVIS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis is less than
        defaultPaySlipFiltering("employerCavis.lessThan=" + UPDATED_EMPLOYER_CAVIS, "employerCavis.lessThan=" + DEFAULT_EMPLOYER_CAVIS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployerCavisIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where employerCavis is greater than
        defaultPaySlipFiltering(
            "employerCavis.greaterThan=" + SMALLER_EMPLOYER_CAVIS,
            "employerCavis.greaterThan=" + DEFAULT_EMPLOYER_CAVIS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost equals to
        defaultPaySlipFiltering(
            "totalEmployerCost.equals=" + DEFAULT_TOTAL_EMPLOYER_COST,
            "totalEmployerCost.equals=" + UPDATED_TOTAL_EMPLOYER_COST
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost in
        defaultPaySlipFiltering(
            "totalEmployerCost.in=" + DEFAULT_TOTAL_EMPLOYER_COST + "," + UPDATED_TOTAL_EMPLOYER_COST,
            "totalEmployerCost.in=" + UPDATED_TOTAL_EMPLOYER_COST
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost is not null
        defaultPaySlipFiltering("totalEmployerCost.specified=true", "totalEmployerCost.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost is greater than or equal to
        defaultPaySlipFiltering(
            "totalEmployerCost.greaterThanOrEqual=" + DEFAULT_TOTAL_EMPLOYER_COST,
            "totalEmployerCost.greaterThanOrEqual=" + UPDATED_TOTAL_EMPLOYER_COST
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost is less than or equal to
        defaultPaySlipFiltering(
            "totalEmployerCost.lessThanOrEqual=" + DEFAULT_TOTAL_EMPLOYER_COST,
            "totalEmployerCost.lessThanOrEqual=" + SMALLER_TOTAL_EMPLOYER_COST
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost is less than
        defaultPaySlipFiltering(
            "totalEmployerCost.lessThan=" + UPDATED_TOTAL_EMPLOYER_COST,
            "totalEmployerCost.lessThan=" + DEFAULT_TOTAL_EMPLOYER_COST
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByTotalEmployerCostIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where totalEmployerCost is greater than
        defaultPaySlipFiltering(
            "totalEmployerCost.greaterThan=" + SMALLER_TOTAL_EMPLOYER_COST,
            "totalEmployerCost.greaterThan=" + DEFAULT_TOTAL_EMPLOYER_COST
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays equals to
        defaultPaySlipFiltering("workedDays.equals=" + DEFAULT_WORKED_DAYS, "workedDays.equals=" + UPDATED_WORKED_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays in
        defaultPaySlipFiltering("workedDays.in=" + DEFAULT_WORKED_DAYS + "," + UPDATED_WORKED_DAYS, "workedDays.in=" + UPDATED_WORKED_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays is not null
        defaultPaySlipFiltering("workedDays.specified=true", "workedDays.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays is greater than or equal to
        defaultPaySlipFiltering(
            "workedDays.greaterThanOrEqual=" + DEFAULT_WORKED_DAYS,
            "workedDays.greaterThanOrEqual=" + UPDATED_WORKED_DAYS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays is less than or equal to
        defaultPaySlipFiltering("workedDays.lessThanOrEqual=" + DEFAULT_WORKED_DAYS, "workedDays.lessThanOrEqual=" + SMALLER_WORKED_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays is less than
        defaultPaySlipFiltering("workedDays.lessThan=" + UPDATED_WORKED_DAYS, "workedDays.lessThan=" + DEFAULT_WORKED_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByWorkedDaysIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where workedDays is greater than
        defaultPaySlipFiltering("workedDays.greaterThan=" + SMALLER_WORKED_DAYS, "workedDays.greaterThan=" + DEFAULT_WORKED_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays equals to
        defaultPaySlipFiltering("paidLeaveDays.equals=" + DEFAULT_PAID_LEAVE_DAYS, "paidLeaveDays.equals=" + UPDATED_PAID_LEAVE_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays in
        defaultPaySlipFiltering(
            "paidLeaveDays.in=" + DEFAULT_PAID_LEAVE_DAYS + "," + UPDATED_PAID_LEAVE_DAYS,
            "paidLeaveDays.in=" + UPDATED_PAID_LEAVE_DAYS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays is not null
        defaultPaySlipFiltering("paidLeaveDays.specified=true", "paidLeaveDays.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays is greater than or equal to
        defaultPaySlipFiltering(
            "paidLeaveDays.greaterThanOrEqual=" + DEFAULT_PAID_LEAVE_DAYS,
            "paidLeaveDays.greaterThanOrEqual=" + UPDATED_PAID_LEAVE_DAYS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays is less than or equal to
        defaultPaySlipFiltering(
            "paidLeaveDays.lessThanOrEqual=" + DEFAULT_PAID_LEAVE_DAYS,
            "paidLeaveDays.lessThanOrEqual=" + SMALLER_PAID_LEAVE_DAYS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays is less than
        defaultPaySlipFiltering("paidLeaveDays.lessThan=" + UPDATED_PAID_LEAVE_DAYS, "paidLeaveDays.lessThan=" + DEFAULT_PAID_LEAVE_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByPaidLeaveDaysIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where paidLeaveDays is greater than
        defaultPaySlipFiltering(
            "paidLeaveDays.greaterThan=" + SMALLER_PAID_LEAVE_DAYS,
            "paidLeaveDays.greaterThan=" + DEFAULT_PAID_LEAVE_DAYS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays equals to
        defaultPaySlipFiltering("unpaidDays.equals=" + DEFAULT_UNPAID_DAYS, "unpaidDays.equals=" + UPDATED_UNPAID_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays in
        defaultPaySlipFiltering("unpaidDays.in=" + DEFAULT_UNPAID_DAYS + "," + UPDATED_UNPAID_DAYS, "unpaidDays.in=" + UPDATED_UNPAID_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays is not null
        defaultPaySlipFiltering("unpaidDays.specified=true", "unpaidDays.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays is greater than or equal to
        defaultPaySlipFiltering(
            "unpaidDays.greaterThanOrEqual=" + DEFAULT_UNPAID_DAYS,
            "unpaidDays.greaterThanOrEqual=" + UPDATED_UNPAID_DAYS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays is less than or equal to
        defaultPaySlipFiltering("unpaidDays.lessThanOrEqual=" + DEFAULT_UNPAID_DAYS, "unpaidDays.lessThanOrEqual=" + SMALLER_UNPAID_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays is less than
        defaultPaySlipFiltering("unpaidDays.lessThan=" + UPDATED_UNPAID_DAYS, "unpaidDays.lessThan=" + DEFAULT_UNPAID_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByUnpaidDaysIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where unpaidDays is greater than
        defaultPaySlipFiltering("unpaidDays.greaterThan=" + SMALLER_UNPAID_DAYS, "unpaidDays.greaterThan=" + DEFAULT_UNPAID_DAYS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours equals to
        defaultPaySlipFiltering("overtimeHours.equals=" + DEFAULT_OVERTIME_HOURS, "overtimeHours.equals=" + UPDATED_OVERTIME_HOURS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours in
        defaultPaySlipFiltering(
            "overtimeHours.in=" + DEFAULT_OVERTIME_HOURS + "," + UPDATED_OVERTIME_HOURS,
            "overtimeHours.in=" + UPDATED_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours is not null
        defaultPaySlipFiltering("overtimeHours.specified=true", "overtimeHours.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours is greater than or equal to
        defaultPaySlipFiltering(
            "overtimeHours.greaterThanOrEqual=" + DEFAULT_OVERTIME_HOURS,
            "overtimeHours.greaterThanOrEqual=" + UPDATED_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours is less than or equal to
        defaultPaySlipFiltering(
            "overtimeHours.lessThanOrEqual=" + DEFAULT_OVERTIME_HOURS,
            "overtimeHours.lessThanOrEqual=" + SMALLER_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours is less than
        defaultPaySlipFiltering("overtimeHours.lessThan=" + UPDATED_OVERTIME_HOURS, "overtimeHours.lessThan=" + DEFAULT_OVERTIME_HOURS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByOvertimeHoursIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where overtimeHours is greater than
        defaultPaySlipFiltering(
            "overtimeHours.greaterThan=" + SMALLER_OVERTIME_HOURS,
            "overtimeHours.greaterThan=" + DEFAULT_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where status equals to
        defaultPaySlipFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where status in
        defaultPaySlipFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllPaySlipsByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where status is not null
        defaultPaySlipFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByPdfUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where pdfUrl equals to
        defaultPaySlipFiltering("pdfUrl.equals=" + DEFAULT_PDF_URL, "pdfUrl.equals=" + UPDATED_PDF_URL);
    }

    @Test
    @Transactional
    void getAllPaySlipsByPdfUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where pdfUrl in
        defaultPaySlipFiltering("pdfUrl.in=" + DEFAULT_PDF_URL + "," + UPDATED_PDF_URL, "pdfUrl.in=" + UPDATED_PDF_URL);
    }

    @Test
    @Transactional
    void getAllPaySlipsByPdfUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where pdfUrl is not null
        defaultPaySlipFiltering("pdfUrl.specified=true", "pdfUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByPdfUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where pdfUrl contains
        defaultPaySlipFiltering("pdfUrl.contains=" + DEFAULT_PDF_URL, "pdfUrl.contains=" + UPDATED_PDF_URL);
    }

    @Test
    @Transactional
    void getAllPaySlipsByPdfUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where pdfUrl does not contain
        defaultPaySlipFiltering("pdfUrl.doesNotContain=" + UPDATED_PDF_URL, "pdfUrl.doesNotContain=" + DEFAULT_PDF_URL);
    }

    @Test
    @Transactional
    void getAllPaySlipsByGeneratedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where generatedAt equals to
        defaultPaySlipFiltering("generatedAt.equals=" + DEFAULT_GENERATED_AT, "generatedAt.equals=" + UPDATED_GENERATED_AT);
    }

    @Test
    @Transactional
    void getAllPaySlipsByGeneratedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where generatedAt in
        defaultPaySlipFiltering(
            "generatedAt.in=" + DEFAULT_GENERATED_AT + "," + UPDATED_GENERATED_AT,
            "generatedAt.in=" + UPDATED_GENERATED_AT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByGeneratedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where generatedAt is not null
        defaultPaySlipFiltering("generatedAt.specified=true", "generatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsBySentToEmployeeAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where sentToEmployeeAt equals to
        defaultPaySlipFiltering(
            "sentToEmployeeAt.equals=" + DEFAULT_SENT_TO_EMPLOYEE_AT,
            "sentToEmployeeAt.equals=" + UPDATED_SENT_TO_EMPLOYEE_AT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsBySentToEmployeeAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where sentToEmployeeAt in
        defaultPaySlipFiltering(
            "sentToEmployeeAt.in=" + DEFAULT_SENT_TO_EMPLOYEE_AT + "," + UPDATED_SENT_TO_EMPLOYEE_AT,
            "sentToEmployeeAt.in=" + UPDATED_SENT_TO_EMPLOYEE_AT
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsBySentToEmployeeAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where sentToEmployeeAt is not null
        defaultPaySlipFiltering("sentToEmployeeAt.specified=true", "sentToEmployeeAt.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByBankTransferRefIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where bankTransferRef equals to
        defaultPaySlipFiltering(
            "bankTransferRef.equals=" + DEFAULT_BANK_TRANSFER_REF,
            "bankTransferRef.equals=" + UPDATED_BANK_TRANSFER_REF
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByBankTransferRefIsInShouldWork() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where bankTransferRef in
        defaultPaySlipFiltering(
            "bankTransferRef.in=" + DEFAULT_BANK_TRANSFER_REF + "," + UPDATED_BANK_TRANSFER_REF,
            "bankTransferRef.in=" + UPDATED_BANK_TRANSFER_REF
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByBankTransferRefIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where bankTransferRef is not null
        defaultPaySlipFiltering("bankTransferRef.specified=true", "bankTransferRef.specified=false");
    }

    @Test
    @Transactional
    void getAllPaySlipsByBankTransferRefContainsSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where bankTransferRef contains
        defaultPaySlipFiltering(
            "bankTransferRef.contains=" + DEFAULT_BANK_TRANSFER_REF,
            "bankTransferRef.contains=" + UPDATED_BANK_TRANSFER_REF
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByBankTransferRefNotContainsSomething() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        // Get all the paySlipList where bankTransferRef does not contain
        defaultPaySlipFiltering(
            "bankTransferRef.doesNotContain=" + UPDATED_BANK_TRANSFER_REF,
            "bankTransferRef.doesNotContain=" + DEFAULT_BANK_TRANSFER_REF
        );
    }

    @Test
    @Transactional
    void getAllPaySlipsByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            paySlipRepository.saveAndFlush(paySlip);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        paySlip.setEmployee(employee);
        paySlipRepository.saveAndFlush(paySlip);
        Long employeeId = employee.getId();
        // Get all the paySlipList where employee equals to employeeId
        defaultPaySlipShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the paySlipList where employee equals to (employeeId + 1)
        defaultPaySlipShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllPaySlipsByPayrollPeriodIsEqualToSomething() throws Exception {
        PayrollPeriod payrollPeriod;
        if (TestUtil.findAll(em, PayrollPeriod.class).isEmpty()) {
            paySlipRepository.saveAndFlush(paySlip);
            payrollPeriod = PayrollPeriodResourceIT.createEntity(em);
        } else {
            payrollPeriod = TestUtil.findAll(em, PayrollPeriod.class).get(0);
        }
        em.persist(payrollPeriod);
        em.flush();
        paySlip.setPayrollPeriod(payrollPeriod);
        paySlipRepository.saveAndFlush(paySlip);
        Long payrollPeriodId = payrollPeriod.getId();
        // Get all the paySlipList where payrollPeriod equals to payrollPeriodId
        defaultPaySlipShouldBeFound("payrollPeriodId.equals=" + payrollPeriodId);

        // Get all the paySlipList where payrollPeriod equals to (payrollPeriodId + 1)
        defaultPaySlipShouldNotBeFound("payrollPeriodId.equals=" + (payrollPeriodId + 1));
    }

    @Test
    @Transactional
    void getAllPaySlipsByContractIsEqualToSomething() throws Exception {
        Contract contract;
        if (TestUtil.findAll(em, Contract.class).isEmpty()) {
            paySlipRepository.saveAndFlush(paySlip);
            contract = ContractResourceIT.createEntity(em);
        } else {
            contract = TestUtil.findAll(em, Contract.class).get(0);
        }
        em.persist(contract);
        em.flush();
        paySlip.setContract(contract);
        paySlipRepository.saveAndFlush(paySlip);
        Long contractId = contract.getId();
        // Get all the paySlipList where contract equals to contractId
        defaultPaySlipShouldBeFound("contractId.equals=" + contractId);

        // Get all the paySlipList where contract equals to (contractId + 1)
        defaultPaySlipShouldNotBeFound("contractId.equals=" + (contractId + 1));
    }

    private void defaultPaySlipFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultPaySlipShouldBeFound(shouldBeFound);
        defaultPaySlipShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultPaySlipShouldBeFound(String filter) throws Exception {
        restPaySlipMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(paySlip.getId().intValue())))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].baseSalary").value(hasItem(sameNumber(DEFAULT_BASE_SALARY))))
            .andExpect(jsonPath("$.[*].totalGains").value(hasItem(sameNumber(DEFAULT_TOTAL_GAINS))))
            .andExpect(jsonPath("$.[*].totalDeductions").value(hasItem(sameNumber(DEFAULT_TOTAL_DEDUCTIONS))))
            .andExpect(jsonPath("$.[*].grossSalary").value(hasItem(sameNumber(DEFAULT_GROSS_SALARY))))
            .andExpect(jsonPath("$.[*].cnssSalaryAmount").value(hasItem(sameNumber(DEFAULT_CNSS_SALARY_AMOUNT))))
            .andExpect(jsonPath("$.[*].cavisAmount").value(hasItem(sameNumber(DEFAULT_CAVIS_AMOUNT))))
            .andExpect(jsonPath("$.[*].taxableIncome").value(hasItem(sameNumber(DEFAULT_TAXABLE_INCOME))))
            .andExpect(jsonPath("$.[*].irppAmount").value(hasItem(sameNumber(DEFAULT_IRPP_AMOUNT))))
            .andExpect(jsonPath("$.[*].netSalary").value(hasItem(sameNumber(DEFAULT_NET_SALARY))))
            .andExpect(jsonPath("$.[*].employerCnss").value(hasItem(sameNumber(DEFAULT_EMPLOYER_CNSS))))
            .andExpect(jsonPath("$.[*].employerCavis").value(hasItem(sameNumber(DEFAULT_EMPLOYER_CAVIS))))
            .andExpect(jsonPath("$.[*].totalEmployerCost").value(hasItem(sameNumber(DEFAULT_TOTAL_EMPLOYER_COST))))
            .andExpect(jsonPath("$.[*].workedDays").value(hasItem(DEFAULT_WORKED_DAYS)))
            .andExpect(jsonPath("$.[*].paidLeaveDays").value(hasItem(DEFAULT_PAID_LEAVE_DAYS)))
            .andExpect(jsonPath("$.[*].unpaidDays").value(hasItem(DEFAULT_UNPAID_DAYS)))
            .andExpect(jsonPath("$.[*].overtimeHours").value(hasItem(sameNumber(DEFAULT_OVERTIME_HOURS))))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].pdfUrl").value(hasItem(DEFAULT_PDF_URL)))
            .andExpect(jsonPath("$.[*].generatedAt").value(hasItem(DEFAULT_GENERATED_AT.toString())))
            .andExpect(jsonPath("$.[*].sentToEmployeeAt").value(hasItem(DEFAULT_SENT_TO_EMPLOYEE_AT.toString())))
            .andExpect(jsonPath("$.[*].bankTransferRef").value(hasItem(DEFAULT_BANK_TRANSFER_REF)));

        // Check, that the count call also returns 1
        restPaySlipMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultPaySlipShouldNotBeFound(String filter) throws Exception {
        restPaySlipMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restPaySlipMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingPaySlip() throws Exception {
        // Get the paySlip
        restPaySlipMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPaySlip() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the paySlip
        PaySlip updatedPaySlip = paySlipRepository.findById(paySlip.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPaySlip are not directly saved in db
        em.detach(updatedPaySlip);
        updatedPaySlip
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .baseSalary(UPDATED_BASE_SALARY)
            .totalGains(UPDATED_TOTAL_GAINS)
            .totalDeductions(UPDATED_TOTAL_DEDUCTIONS)
            .grossSalary(UPDATED_GROSS_SALARY)
            .cnssSalaryAmount(UPDATED_CNSS_SALARY_AMOUNT)
            .cavisAmount(UPDATED_CAVIS_AMOUNT)
            .taxableIncome(UPDATED_TAXABLE_INCOME)
            .irppAmount(UPDATED_IRPP_AMOUNT)
            .netSalary(UPDATED_NET_SALARY)
            .employerCnss(UPDATED_EMPLOYER_CNSS)
            .employerCavis(UPDATED_EMPLOYER_CAVIS)
            .totalEmployerCost(UPDATED_TOTAL_EMPLOYER_COST)
            .workedDays(UPDATED_WORKED_DAYS)
            .paidLeaveDays(UPDATED_PAID_LEAVE_DAYS)
            .unpaidDays(UPDATED_UNPAID_DAYS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .status(UPDATED_STATUS)
            .pdfUrl(UPDATED_PDF_URL)
            .generatedAt(UPDATED_GENERATED_AT)
            .sentToEmployeeAt(UPDATED_SENT_TO_EMPLOYEE_AT)
            .bankTransferRef(UPDATED_BANK_TRANSFER_REF);
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(updatedPaySlip);

        restPaySlipMockMvc
            .perform(
                put(ENTITY_API_URL_ID, paySlipDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO))
            )
            .andExpect(status().isOk());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPaySlipToMatchAllProperties(updatedPaySlip);
    }

    @Test
    @Transactional
    void putNonExistingPaySlip() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlip.setId(longCount.incrementAndGet());

        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPaySlipMockMvc
            .perform(
                put(ENTITY_API_URL_ID, paySlipDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPaySlip() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlip.setId(longCount.incrementAndGet());

        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(paySlipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPaySlip() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlip.setId(longCount.incrementAndGet());

        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePaySlipWithPatch() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the paySlip using partial update
        PaySlip partialUpdatedPaySlip = new PaySlip();
        partialUpdatedPaySlip.setId(paySlip.getId());

        partialUpdatedPaySlip
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .baseSalary(UPDATED_BASE_SALARY)
            .totalGains(UPDATED_TOTAL_GAINS)
            .totalDeductions(UPDATED_TOTAL_DEDUCTIONS)
            .grossSalary(UPDATED_GROSS_SALARY)
            .netSalary(UPDATED_NET_SALARY)
            .workedDays(UPDATED_WORKED_DAYS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .status(UPDATED_STATUS)
            .sentToEmployeeAt(UPDATED_SENT_TO_EMPLOYEE_AT)
            .bankTransferRef(UPDATED_BANK_TRANSFER_REF);

        restPaySlipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPaySlip.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPaySlip))
            )
            .andExpect(status().isOk());

        // Validate the PaySlip in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPaySlipUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPaySlip, paySlip), getPersistedPaySlip(paySlip));
    }

    @Test
    @Transactional
    void fullUpdatePaySlipWithPatch() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the paySlip using partial update
        PaySlip partialUpdatedPaySlip = new PaySlip();
        partialUpdatedPaySlip.setId(paySlip.getId());

        partialUpdatedPaySlip
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .baseSalary(UPDATED_BASE_SALARY)
            .totalGains(UPDATED_TOTAL_GAINS)
            .totalDeductions(UPDATED_TOTAL_DEDUCTIONS)
            .grossSalary(UPDATED_GROSS_SALARY)
            .cnssSalaryAmount(UPDATED_CNSS_SALARY_AMOUNT)
            .cavisAmount(UPDATED_CAVIS_AMOUNT)
            .taxableIncome(UPDATED_TAXABLE_INCOME)
            .irppAmount(UPDATED_IRPP_AMOUNT)
            .netSalary(UPDATED_NET_SALARY)
            .employerCnss(UPDATED_EMPLOYER_CNSS)
            .employerCavis(UPDATED_EMPLOYER_CAVIS)
            .totalEmployerCost(UPDATED_TOTAL_EMPLOYER_COST)
            .workedDays(UPDATED_WORKED_DAYS)
            .paidLeaveDays(UPDATED_PAID_LEAVE_DAYS)
            .unpaidDays(UPDATED_UNPAID_DAYS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .status(UPDATED_STATUS)
            .pdfUrl(UPDATED_PDF_URL)
            .generatedAt(UPDATED_GENERATED_AT)
            .sentToEmployeeAt(UPDATED_SENT_TO_EMPLOYEE_AT)
            .bankTransferRef(UPDATED_BANK_TRANSFER_REF);

        restPaySlipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPaySlip.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPaySlip))
            )
            .andExpect(status().isOk());

        // Validate the PaySlip in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPaySlipUpdatableFieldsEquals(partialUpdatedPaySlip, getPersistedPaySlip(partialUpdatedPaySlip));
    }

    @Test
    @Transactional
    void patchNonExistingPaySlip() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlip.setId(longCount.incrementAndGet());

        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPaySlipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, paySlipDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(paySlipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPaySlip() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlip.setId(longCount.incrementAndGet());

        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(paySlipDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPaySlip() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        paySlip.setId(longCount.incrementAndGet());

        // Create the PaySlip
        PaySlipDTO paySlipDTO = paySlipMapper.toDto(paySlip);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPaySlipMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(paySlipDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the PaySlip in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePaySlip() throws Exception {
        // Initialize the database
        insertedPaySlip = paySlipRepository.saveAndFlush(paySlip);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the paySlip
        restPaySlipMockMvc
            .perform(delete(ENTITY_API_URL_ID, paySlip.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return paySlipRepository.count();
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

    protected PaySlip getPersistedPaySlip(PaySlip paySlip) {
        return paySlipRepository.findById(paySlip.getId()).orElseThrow();
    }

    protected void assertPersistedPaySlipToMatchAllProperties(PaySlip expectedPaySlip) {
        assertPaySlipAllPropertiesEquals(expectedPaySlip, getPersistedPaySlip(expectedPaySlip));
    }

    protected void assertPersistedPaySlipToMatchUpdatableProperties(PaySlip expectedPaySlip) {
        assertPaySlipAllUpdatablePropertiesEquals(expectedPaySlip, getPersistedPaySlip(expectedPaySlip));
    }
}
