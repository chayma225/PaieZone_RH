package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.EmployeeAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.Department;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.EmployeeCategory;
import tn.paiezone.rh.domain.enumeration.Gender;
import tn.paiezone.rh.domain.enumeration.MaritalStatus;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.mapper.EmployeeMapper;

/**
 * Integration tests for the {@link EmployeeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class EmployeeResourceIT {

    private static final String DEFAULT_MATRICULE = "AAAAAAAAAA";
    private static final String UPDATED_MATRICULE = "BBBBBBBBBB";

    private static final String DEFAULT_FIRST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FIRST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LAST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_LAST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_FIRST_NAME_AR = "AAAAAAAAAA";
    private static final String UPDATED_FIRST_NAME_AR = "BBBBBBBBBB";

    private static final String DEFAULT_LAST_NAME_AR = "AAAAAAAAAA";
    private static final String UPDATED_LAST_NAME_AR = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_BIRTH_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_BIRTH_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_BIRTH_DATE = LocalDate.ofEpochDay(-1L);

    private static final String DEFAULT_BIRTH_PLACE = "AAAAAAAAAA";
    private static final String UPDATED_BIRTH_PLACE = "BBBBBBBBBB";

    private static final Gender DEFAULT_GENDER = Gender.MALE;
    private static final Gender UPDATED_GENDER = Gender.FEMALE;

    private static final MaritalStatus DEFAULT_MARITAL_STATUS = MaritalStatus.SINGLE;
    private static final MaritalStatus UPDATED_MARITAL_STATUS = MaritalStatus.MARRIED;

    private static final Integer DEFAULT_NUMBER_OF_CHILDREN = 0;
    private static final Integer UPDATED_NUMBER_OF_CHILDREN = 1;
    private static final Integer SMALLER_NUMBER_OF_CHILDREN = 0 - 1;

    private static final Boolean DEFAULT_CHEF_DE_FAMILLE = false;
    private static final Boolean UPDATED_CHEF_DE_FAMILLE = true;

    private static final String DEFAULT_NATIONAL_ID = "AAAAAAAAAA";
    private static final String UPDATED_NATIONAL_ID = "BBBBBBBBBB";

    private static final String DEFAULT_PASSPORT_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_PASSPORT_NUMBER = "BBBBBBBBBB";

    private static final String DEFAULT_NATIONALITY = "AAAAAAAAAA";
    private static final String UPDATED_NATIONALITY = "BBBBBBBBBB";

    private static final String DEFAULT_ADDRESS = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS = "BBBBBBBBBB";

    private static final String DEFAULT_CITY = "AAAAAAAAAA";
    private static final String UPDATED_CITY = "BBBBBBBBBB";

    private static final String DEFAULT_PERSONAL_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_PERSONAL_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_PROFESSIONAL_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_PROFESSIONAL_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_PHONE_NUMBER = "BBBBBBBBBB";

    private static final String DEFAULT_CNSS_NUMBER = "AAAAAAAAAA";
    private static final String UPDATED_CNSS_NUMBER = "BBBBBBBBBB";

    private static final EmployeeCategory DEFAULT_CATEGORY = EmployeeCategory.WORKER;
    private static final EmployeeCategory UPDATED_CATEGORY = EmployeeCategory.EMPLOYEE;

    private static final String DEFAULT_PHOTO_URL = "AAAAAAAAAA";
    private static final String UPDATED_PHOTO_URL = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_HIRE_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_HIRE_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_HIRE_DATE = LocalDate.ofEpochDay(-1L);

    private static final LocalDate DEFAULT_TRIAL_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_TRIAL_END_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_TRIAL_END_DATE = LocalDate.ofEpochDay(-1L);

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_UPDATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPDATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/employees";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeMapper employeeMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEmployeeMockMvc;

    private Employee employee;

    private Employee insertedEmployee;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Employee createEntity(EntityManager em) {
        Employee employee = new Employee()
            .matricule(DEFAULT_MATRICULE)
            .firstName(DEFAULT_FIRST_NAME)
            .lastName(DEFAULT_LAST_NAME)
            .firstNameAr(DEFAULT_FIRST_NAME_AR)
            .lastNameAr(DEFAULT_LAST_NAME_AR)
            .birthDate(DEFAULT_BIRTH_DATE)
            .birthPlace(DEFAULT_BIRTH_PLACE)
            .gender(DEFAULT_GENDER)
            .maritalStatus(DEFAULT_MARITAL_STATUS)
            .numberOfChildren(DEFAULT_NUMBER_OF_CHILDREN)
            .chefDeFamille(DEFAULT_CHEF_DE_FAMILLE)
            .nationalId(DEFAULT_NATIONAL_ID)
            .passportNumber(DEFAULT_PASSPORT_NUMBER)
            .nationality(DEFAULT_NATIONALITY)
            .address(DEFAULT_ADDRESS)
            .city(DEFAULT_CITY)
            .personalEmail(DEFAULT_PERSONAL_EMAIL)
            .professionalEmail(DEFAULT_PROFESSIONAL_EMAIL)
            .phoneNumber(DEFAULT_PHONE_NUMBER)
            .cnssNumber(DEFAULT_CNSS_NUMBER)
            .category(DEFAULT_CATEGORY)
            .photoUrl(DEFAULT_PHOTO_URL)
            .hireDate(DEFAULT_HIRE_DATE)
            .trialEndDate(DEFAULT_TRIAL_END_DATE)
            .active(DEFAULT_ACTIVE)
            .notes(DEFAULT_NOTES)
            .createdAt(DEFAULT_CREATED_AT)
            .updatedAt(DEFAULT_UPDATED_AT);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        employee.setCompany(company);
        // Add required entity
        Department department;
        if (TestUtil.findAll(em, Department.class).isEmpty()) {
            department = DepartmentResourceIT.createEntity(em);
            em.persist(department);
            em.flush();
        } else {
            department = TestUtil.findAll(em, Department.class).get(0);
        }
        employee.setDepartment(department);
        // Add required entity
        JobPosition jobPosition;
        if (TestUtil.findAll(em, JobPosition.class).isEmpty()) {
            jobPosition = JobPositionResourceIT.createEntity(em);
            em.persist(jobPosition);
            em.flush();
        } else {
            jobPosition = TestUtil.findAll(em, JobPosition.class).get(0);
        }
        employee.setPosition(jobPosition);
        return employee;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Employee createUpdatedEntity(EntityManager em) {
        Employee updatedEmployee = new Employee()
            .matricule(UPDATED_MATRICULE)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .firstNameAr(UPDATED_FIRST_NAME_AR)
            .lastNameAr(UPDATED_LAST_NAME_AR)
            .birthDate(UPDATED_BIRTH_DATE)
            .birthPlace(UPDATED_BIRTH_PLACE)
            .gender(UPDATED_GENDER)
            .maritalStatus(UPDATED_MARITAL_STATUS)
            .numberOfChildren(UPDATED_NUMBER_OF_CHILDREN)
            .chefDeFamille(UPDATED_CHEF_DE_FAMILLE)
            .nationalId(UPDATED_NATIONAL_ID)
            .passportNumber(UPDATED_PASSPORT_NUMBER)
            .nationality(UPDATED_NATIONALITY)
            .address(UPDATED_ADDRESS)
            .city(UPDATED_CITY)
            .personalEmail(UPDATED_PERSONAL_EMAIL)
            .professionalEmail(UPDATED_PROFESSIONAL_EMAIL)
            .phoneNumber(UPDATED_PHONE_NUMBER)
            .cnssNumber(UPDATED_CNSS_NUMBER)
            .category(UPDATED_CATEGORY)
            .photoUrl(UPDATED_PHOTO_URL)
            .hireDate(UPDATED_HIRE_DATE)
            .trialEndDate(UPDATED_TRIAL_END_DATE)
            .active(UPDATED_ACTIVE)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createUpdatedEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        updatedEmployee.setCompany(company);
        // Add required entity
        Department department;
        if (TestUtil.findAll(em, Department.class).isEmpty()) {
            department = DepartmentResourceIT.createUpdatedEntity(em);
            em.persist(department);
            em.flush();
        } else {
            department = TestUtil.findAll(em, Department.class).get(0);
        }
        updatedEmployee.setDepartment(department);
        // Add required entity
        JobPosition jobPosition;
        if (TestUtil.findAll(em, JobPosition.class).isEmpty()) {
            jobPosition = JobPositionResourceIT.createUpdatedEntity(em);
            em.persist(jobPosition);
            em.flush();
        } else {
            jobPosition = TestUtil.findAll(em, JobPosition.class).get(0);
        }
        updatedEmployee.setPosition(jobPosition);
        return updatedEmployee;
    }

    @BeforeEach
    void initTest() {
        employee = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedEmployee != null) {
            employeeRepository.delete(insertedEmployee);
            insertedEmployee = null;
        }
    }

    @Test
    @Transactional
    void createEmployee() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);
        var returnedEmployeeDTO = om.readValue(
            restEmployeeMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            EmployeeDTO.class
        );

        // Validate the Employee in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedEmployee = employeeMapper.toEntity(returnedEmployeeDTO);
        assertEmployeeUpdatableFieldsEquals(returnedEmployee, getPersistedEmployee(returnedEmployee));

        insertedEmployee = returnedEmployee;
    }

    @Test
    @Transactional
    void createEmployeeWithExistingId() throws Exception {
        // Create the Employee with an existing ID
        employee.setId(1L);
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkMatriculeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setMatricule(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFirstNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setFirstName(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLastNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setLastName(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkBirthDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setBirthDate(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGenderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setGender(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMaritalStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setMaritalStatus(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNumberOfChildrenIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setNumberOfChildren(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkChefDeFamilleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setChefDeFamille(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNationalIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setNationalId(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCategoryIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setCategory(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkHireDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setHireDate(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setActive(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        employee.setCreatedAt(null);

        // Create the Employee, which fails.
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        restEmployeeMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEmployees() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList
        restEmployeeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(employee.getId().intValue())))
            .andExpect(jsonPath("$.[*].matricule").value(hasItem(DEFAULT_MATRICULE)))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRST_NAME)))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LAST_NAME)))
            .andExpect(jsonPath("$.[*].firstNameAr").value(hasItem(DEFAULT_FIRST_NAME_AR)))
            .andExpect(jsonPath("$.[*].lastNameAr").value(hasItem(DEFAULT_LAST_NAME_AR)))
            .andExpect(jsonPath("$.[*].birthDate").value(hasItem(DEFAULT_BIRTH_DATE.toString())))
            .andExpect(jsonPath("$.[*].birthPlace").value(hasItem(DEFAULT_BIRTH_PLACE)))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER.toString())))
            .andExpect(jsonPath("$.[*].maritalStatus").value(hasItem(DEFAULT_MARITAL_STATUS.toString())))
            .andExpect(jsonPath("$.[*].numberOfChildren").value(hasItem(DEFAULT_NUMBER_OF_CHILDREN)))
            .andExpect(jsonPath("$.[*].chefDeFamille").value(hasItem(DEFAULT_CHEF_DE_FAMILLE)))
            .andExpect(jsonPath("$.[*].nationalId").value(hasItem(DEFAULT_NATIONAL_ID)))
            .andExpect(jsonPath("$.[*].passportNumber").value(hasItem(DEFAULT_PASSPORT_NUMBER)))
            .andExpect(jsonPath("$.[*].nationality").value(hasItem(DEFAULT_NATIONALITY)))
            .andExpect(jsonPath("$.[*].address").value(hasItem(DEFAULT_ADDRESS)))
            .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY)))
            .andExpect(jsonPath("$.[*].personalEmail").value(hasItem(DEFAULT_PERSONAL_EMAIL)))
            .andExpect(jsonPath("$.[*].professionalEmail").value(hasItem(DEFAULT_PROFESSIONAL_EMAIL)))
            .andExpect(jsonPath("$.[*].phoneNumber").value(hasItem(DEFAULT_PHONE_NUMBER)))
            .andExpect(jsonPath("$.[*].cnssNumber").value(hasItem(DEFAULT_CNSS_NUMBER)))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY.toString())))
            .andExpect(jsonPath("$.[*].photoUrl").value(hasItem(DEFAULT_PHOTO_URL)))
            .andExpect(jsonPath("$.[*].hireDate").value(hasItem(DEFAULT_HIRE_DATE.toString())))
            .andExpect(jsonPath("$.[*].trialEndDate").value(hasItem(DEFAULT_TRIAL_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())))
            .andExpect(jsonPath("$.[*].updatedAt").value(hasItem(DEFAULT_UPDATED_AT.toString())));
    }

    @Test
    @Transactional
    void getEmployee() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get the employee
        restEmployeeMockMvc
            .perform(get(ENTITY_API_URL_ID, employee.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(employee.getId().intValue()))
            .andExpect(jsonPath("$.matricule").value(DEFAULT_MATRICULE))
            .andExpect(jsonPath("$.firstName").value(DEFAULT_FIRST_NAME))
            .andExpect(jsonPath("$.lastName").value(DEFAULT_LAST_NAME))
            .andExpect(jsonPath("$.firstNameAr").value(DEFAULT_FIRST_NAME_AR))
            .andExpect(jsonPath("$.lastNameAr").value(DEFAULT_LAST_NAME_AR))
            .andExpect(jsonPath("$.birthDate").value(DEFAULT_BIRTH_DATE.toString()))
            .andExpect(jsonPath("$.birthPlace").value(DEFAULT_BIRTH_PLACE))
            .andExpect(jsonPath("$.gender").value(DEFAULT_GENDER.toString()))
            .andExpect(jsonPath("$.maritalStatus").value(DEFAULT_MARITAL_STATUS.toString()))
            .andExpect(jsonPath("$.numberOfChildren").value(DEFAULT_NUMBER_OF_CHILDREN))
            .andExpect(jsonPath("$.chefDeFamille").value(DEFAULT_CHEF_DE_FAMILLE))
            .andExpect(jsonPath("$.nationalId").value(DEFAULT_NATIONAL_ID))
            .andExpect(jsonPath("$.passportNumber").value(DEFAULT_PASSPORT_NUMBER))
            .andExpect(jsonPath("$.nationality").value(DEFAULT_NATIONALITY))
            .andExpect(jsonPath("$.address").value(DEFAULT_ADDRESS))
            .andExpect(jsonPath("$.city").value(DEFAULT_CITY))
            .andExpect(jsonPath("$.personalEmail").value(DEFAULT_PERSONAL_EMAIL))
            .andExpect(jsonPath("$.professionalEmail").value(DEFAULT_PROFESSIONAL_EMAIL))
            .andExpect(jsonPath("$.phoneNumber").value(DEFAULT_PHONE_NUMBER))
            .andExpect(jsonPath("$.cnssNumber").value(DEFAULT_CNSS_NUMBER))
            .andExpect(jsonPath("$.category").value(DEFAULT_CATEGORY.toString()))
            .andExpect(jsonPath("$.photoUrl").value(DEFAULT_PHOTO_URL))
            .andExpect(jsonPath("$.hireDate").value(DEFAULT_HIRE_DATE.toString()))
            .andExpect(jsonPath("$.trialEndDate").value(DEFAULT_TRIAL_END_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()))
            .andExpect(jsonPath("$.updatedAt").value(DEFAULT_UPDATED_AT.toString()));
    }

    @Test
    @Transactional
    void getEmployeesByIdFiltering() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        Long id = employee.getId();

        defaultEmployeeFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultEmployeeFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultEmployeeFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllEmployeesByMatriculeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where matricule equals to
        defaultEmployeeFiltering("matricule.equals=" + DEFAULT_MATRICULE, "matricule.equals=" + UPDATED_MATRICULE);
    }

    @Test
    @Transactional
    void getAllEmployeesByMatriculeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where matricule in
        defaultEmployeeFiltering("matricule.in=" + DEFAULT_MATRICULE + "," + UPDATED_MATRICULE, "matricule.in=" + UPDATED_MATRICULE);
    }

    @Test
    @Transactional
    void getAllEmployeesByMatriculeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where matricule is not null
        defaultEmployeeFiltering("matricule.specified=true", "matricule.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByMatriculeContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where matricule contains
        defaultEmployeeFiltering("matricule.contains=" + DEFAULT_MATRICULE, "matricule.contains=" + UPDATED_MATRICULE);
    }

    @Test
    @Transactional
    void getAllEmployeesByMatriculeNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where matricule does not contain
        defaultEmployeeFiltering("matricule.doesNotContain=" + UPDATED_MATRICULE, "matricule.doesNotContain=" + DEFAULT_MATRICULE);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstName equals to
        defaultEmployeeFiltering("firstName.equals=" + DEFAULT_FIRST_NAME, "firstName.equals=" + UPDATED_FIRST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstName in
        defaultEmployeeFiltering("firstName.in=" + DEFAULT_FIRST_NAME + "," + UPDATED_FIRST_NAME, "firstName.in=" + UPDATED_FIRST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstName is not null
        defaultEmployeeFiltering("firstName.specified=true", "firstName.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstName contains
        defaultEmployeeFiltering("firstName.contains=" + DEFAULT_FIRST_NAME, "firstName.contains=" + UPDATED_FIRST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstName does not contain
        defaultEmployeeFiltering("firstName.doesNotContain=" + UPDATED_FIRST_NAME, "firstName.doesNotContain=" + DEFAULT_FIRST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastName equals to
        defaultEmployeeFiltering("lastName.equals=" + DEFAULT_LAST_NAME, "lastName.equals=" + UPDATED_LAST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastName in
        defaultEmployeeFiltering("lastName.in=" + DEFAULT_LAST_NAME + "," + UPDATED_LAST_NAME, "lastName.in=" + UPDATED_LAST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastName is not null
        defaultEmployeeFiltering("lastName.specified=true", "lastName.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastName contains
        defaultEmployeeFiltering("lastName.contains=" + DEFAULT_LAST_NAME, "lastName.contains=" + UPDATED_LAST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastName does not contain
        defaultEmployeeFiltering("lastName.doesNotContain=" + UPDATED_LAST_NAME, "lastName.doesNotContain=" + DEFAULT_LAST_NAME);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameArIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstNameAr equals to
        defaultEmployeeFiltering("firstNameAr.equals=" + DEFAULT_FIRST_NAME_AR, "firstNameAr.equals=" + UPDATED_FIRST_NAME_AR);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameArIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstNameAr in
        defaultEmployeeFiltering(
            "firstNameAr.in=" + DEFAULT_FIRST_NAME_AR + "," + UPDATED_FIRST_NAME_AR,
            "firstNameAr.in=" + UPDATED_FIRST_NAME_AR
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameArIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstNameAr is not null
        defaultEmployeeFiltering("firstNameAr.specified=true", "firstNameAr.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameArContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstNameAr contains
        defaultEmployeeFiltering("firstNameAr.contains=" + DEFAULT_FIRST_NAME_AR, "firstNameAr.contains=" + UPDATED_FIRST_NAME_AR);
    }

    @Test
    @Transactional
    void getAllEmployeesByFirstNameArNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where firstNameAr does not contain
        defaultEmployeeFiltering(
            "firstNameAr.doesNotContain=" + UPDATED_FIRST_NAME_AR,
            "firstNameAr.doesNotContain=" + DEFAULT_FIRST_NAME_AR
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameArIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastNameAr equals to
        defaultEmployeeFiltering("lastNameAr.equals=" + DEFAULT_LAST_NAME_AR, "lastNameAr.equals=" + UPDATED_LAST_NAME_AR);
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameArIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastNameAr in
        defaultEmployeeFiltering(
            "lastNameAr.in=" + DEFAULT_LAST_NAME_AR + "," + UPDATED_LAST_NAME_AR,
            "lastNameAr.in=" + UPDATED_LAST_NAME_AR
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameArIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastNameAr is not null
        defaultEmployeeFiltering("lastNameAr.specified=true", "lastNameAr.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameArContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastNameAr contains
        defaultEmployeeFiltering("lastNameAr.contains=" + DEFAULT_LAST_NAME_AR, "lastNameAr.contains=" + UPDATED_LAST_NAME_AR);
    }

    @Test
    @Transactional
    void getAllEmployeesByLastNameArNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where lastNameAr does not contain
        defaultEmployeeFiltering("lastNameAr.doesNotContain=" + UPDATED_LAST_NAME_AR, "lastNameAr.doesNotContain=" + DEFAULT_LAST_NAME_AR);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate equals to
        defaultEmployeeFiltering("birthDate.equals=" + DEFAULT_BIRTH_DATE, "birthDate.equals=" + UPDATED_BIRTH_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate in
        defaultEmployeeFiltering("birthDate.in=" + DEFAULT_BIRTH_DATE + "," + UPDATED_BIRTH_DATE, "birthDate.in=" + UPDATED_BIRTH_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate is not null
        defaultEmployeeFiltering("birthDate.specified=true", "birthDate.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate is greater than or equal to
        defaultEmployeeFiltering(
            "birthDate.greaterThanOrEqual=" + DEFAULT_BIRTH_DATE,
            "birthDate.greaterThanOrEqual=" + UPDATED_BIRTH_DATE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate is less than or equal to
        defaultEmployeeFiltering("birthDate.lessThanOrEqual=" + DEFAULT_BIRTH_DATE, "birthDate.lessThanOrEqual=" + SMALLER_BIRTH_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate is less than
        defaultEmployeeFiltering("birthDate.lessThan=" + UPDATED_BIRTH_DATE, "birthDate.lessThan=" + DEFAULT_BIRTH_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthDate is greater than
        defaultEmployeeFiltering("birthDate.greaterThan=" + SMALLER_BIRTH_DATE, "birthDate.greaterThan=" + DEFAULT_BIRTH_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthPlaceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthPlace equals to
        defaultEmployeeFiltering("birthPlace.equals=" + DEFAULT_BIRTH_PLACE, "birthPlace.equals=" + UPDATED_BIRTH_PLACE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthPlaceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthPlace in
        defaultEmployeeFiltering(
            "birthPlace.in=" + DEFAULT_BIRTH_PLACE + "," + UPDATED_BIRTH_PLACE,
            "birthPlace.in=" + UPDATED_BIRTH_PLACE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthPlaceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthPlace is not null
        defaultEmployeeFiltering("birthPlace.specified=true", "birthPlace.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthPlaceContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthPlace contains
        defaultEmployeeFiltering("birthPlace.contains=" + DEFAULT_BIRTH_PLACE, "birthPlace.contains=" + UPDATED_BIRTH_PLACE);
    }

    @Test
    @Transactional
    void getAllEmployeesByBirthPlaceNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where birthPlace does not contain
        defaultEmployeeFiltering("birthPlace.doesNotContain=" + UPDATED_BIRTH_PLACE, "birthPlace.doesNotContain=" + DEFAULT_BIRTH_PLACE);
    }

    @Test
    @Transactional
    void getAllEmployeesByGenderIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where gender equals to
        defaultEmployeeFiltering("gender.equals=" + DEFAULT_GENDER, "gender.equals=" + UPDATED_GENDER);
    }

    @Test
    @Transactional
    void getAllEmployeesByGenderIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where gender in
        defaultEmployeeFiltering("gender.in=" + DEFAULT_GENDER + "," + UPDATED_GENDER, "gender.in=" + UPDATED_GENDER);
    }

    @Test
    @Transactional
    void getAllEmployeesByGenderIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where gender is not null
        defaultEmployeeFiltering("gender.specified=true", "gender.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByMaritalStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where maritalStatus equals to
        defaultEmployeeFiltering("maritalStatus.equals=" + DEFAULT_MARITAL_STATUS, "maritalStatus.equals=" + UPDATED_MARITAL_STATUS);
    }

    @Test
    @Transactional
    void getAllEmployeesByMaritalStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where maritalStatus in
        defaultEmployeeFiltering(
            "maritalStatus.in=" + DEFAULT_MARITAL_STATUS + "," + UPDATED_MARITAL_STATUS,
            "maritalStatus.in=" + UPDATED_MARITAL_STATUS
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByMaritalStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where maritalStatus is not null
        defaultEmployeeFiltering("maritalStatus.specified=true", "maritalStatus.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren equals to
        defaultEmployeeFiltering(
            "numberOfChildren.equals=" + DEFAULT_NUMBER_OF_CHILDREN,
            "numberOfChildren.equals=" + UPDATED_NUMBER_OF_CHILDREN
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren in
        defaultEmployeeFiltering(
            "numberOfChildren.in=" + DEFAULT_NUMBER_OF_CHILDREN + "," + UPDATED_NUMBER_OF_CHILDREN,
            "numberOfChildren.in=" + UPDATED_NUMBER_OF_CHILDREN
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren is not null
        defaultEmployeeFiltering("numberOfChildren.specified=true", "numberOfChildren.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren is greater than or equal to
        defaultEmployeeFiltering(
            "numberOfChildren.greaterThanOrEqual=" + DEFAULT_NUMBER_OF_CHILDREN,
            "numberOfChildren.greaterThanOrEqual=" + (DEFAULT_NUMBER_OF_CHILDREN + 1)
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren is less than or equal to
        defaultEmployeeFiltering(
            "numberOfChildren.lessThanOrEqual=" + DEFAULT_NUMBER_OF_CHILDREN,
            "numberOfChildren.lessThanOrEqual=" + SMALLER_NUMBER_OF_CHILDREN
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren is less than
        defaultEmployeeFiltering(
            "numberOfChildren.lessThan=" + (DEFAULT_NUMBER_OF_CHILDREN + 1),
            "numberOfChildren.lessThan=" + DEFAULT_NUMBER_OF_CHILDREN
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNumberOfChildrenIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where numberOfChildren is greater than
        defaultEmployeeFiltering(
            "numberOfChildren.greaterThan=" + SMALLER_NUMBER_OF_CHILDREN,
            "numberOfChildren.greaterThan=" + DEFAULT_NUMBER_OF_CHILDREN
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByChefDeFamilleIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where chefDeFamille equals to
        defaultEmployeeFiltering("chefDeFamille.equals=" + DEFAULT_CHEF_DE_FAMILLE, "chefDeFamille.equals=" + UPDATED_CHEF_DE_FAMILLE);
    }

    @Test
    @Transactional
    void getAllEmployeesByChefDeFamilleIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where chefDeFamille in
        defaultEmployeeFiltering(
            "chefDeFamille.in=" + DEFAULT_CHEF_DE_FAMILLE + "," + UPDATED_CHEF_DE_FAMILLE,
            "chefDeFamille.in=" + UPDATED_CHEF_DE_FAMILLE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByChefDeFamilleIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where chefDeFamille is not null
        defaultEmployeeFiltering("chefDeFamille.specified=true", "chefDeFamille.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalIdIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationalId equals to
        defaultEmployeeFiltering("nationalId.equals=" + DEFAULT_NATIONAL_ID, "nationalId.equals=" + UPDATED_NATIONAL_ID);
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalIdIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationalId in
        defaultEmployeeFiltering(
            "nationalId.in=" + DEFAULT_NATIONAL_ID + "," + UPDATED_NATIONAL_ID,
            "nationalId.in=" + UPDATED_NATIONAL_ID
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalIdIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationalId is not null
        defaultEmployeeFiltering("nationalId.specified=true", "nationalId.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalIdContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationalId contains
        defaultEmployeeFiltering("nationalId.contains=" + DEFAULT_NATIONAL_ID, "nationalId.contains=" + UPDATED_NATIONAL_ID);
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalIdNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationalId does not contain
        defaultEmployeeFiltering("nationalId.doesNotContain=" + UPDATED_NATIONAL_ID, "nationalId.doesNotContain=" + DEFAULT_NATIONAL_ID);
    }

    @Test
    @Transactional
    void getAllEmployeesByPassportNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where passportNumber equals to
        defaultEmployeeFiltering("passportNumber.equals=" + DEFAULT_PASSPORT_NUMBER, "passportNumber.equals=" + UPDATED_PASSPORT_NUMBER);
    }

    @Test
    @Transactional
    void getAllEmployeesByPassportNumberIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where passportNumber in
        defaultEmployeeFiltering(
            "passportNumber.in=" + DEFAULT_PASSPORT_NUMBER + "," + UPDATED_PASSPORT_NUMBER,
            "passportNumber.in=" + UPDATED_PASSPORT_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByPassportNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where passportNumber is not null
        defaultEmployeeFiltering("passportNumber.specified=true", "passportNumber.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByPassportNumberContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where passportNumber contains
        defaultEmployeeFiltering(
            "passportNumber.contains=" + DEFAULT_PASSPORT_NUMBER,
            "passportNumber.contains=" + UPDATED_PASSPORT_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByPassportNumberNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where passportNumber does not contain
        defaultEmployeeFiltering(
            "passportNumber.doesNotContain=" + UPDATED_PASSPORT_NUMBER,
            "passportNumber.doesNotContain=" + DEFAULT_PASSPORT_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalityIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationality equals to
        defaultEmployeeFiltering("nationality.equals=" + DEFAULT_NATIONALITY, "nationality.equals=" + UPDATED_NATIONALITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalityIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationality in
        defaultEmployeeFiltering(
            "nationality.in=" + DEFAULT_NATIONALITY + "," + UPDATED_NATIONALITY,
            "nationality.in=" + UPDATED_NATIONALITY
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalityIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationality is not null
        defaultEmployeeFiltering("nationality.specified=true", "nationality.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalityContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationality contains
        defaultEmployeeFiltering("nationality.contains=" + DEFAULT_NATIONALITY, "nationality.contains=" + UPDATED_NATIONALITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByNationalityNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where nationality does not contain
        defaultEmployeeFiltering("nationality.doesNotContain=" + UPDATED_NATIONALITY, "nationality.doesNotContain=" + DEFAULT_NATIONALITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByAddressIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where address equals to
        defaultEmployeeFiltering("address.equals=" + DEFAULT_ADDRESS, "address.equals=" + UPDATED_ADDRESS);
    }

    @Test
    @Transactional
    void getAllEmployeesByAddressIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where address in
        defaultEmployeeFiltering("address.in=" + DEFAULT_ADDRESS + "," + UPDATED_ADDRESS, "address.in=" + UPDATED_ADDRESS);
    }

    @Test
    @Transactional
    void getAllEmployeesByAddressIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where address is not null
        defaultEmployeeFiltering("address.specified=true", "address.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByAddressContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where address contains
        defaultEmployeeFiltering("address.contains=" + DEFAULT_ADDRESS, "address.contains=" + UPDATED_ADDRESS);
    }

    @Test
    @Transactional
    void getAllEmployeesByAddressNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where address does not contain
        defaultEmployeeFiltering("address.doesNotContain=" + UPDATED_ADDRESS, "address.doesNotContain=" + DEFAULT_ADDRESS);
    }

    @Test
    @Transactional
    void getAllEmployeesByCityIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where city equals to
        defaultEmployeeFiltering("city.equals=" + DEFAULT_CITY, "city.equals=" + UPDATED_CITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByCityIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where city in
        defaultEmployeeFiltering("city.in=" + DEFAULT_CITY + "," + UPDATED_CITY, "city.in=" + UPDATED_CITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByCityIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where city is not null
        defaultEmployeeFiltering("city.specified=true", "city.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByCityContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where city contains
        defaultEmployeeFiltering("city.contains=" + DEFAULT_CITY, "city.contains=" + UPDATED_CITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByCityNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where city does not contain
        defaultEmployeeFiltering("city.doesNotContain=" + UPDATED_CITY, "city.doesNotContain=" + DEFAULT_CITY);
    }

    @Test
    @Transactional
    void getAllEmployeesByPersonalEmailIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where personalEmail equals to
        defaultEmployeeFiltering("personalEmail.equals=" + DEFAULT_PERSONAL_EMAIL, "personalEmail.equals=" + UPDATED_PERSONAL_EMAIL);
    }

    @Test
    @Transactional
    void getAllEmployeesByPersonalEmailIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where personalEmail in
        defaultEmployeeFiltering(
            "personalEmail.in=" + DEFAULT_PERSONAL_EMAIL + "," + UPDATED_PERSONAL_EMAIL,
            "personalEmail.in=" + UPDATED_PERSONAL_EMAIL
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByPersonalEmailIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where personalEmail is not null
        defaultEmployeeFiltering("personalEmail.specified=true", "personalEmail.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByPersonalEmailContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where personalEmail contains
        defaultEmployeeFiltering("personalEmail.contains=" + DEFAULT_PERSONAL_EMAIL, "personalEmail.contains=" + UPDATED_PERSONAL_EMAIL);
    }

    @Test
    @Transactional
    void getAllEmployeesByPersonalEmailNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where personalEmail does not contain
        defaultEmployeeFiltering(
            "personalEmail.doesNotContain=" + UPDATED_PERSONAL_EMAIL,
            "personalEmail.doesNotContain=" + DEFAULT_PERSONAL_EMAIL
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByProfessionalEmailIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where professionalEmail equals to
        defaultEmployeeFiltering(
            "professionalEmail.equals=" + DEFAULT_PROFESSIONAL_EMAIL,
            "professionalEmail.equals=" + UPDATED_PROFESSIONAL_EMAIL
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByProfessionalEmailIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where professionalEmail in
        defaultEmployeeFiltering(
            "professionalEmail.in=" + DEFAULT_PROFESSIONAL_EMAIL + "," + UPDATED_PROFESSIONAL_EMAIL,
            "professionalEmail.in=" + UPDATED_PROFESSIONAL_EMAIL
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByProfessionalEmailIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where professionalEmail is not null
        defaultEmployeeFiltering("professionalEmail.specified=true", "professionalEmail.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByProfessionalEmailContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where professionalEmail contains
        defaultEmployeeFiltering(
            "professionalEmail.contains=" + DEFAULT_PROFESSIONAL_EMAIL,
            "professionalEmail.contains=" + UPDATED_PROFESSIONAL_EMAIL
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByProfessionalEmailNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where professionalEmail does not contain
        defaultEmployeeFiltering(
            "professionalEmail.doesNotContain=" + UPDATED_PROFESSIONAL_EMAIL,
            "professionalEmail.doesNotContain=" + DEFAULT_PROFESSIONAL_EMAIL
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByPhoneNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where phoneNumber equals to
        defaultEmployeeFiltering("phoneNumber.equals=" + DEFAULT_PHONE_NUMBER, "phoneNumber.equals=" + UPDATED_PHONE_NUMBER);
    }

    @Test
    @Transactional
    void getAllEmployeesByPhoneNumberIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where phoneNumber in
        defaultEmployeeFiltering(
            "phoneNumber.in=" + DEFAULT_PHONE_NUMBER + "," + UPDATED_PHONE_NUMBER,
            "phoneNumber.in=" + UPDATED_PHONE_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByPhoneNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where phoneNumber is not null
        defaultEmployeeFiltering("phoneNumber.specified=true", "phoneNumber.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByPhoneNumberContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where phoneNumber contains
        defaultEmployeeFiltering("phoneNumber.contains=" + DEFAULT_PHONE_NUMBER, "phoneNumber.contains=" + UPDATED_PHONE_NUMBER);
    }

    @Test
    @Transactional
    void getAllEmployeesByPhoneNumberNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where phoneNumber does not contain
        defaultEmployeeFiltering(
            "phoneNumber.doesNotContain=" + UPDATED_PHONE_NUMBER,
            "phoneNumber.doesNotContain=" + DEFAULT_PHONE_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByCnssNumberIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where cnssNumber equals to
        defaultEmployeeFiltering("cnssNumber.equals=" + DEFAULT_CNSS_NUMBER, "cnssNumber.equals=" + UPDATED_CNSS_NUMBER);
    }

    @Test
    @Transactional
    void getAllEmployeesByCnssNumberIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where cnssNumber in
        defaultEmployeeFiltering(
            "cnssNumber.in=" + DEFAULT_CNSS_NUMBER + "," + UPDATED_CNSS_NUMBER,
            "cnssNumber.in=" + UPDATED_CNSS_NUMBER
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByCnssNumberIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where cnssNumber is not null
        defaultEmployeeFiltering("cnssNumber.specified=true", "cnssNumber.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByCnssNumberContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where cnssNumber contains
        defaultEmployeeFiltering("cnssNumber.contains=" + DEFAULT_CNSS_NUMBER, "cnssNumber.contains=" + UPDATED_CNSS_NUMBER);
    }

    @Test
    @Transactional
    void getAllEmployeesByCnssNumberNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where cnssNumber does not contain
        defaultEmployeeFiltering("cnssNumber.doesNotContain=" + UPDATED_CNSS_NUMBER, "cnssNumber.doesNotContain=" + DEFAULT_CNSS_NUMBER);
    }

    @Test
    @Transactional
    void getAllEmployeesByCategoryIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where category equals to
        defaultEmployeeFiltering("category.equals=" + DEFAULT_CATEGORY, "category.equals=" + UPDATED_CATEGORY);
    }

    @Test
    @Transactional
    void getAllEmployeesByCategoryIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where category in
        defaultEmployeeFiltering("category.in=" + DEFAULT_CATEGORY + "," + UPDATED_CATEGORY, "category.in=" + UPDATED_CATEGORY);
    }

    @Test
    @Transactional
    void getAllEmployeesByCategoryIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where category is not null
        defaultEmployeeFiltering("category.specified=true", "category.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByPhotoUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where photoUrl equals to
        defaultEmployeeFiltering("photoUrl.equals=" + DEFAULT_PHOTO_URL, "photoUrl.equals=" + UPDATED_PHOTO_URL);
    }

    @Test
    @Transactional
    void getAllEmployeesByPhotoUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where photoUrl in
        defaultEmployeeFiltering("photoUrl.in=" + DEFAULT_PHOTO_URL + "," + UPDATED_PHOTO_URL, "photoUrl.in=" + UPDATED_PHOTO_URL);
    }

    @Test
    @Transactional
    void getAllEmployeesByPhotoUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where photoUrl is not null
        defaultEmployeeFiltering("photoUrl.specified=true", "photoUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByPhotoUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where photoUrl contains
        defaultEmployeeFiltering("photoUrl.contains=" + DEFAULT_PHOTO_URL, "photoUrl.contains=" + UPDATED_PHOTO_URL);
    }

    @Test
    @Transactional
    void getAllEmployeesByPhotoUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where photoUrl does not contain
        defaultEmployeeFiltering("photoUrl.doesNotContain=" + UPDATED_PHOTO_URL, "photoUrl.doesNotContain=" + DEFAULT_PHOTO_URL);
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate equals to
        defaultEmployeeFiltering("hireDate.equals=" + DEFAULT_HIRE_DATE, "hireDate.equals=" + UPDATED_HIRE_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate in
        defaultEmployeeFiltering("hireDate.in=" + DEFAULT_HIRE_DATE + "," + UPDATED_HIRE_DATE, "hireDate.in=" + UPDATED_HIRE_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate is not null
        defaultEmployeeFiltering("hireDate.specified=true", "hireDate.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate is greater than or equal to
        defaultEmployeeFiltering("hireDate.greaterThanOrEqual=" + DEFAULT_HIRE_DATE, "hireDate.greaterThanOrEqual=" + UPDATED_HIRE_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate is less than or equal to
        defaultEmployeeFiltering("hireDate.lessThanOrEqual=" + DEFAULT_HIRE_DATE, "hireDate.lessThanOrEqual=" + SMALLER_HIRE_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate is less than
        defaultEmployeeFiltering("hireDate.lessThan=" + UPDATED_HIRE_DATE, "hireDate.lessThan=" + DEFAULT_HIRE_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByHireDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where hireDate is greater than
        defaultEmployeeFiltering("hireDate.greaterThan=" + SMALLER_HIRE_DATE, "hireDate.greaterThan=" + DEFAULT_HIRE_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate equals to
        defaultEmployeeFiltering("trialEndDate.equals=" + DEFAULT_TRIAL_END_DATE, "trialEndDate.equals=" + UPDATED_TRIAL_END_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate in
        defaultEmployeeFiltering(
            "trialEndDate.in=" + DEFAULT_TRIAL_END_DATE + "," + UPDATED_TRIAL_END_DATE,
            "trialEndDate.in=" + UPDATED_TRIAL_END_DATE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate is not null
        defaultEmployeeFiltering("trialEndDate.specified=true", "trialEndDate.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate is greater than or equal to
        defaultEmployeeFiltering(
            "trialEndDate.greaterThanOrEqual=" + DEFAULT_TRIAL_END_DATE,
            "trialEndDate.greaterThanOrEqual=" + UPDATED_TRIAL_END_DATE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate is less than or equal to
        defaultEmployeeFiltering(
            "trialEndDate.lessThanOrEqual=" + DEFAULT_TRIAL_END_DATE,
            "trialEndDate.lessThanOrEqual=" + SMALLER_TRIAL_END_DATE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate is less than
        defaultEmployeeFiltering("trialEndDate.lessThan=" + UPDATED_TRIAL_END_DATE, "trialEndDate.lessThan=" + DEFAULT_TRIAL_END_DATE);
    }

    @Test
    @Transactional
    void getAllEmployeesByTrialEndDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where trialEndDate is greater than
        defaultEmployeeFiltering(
            "trialEndDate.greaterThan=" + SMALLER_TRIAL_END_DATE,
            "trialEndDate.greaterThan=" + DEFAULT_TRIAL_END_DATE
        );
    }

    @Test
    @Transactional
    void getAllEmployeesByActiveIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where active equals to
        defaultEmployeeFiltering("active.equals=" + DEFAULT_ACTIVE, "active.equals=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllEmployeesByActiveIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where active in
        defaultEmployeeFiltering("active.in=" + DEFAULT_ACTIVE + "," + UPDATED_ACTIVE, "active.in=" + UPDATED_ACTIVE);
    }

    @Test
    @Transactional
    void getAllEmployeesByActiveIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where active is not null
        defaultEmployeeFiltering("active.specified=true", "active.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByCreatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where createdAt equals to
        defaultEmployeeFiltering("createdAt.equals=" + DEFAULT_CREATED_AT, "createdAt.equals=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllEmployeesByCreatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where createdAt in
        defaultEmployeeFiltering("createdAt.in=" + DEFAULT_CREATED_AT + "," + UPDATED_CREATED_AT, "createdAt.in=" + UPDATED_CREATED_AT);
    }

    @Test
    @Transactional
    void getAllEmployeesByCreatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where createdAt is not null
        defaultEmployeeFiltering("createdAt.specified=true", "createdAt.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByUpdatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where updatedAt equals to
        defaultEmployeeFiltering("updatedAt.equals=" + DEFAULT_UPDATED_AT, "updatedAt.equals=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllEmployeesByUpdatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where updatedAt in
        defaultEmployeeFiltering("updatedAt.in=" + DEFAULT_UPDATED_AT + "," + UPDATED_UPDATED_AT, "updatedAt.in=" + UPDATED_UPDATED_AT);
    }

    @Test
    @Transactional
    void getAllEmployeesByUpdatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        // Get all the employeeList where updatedAt is not null
        defaultEmployeeFiltering("updatedAt.specified=true", "updatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllEmployeesByCompanyIsEqualToSomething() throws Exception {
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            employeeRepository.saveAndFlush(employee);
            company = CompanyResourceIT.createEntity();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        em.persist(company);
        em.flush();
        employee.setCompany(company);
        employeeRepository.saveAndFlush(employee);
        Long companyId = company.getId();
        // Get all the employeeList where company equals to companyId
        defaultEmployeeShouldBeFound("companyId.equals=" + companyId);

        // Get all the employeeList where company equals to (companyId + 1)
        defaultEmployeeShouldNotBeFound("companyId.equals=" + (companyId + 1));
    }

    @Test
    @Transactional
    void getAllEmployeesByDepartmentIsEqualToSomething() throws Exception {
        Department department;
        if (TestUtil.findAll(em, Department.class).isEmpty()) {
            employeeRepository.saveAndFlush(employee);
            department = DepartmentResourceIT.createEntity(em);
        } else {
            department = TestUtil.findAll(em, Department.class).get(0);
        }
        em.persist(department);
        em.flush();
        employee.setDepartment(department);
        employeeRepository.saveAndFlush(employee);
        Long departmentId = department.getId();
        // Get all the employeeList where department equals to departmentId
        defaultEmployeeShouldBeFound("departmentId.equals=" + departmentId);

        // Get all the employeeList where department equals to (departmentId + 1)
        defaultEmployeeShouldNotBeFound("departmentId.equals=" + (departmentId + 1));
    }

    @Test
    @Transactional
    void getAllEmployeesByPositionIsEqualToSomething() throws Exception {
        JobPosition position;
        if (TestUtil.findAll(em, JobPosition.class).isEmpty()) {
            employeeRepository.saveAndFlush(employee);
            position = JobPositionResourceIT.createEntity(em);
        } else {
            position = TestUtil.findAll(em, JobPosition.class).get(0);
        }
        em.persist(position);
        em.flush();
        employee.setPosition(position);
        employeeRepository.saveAndFlush(employee);
        Long positionId = position.getId();
        // Get all the employeeList where position equals to positionId
        defaultEmployeeShouldBeFound("positionId.equals=" + positionId);

        // Get all the employeeList where position equals to (positionId + 1)
        defaultEmployeeShouldNotBeFound("positionId.equals=" + (positionId + 1));
    }

    @Test
    @Transactional
    void getAllEmployeesByManagerIsEqualToSomething() throws Exception {
        Employee manager;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employeeRepository.saveAndFlush(employee);
            manager = EmployeeResourceIT.createEntity(em);
        } else {
            manager = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(manager);
        em.flush();
        employee.setManager(manager);
        employeeRepository.saveAndFlush(employee);
        Long managerId = manager.getId();
        // Get all the employeeList where manager equals to managerId
        defaultEmployeeShouldBeFound("managerId.equals=" + managerId);

        // Get all the employeeList where manager equals to (managerId + 1)
        defaultEmployeeShouldNotBeFound("managerId.equals=" + (managerId + 1));
    }

    @Test
    @Transactional
    void getAllEmployeesByUserProfileIsEqualToSomething() throws Exception {
        UserProfile userProfile;
        if (TestUtil.findAll(em, UserProfile.class).isEmpty()) {
            employeeRepository.saveAndFlush(employee);
            userProfile = UserProfileResourceIT.createEntity(em);
        } else {
            userProfile = TestUtil.findAll(em, UserProfile.class).get(0);
        }
        em.persist(userProfile);
        em.flush();
        employee.setUserProfile(userProfile);
        employeeRepository.saveAndFlush(employee);
        Long userProfileId = userProfile.getId();
        // Get all the employeeList where userProfile equals to userProfileId
        defaultEmployeeShouldBeFound("userProfileId.equals=" + userProfileId);

        // Get all the employeeList where userProfile equals to (userProfileId + 1)
        defaultEmployeeShouldNotBeFound("userProfileId.equals=" + (userProfileId + 1));
    }

    private void defaultEmployeeFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultEmployeeShouldBeFound(shouldBeFound);
        defaultEmployeeShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultEmployeeShouldBeFound(String filter) throws Exception {
        restEmployeeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(employee.getId().intValue())))
            .andExpect(jsonPath("$.[*].matricule").value(hasItem(DEFAULT_MATRICULE)))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRST_NAME)))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LAST_NAME)))
            .andExpect(jsonPath("$.[*].firstNameAr").value(hasItem(DEFAULT_FIRST_NAME_AR)))
            .andExpect(jsonPath("$.[*].lastNameAr").value(hasItem(DEFAULT_LAST_NAME_AR)))
            .andExpect(jsonPath("$.[*].birthDate").value(hasItem(DEFAULT_BIRTH_DATE.toString())))
            .andExpect(jsonPath("$.[*].birthPlace").value(hasItem(DEFAULT_BIRTH_PLACE)))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER.toString())))
            .andExpect(jsonPath("$.[*].maritalStatus").value(hasItem(DEFAULT_MARITAL_STATUS.toString())))
            .andExpect(jsonPath("$.[*].numberOfChildren").value(hasItem(DEFAULT_NUMBER_OF_CHILDREN)))
            .andExpect(jsonPath("$.[*].chefDeFamille").value(hasItem(DEFAULT_CHEF_DE_FAMILLE)))
            .andExpect(jsonPath("$.[*].nationalId").value(hasItem(DEFAULT_NATIONAL_ID)))
            .andExpect(jsonPath("$.[*].passportNumber").value(hasItem(DEFAULT_PASSPORT_NUMBER)))
            .andExpect(jsonPath("$.[*].nationality").value(hasItem(DEFAULT_NATIONALITY)))
            .andExpect(jsonPath("$.[*].address").value(hasItem(DEFAULT_ADDRESS)))
            .andExpect(jsonPath("$.[*].city").value(hasItem(DEFAULT_CITY)))
            .andExpect(jsonPath("$.[*].personalEmail").value(hasItem(DEFAULT_PERSONAL_EMAIL)))
            .andExpect(jsonPath("$.[*].professionalEmail").value(hasItem(DEFAULT_PROFESSIONAL_EMAIL)))
            .andExpect(jsonPath("$.[*].phoneNumber").value(hasItem(DEFAULT_PHONE_NUMBER)))
            .andExpect(jsonPath("$.[*].cnssNumber").value(hasItem(DEFAULT_CNSS_NUMBER)))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY.toString())))
            .andExpect(jsonPath("$.[*].photoUrl").value(hasItem(DEFAULT_PHOTO_URL)))
            .andExpect(jsonPath("$.[*].hireDate").value(hasItem(DEFAULT_HIRE_DATE.toString())))
            .andExpect(jsonPath("$.[*].trialEndDate").value(hasItem(DEFAULT_TRIAL_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())))
            .andExpect(jsonPath("$.[*].updatedAt").value(hasItem(DEFAULT_UPDATED_AT.toString())));

        // Check, that the count call also returns 1
        restEmployeeMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultEmployeeShouldNotBeFound(String filter) throws Exception {
        restEmployeeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restEmployeeMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingEmployee() throws Exception {
        // Get the employee
        restEmployeeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingEmployee() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the employee
        Employee updatedEmployee = employeeRepository.findById(employee.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedEmployee are not directly saved in db
        em.detach(updatedEmployee);
        updatedEmployee
            .matricule(UPDATED_MATRICULE)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .firstNameAr(UPDATED_FIRST_NAME_AR)
            .lastNameAr(UPDATED_LAST_NAME_AR)
            .birthDate(UPDATED_BIRTH_DATE)
            .birthPlace(UPDATED_BIRTH_PLACE)
            .gender(UPDATED_GENDER)
            .maritalStatus(UPDATED_MARITAL_STATUS)
            .numberOfChildren(UPDATED_NUMBER_OF_CHILDREN)
            .chefDeFamille(UPDATED_CHEF_DE_FAMILLE)
            .nationalId(UPDATED_NATIONAL_ID)
            .passportNumber(UPDATED_PASSPORT_NUMBER)
            .nationality(UPDATED_NATIONALITY)
            .address(UPDATED_ADDRESS)
            .city(UPDATED_CITY)
            .personalEmail(UPDATED_PERSONAL_EMAIL)
            .professionalEmail(UPDATED_PROFESSIONAL_EMAIL)
            .phoneNumber(UPDATED_PHONE_NUMBER)
            .cnssNumber(UPDATED_CNSS_NUMBER)
            .category(UPDATED_CATEGORY)
            .photoUrl(UPDATED_PHOTO_URL)
            .hireDate(UPDATED_HIRE_DATE)
            .trialEndDate(UPDATED_TRIAL_END_DATE)
            .active(UPDATED_ACTIVE)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);
        EmployeeDTO employeeDTO = employeeMapper.toDto(updatedEmployee);

        restEmployeeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, employeeDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(employeeDTO))
            )
            .andExpect(status().isOk());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedEmployeeToMatchAllProperties(updatedEmployee);
    }

    @Test
    @Transactional
    void putNonExistingEmployee() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employee.setId(longCount.incrementAndGet());

        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEmployeeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, employeeDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(employeeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEmployee() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employee.setId(longCount.incrementAndGet());

        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(employeeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEmployee() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employee.setId(longCount.incrementAndGet());

        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEmployeeWithPatch() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the employee using partial update
        Employee partialUpdatedEmployee = new Employee();
        partialUpdatedEmployee.setId(employee.getId());

        partialUpdatedEmployee
            .matricule(UPDATED_MATRICULE)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .firstNameAr(UPDATED_FIRST_NAME_AR)
            .birthDate(UPDATED_BIRTH_DATE)
            .gender(UPDATED_GENDER)
            .maritalStatus(UPDATED_MARITAL_STATUS)
            .chefDeFamille(UPDATED_CHEF_DE_FAMILLE)
            .nationality(UPDATED_NATIONALITY)
            .city(UPDATED_CITY)
            .professionalEmail(UPDATED_PROFESSIONAL_EMAIL)
            .category(UPDATED_CATEGORY)
            .photoUrl(UPDATED_PHOTO_URL)
            .trialEndDate(UPDATED_TRIAL_END_DATE)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);

        restEmployeeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEmployee.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEmployee))
            )
            .andExpect(status().isOk());

        // Validate the Employee in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEmployeeUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedEmployee, employee), getPersistedEmployee(employee));
    }

    @Test
    @Transactional
    void fullUpdateEmployeeWithPatch() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the employee using partial update
        Employee partialUpdatedEmployee = new Employee();
        partialUpdatedEmployee.setId(employee.getId());

        partialUpdatedEmployee
            .matricule(UPDATED_MATRICULE)
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .firstNameAr(UPDATED_FIRST_NAME_AR)
            .lastNameAr(UPDATED_LAST_NAME_AR)
            .birthDate(UPDATED_BIRTH_DATE)
            .birthPlace(UPDATED_BIRTH_PLACE)
            .gender(UPDATED_GENDER)
            .maritalStatus(UPDATED_MARITAL_STATUS)
            .numberOfChildren(UPDATED_NUMBER_OF_CHILDREN)
            .chefDeFamille(UPDATED_CHEF_DE_FAMILLE)
            .nationalId(UPDATED_NATIONAL_ID)
            .passportNumber(UPDATED_PASSPORT_NUMBER)
            .nationality(UPDATED_NATIONALITY)
            .address(UPDATED_ADDRESS)
            .city(UPDATED_CITY)
            .personalEmail(UPDATED_PERSONAL_EMAIL)
            .professionalEmail(UPDATED_PROFESSIONAL_EMAIL)
            .phoneNumber(UPDATED_PHONE_NUMBER)
            .cnssNumber(UPDATED_CNSS_NUMBER)
            .category(UPDATED_CATEGORY)
            .photoUrl(UPDATED_PHOTO_URL)
            .hireDate(UPDATED_HIRE_DATE)
            .trialEndDate(UPDATED_TRIAL_END_DATE)
            .active(UPDATED_ACTIVE)
            .notes(UPDATED_NOTES)
            .createdAt(UPDATED_CREATED_AT)
            .updatedAt(UPDATED_UPDATED_AT);

        restEmployeeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEmployee.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEmployee))
            )
            .andExpect(status().isOk());

        // Validate the Employee in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEmployeeUpdatableFieldsEquals(partialUpdatedEmployee, getPersistedEmployee(partialUpdatedEmployee));
    }

    @Test
    @Transactional
    void patchNonExistingEmployee() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employee.setId(longCount.incrementAndGet());

        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEmployeeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, employeeDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(employeeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEmployee() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employee.setId(longCount.incrementAndGet());

        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(employeeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEmployee() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        employee.setId(longCount.incrementAndGet());

        // Create the Employee
        EmployeeDTO employeeDTO = employeeMapper.toDto(employee);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEmployeeMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(employeeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Employee in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEmployee() throws Exception {
        // Initialize the database
        insertedEmployee = employeeRepository.saveAndFlush(employee);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the employee
        restEmployeeMockMvc
            .perform(delete(ENTITY_API_URL_ID, employee.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return employeeRepository.count();
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

    protected Employee getPersistedEmployee(Employee employee) {
        return employeeRepository.findById(employee.getId()).orElseThrow();
    }

    protected void assertPersistedEmployeeToMatchAllProperties(Employee expectedEmployee) {
        assertEmployeeAllPropertiesEquals(expectedEmployee, getPersistedEmployee(expectedEmployee));
    }

    protected void assertPersistedEmployeeToMatchUpdatableProperties(Employee expectedEmployee) {
        assertEmployeeAllUpdatablePropertiesEquals(expectedEmployee, getPersistedEmployee(expectedEmployee));
    }
}
