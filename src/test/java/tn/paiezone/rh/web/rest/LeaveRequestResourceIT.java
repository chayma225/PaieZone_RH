package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.LeaveRequestAsserts.*;
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
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.LeaveRequest;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.LeaveStatus;
import tn.paiezone.rh.repository.LeaveRequestRepository;
import tn.paiezone.rh.service.dto.LeaveRequestDTO;
import tn.paiezone.rh.service.mapper.LeaveRequestMapper;

/**
 * Integration tests for the {@link LeaveRequestResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class LeaveRequestResourceIT {

    private static final LocalDate DEFAULT_START_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_START_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_START_DATE = LocalDate.ofEpochDay(-1L);

    private static final LocalDate DEFAULT_END_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_END_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_END_DATE = LocalDate.ofEpochDay(-1L);

    private static final Integer DEFAULT_NUMBER_OF_DAYS = 1;
    private static final Integer UPDATED_NUMBER_OF_DAYS = 2;
    private static final Integer SMALLER_NUMBER_OF_DAYS = 1 - 1;

    private static final LeaveStatus DEFAULT_STATUS = LeaveStatus.DRAFT;
    private static final LeaveStatus UPDATED_STATUS = LeaveStatus.PENDING;

    private static final Instant DEFAULT_REQUESTED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_REQUESTED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_PROCESSED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_PROCESSED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_MANAGER_COMMENT = "AAAAAAAAAA";
    private static final String UPDATED_MANAGER_COMMENT = "BBBBBBBBBB";

    private static final String DEFAULT_EMPLOYEE_COMMENT = "AAAAAAAAAA";
    private static final String UPDATED_EMPLOYEE_COMMENT = "BBBBBBBBBB";

    private static final String DEFAULT_DOCUMENT_URL = "AAAAAAAAAA";
    private static final String UPDATED_DOCUMENT_URL = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/leave-requests";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveRequestMapper leaveRequestMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLeaveRequestMockMvc;

    private LeaveRequest leaveRequest;

    private LeaveRequest insertedLeaveRequest;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LeaveRequest createEntity(EntityManager em) {
        LeaveRequest leaveRequest = new LeaveRequest()
            .startDate(DEFAULT_START_DATE)
            .endDate(DEFAULT_END_DATE)
            .numberOfDays(DEFAULT_NUMBER_OF_DAYS)
            .status(DEFAULT_STATUS)
            .requestedAt(DEFAULT_REQUESTED_AT)
            .processedAt(DEFAULT_PROCESSED_AT)
            .managerComment(DEFAULT_MANAGER_COMMENT)
            .employeeComment(DEFAULT_EMPLOYEE_COMMENT)
            .documentUrl(DEFAULT_DOCUMENT_URL);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        leaveRequest.setEmployee(employee);
        // Add required entity
        LeaveType leaveType;
        if (TestUtil.findAll(em, LeaveType.class).isEmpty()) {
            leaveType = LeaveTypeResourceIT.createEntity(em);
            em.persist(leaveType);
            em.flush();
        } else {
            leaveType = TestUtil.findAll(em, LeaveType.class).get(0);
        }
        leaveRequest.setLeaveType(leaveType);
        return leaveRequest;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LeaveRequest createUpdatedEntity(EntityManager em) {
        LeaveRequest updatedLeaveRequest = new LeaveRequest()
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .numberOfDays(UPDATED_NUMBER_OF_DAYS)
            .status(UPDATED_STATUS)
            .requestedAt(UPDATED_REQUESTED_AT)
            .processedAt(UPDATED_PROCESSED_AT)
            .managerComment(UPDATED_MANAGER_COMMENT)
            .employeeComment(UPDATED_EMPLOYEE_COMMENT)
            .documentUrl(UPDATED_DOCUMENT_URL);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedLeaveRequest.setEmployee(employee);
        // Add required entity
        LeaveType leaveType;
        if (TestUtil.findAll(em, LeaveType.class).isEmpty()) {
            leaveType = LeaveTypeResourceIT.createUpdatedEntity(em);
            em.persist(leaveType);
            em.flush();
        } else {
            leaveType = TestUtil.findAll(em, LeaveType.class).get(0);
        }
        updatedLeaveRequest.setLeaveType(leaveType);
        return updatedLeaveRequest;
    }

    @BeforeEach
    void initTest() {
        leaveRequest = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedLeaveRequest != null) {
            leaveRequestRepository.delete(insertedLeaveRequest);
            insertedLeaveRequest = null;
        }
    }

    @Test
    @Transactional
    void createLeaveRequest() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);
        var returnedLeaveRequestDTO = om.readValue(
            restLeaveRequestMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            LeaveRequestDTO.class
        );

        // Validate the LeaveRequest in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedLeaveRequest = leaveRequestMapper.toEntity(returnedLeaveRequestDTO);
        assertLeaveRequestUpdatableFieldsEquals(returnedLeaveRequest, getPersistedLeaveRequest(returnedLeaveRequest));

        insertedLeaveRequest = returnedLeaveRequest;
    }

    @Test
    @Transactional
    void createLeaveRequestWithExistingId() throws Exception {
        // Create the LeaveRequest with an existing ID
        leaveRequest.setId(1L);
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restLeaveRequestMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isBadRequest());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkStartDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveRequest.setStartDate(null);

        // Create the LeaveRequest, which fails.
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        restLeaveRequestMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEndDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveRequest.setEndDate(null);

        // Create the LeaveRequest, which fails.
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        restLeaveRequestMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNumberOfDaysIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveRequest.setNumberOfDays(null);

        // Create the LeaveRequest, which fails.
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        restLeaveRequestMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveRequest.setStatus(null);

        // Create the LeaveRequest, which fails.
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        restLeaveRequestMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRequestedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveRequest.setRequestedAt(null);

        // Create the LeaveRequest, which fails.
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        restLeaveRequestMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllLeaveRequests() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList
        restLeaveRequestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(leaveRequest.getId().intValue())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].numberOfDays").value(hasItem(DEFAULT_NUMBER_OF_DAYS)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].requestedAt").value(hasItem(DEFAULT_REQUESTED_AT.toString())))
            .andExpect(jsonPath("$.[*].processedAt").value(hasItem(DEFAULT_PROCESSED_AT.toString())))
            .andExpect(jsonPath("$.[*].managerComment").value(hasItem(DEFAULT_MANAGER_COMMENT)))
            .andExpect(jsonPath("$.[*].employeeComment").value(hasItem(DEFAULT_EMPLOYEE_COMMENT)))
            .andExpect(jsonPath("$.[*].documentUrl").value(hasItem(DEFAULT_DOCUMENT_URL)));
    }

    @Test
    @Transactional
    void getLeaveRequest() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get the leaveRequest
        restLeaveRequestMockMvc
            .perform(get(ENTITY_API_URL_ID, leaveRequest.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(leaveRequest.getId().intValue()))
            .andExpect(jsonPath("$.startDate").value(DEFAULT_START_DATE.toString()))
            .andExpect(jsonPath("$.endDate").value(DEFAULT_END_DATE.toString()))
            .andExpect(jsonPath("$.numberOfDays").value(DEFAULT_NUMBER_OF_DAYS))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.requestedAt").value(DEFAULT_REQUESTED_AT.toString()))
            .andExpect(jsonPath("$.processedAt").value(DEFAULT_PROCESSED_AT.toString()))
            .andExpect(jsonPath("$.managerComment").value(DEFAULT_MANAGER_COMMENT))
            .andExpect(jsonPath("$.employeeComment").value(DEFAULT_EMPLOYEE_COMMENT))
            .andExpect(jsonPath("$.documentUrl").value(DEFAULT_DOCUMENT_URL));
    }

    @Test
    @Transactional
    void getLeaveRequestsByIdFiltering() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        Long id = leaveRequest.getId();

        defaultLeaveRequestFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultLeaveRequestFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultLeaveRequestFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate equals to
        defaultLeaveRequestFiltering("startDate.equals=" + DEFAULT_START_DATE, "startDate.equals=" + UPDATED_START_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate in
        defaultLeaveRequestFiltering("startDate.in=" + DEFAULT_START_DATE + "," + UPDATED_START_DATE, "startDate.in=" + UPDATED_START_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate is not null
        defaultLeaveRequestFiltering("startDate.specified=true", "startDate.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate is greater than or equal to
        defaultLeaveRequestFiltering(
            "startDate.greaterThanOrEqual=" + DEFAULT_START_DATE,
            "startDate.greaterThanOrEqual=" + UPDATED_START_DATE
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate is less than or equal to
        defaultLeaveRequestFiltering("startDate.lessThanOrEqual=" + DEFAULT_START_DATE, "startDate.lessThanOrEqual=" + SMALLER_START_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate is less than
        defaultLeaveRequestFiltering("startDate.lessThan=" + UPDATED_START_DATE, "startDate.lessThan=" + DEFAULT_START_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStartDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where startDate is greater than
        defaultLeaveRequestFiltering("startDate.greaterThan=" + SMALLER_START_DATE, "startDate.greaterThan=" + DEFAULT_START_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate equals to
        defaultLeaveRequestFiltering("endDate.equals=" + DEFAULT_END_DATE, "endDate.equals=" + UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate in
        defaultLeaveRequestFiltering("endDate.in=" + DEFAULT_END_DATE + "," + UPDATED_END_DATE, "endDate.in=" + UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate is not null
        defaultLeaveRequestFiltering("endDate.specified=true", "endDate.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate is greater than or equal to
        defaultLeaveRequestFiltering("endDate.greaterThanOrEqual=" + DEFAULT_END_DATE, "endDate.greaterThanOrEqual=" + UPDATED_END_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate is less than or equal to
        defaultLeaveRequestFiltering("endDate.lessThanOrEqual=" + DEFAULT_END_DATE, "endDate.lessThanOrEqual=" + SMALLER_END_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate is less than
        defaultLeaveRequestFiltering("endDate.lessThan=" + UPDATED_END_DATE, "endDate.lessThan=" + DEFAULT_END_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEndDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where endDate is greater than
        defaultLeaveRequestFiltering("endDate.greaterThan=" + SMALLER_END_DATE, "endDate.greaterThan=" + DEFAULT_END_DATE);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays equals to
        defaultLeaveRequestFiltering("numberOfDays.equals=" + DEFAULT_NUMBER_OF_DAYS, "numberOfDays.equals=" + UPDATED_NUMBER_OF_DAYS);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays in
        defaultLeaveRequestFiltering(
            "numberOfDays.in=" + DEFAULT_NUMBER_OF_DAYS + "," + UPDATED_NUMBER_OF_DAYS,
            "numberOfDays.in=" + UPDATED_NUMBER_OF_DAYS
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays is not null
        defaultLeaveRequestFiltering("numberOfDays.specified=true", "numberOfDays.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays is greater than or equal to
        defaultLeaveRequestFiltering(
            "numberOfDays.greaterThanOrEqual=" + DEFAULT_NUMBER_OF_DAYS,
            "numberOfDays.greaterThanOrEqual=" + UPDATED_NUMBER_OF_DAYS
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays is less than or equal to
        defaultLeaveRequestFiltering(
            "numberOfDays.lessThanOrEqual=" + DEFAULT_NUMBER_OF_DAYS,
            "numberOfDays.lessThanOrEqual=" + SMALLER_NUMBER_OF_DAYS
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays is less than
        defaultLeaveRequestFiltering("numberOfDays.lessThan=" + UPDATED_NUMBER_OF_DAYS, "numberOfDays.lessThan=" + DEFAULT_NUMBER_OF_DAYS);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByNumberOfDaysIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where numberOfDays is greater than
        defaultLeaveRequestFiltering(
            "numberOfDays.greaterThan=" + SMALLER_NUMBER_OF_DAYS,
            "numberOfDays.greaterThan=" + DEFAULT_NUMBER_OF_DAYS
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where status equals to
        defaultLeaveRequestFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where status in
        defaultLeaveRequestFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where status is not null
        defaultLeaveRequestFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByRequestedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where requestedAt equals to
        defaultLeaveRequestFiltering("requestedAt.equals=" + DEFAULT_REQUESTED_AT, "requestedAt.equals=" + UPDATED_REQUESTED_AT);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByRequestedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where requestedAt in
        defaultLeaveRequestFiltering(
            "requestedAt.in=" + DEFAULT_REQUESTED_AT + "," + UPDATED_REQUESTED_AT,
            "requestedAt.in=" + UPDATED_REQUESTED_AT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByRequestedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where requestedAt is not null
        defaultLeaveRequestFiltering("requestedAt.specified=true", "requestedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByProcessedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where processedAt equals to
        defaultLeaveRequestFiltering("processedAt.equals=" + DEFAULT_PROCESSED_AT, "processedAt.equals=" + UPDATED_PROCESSED_AT);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByProcessedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where processedAt in
        defaultLeaveRequestFiltering(
            "processedAt.in=" + DEFAULT_PROCESSED_AT + "," + UPDATED_PROCESSED_AT,
            "processedAt.in=" + UPDATED_PROCESSED_AT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByProcessedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where processedAt is not null
        defaultLeaveRequestFiltering("processedAt.specified=true", "processedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByManagerCommentIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where managerComment equals to
        defaultLeaveRequestFiltering(
            "managerComment.equals=" + DEFAULT_MANAGER_COMMENT,
            "managerComment.equals=" + UPDATED_MANAGER_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByManagerCommentIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where managerComment in
        defaultLeaveRequestFiltering(
            "managerComment.in=" + DEFAULT_MANAGER_COMMENT + "," + UPDATED_MANAGER_COMMENT,
            "managerComment.in=" + UPDATED_MANAGER_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByManagerCommentIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where managerComment is not null
        defaultLeaveRequestFiltering("managerComment.specified=true", "managerComment.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByManagerCommentContainsSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where managerComment contains
        defaultLeaveRequestFiltering(
            "managerComment.contains=" + DEFAULT_MANAGER_COMMENT,
            "managerComment.contains=" + UPDATED_MANAGER_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByManagerCommentNotContainsSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where managerComment does not contain
        defaultLeaveRequestFiltering(
            "managerComment.doesNotContain=" + UPDATED_MANAGER_COMMENT,
            "managerComment.doesNotContain=" + DEFAULT_MANAGER_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEmployeeCommentIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where employeeComment equals to
        defaultLeaveRequestFiltering(
            "employeeComment.equals=" + DEFAULT_EMPLOYEE_COMMENT,
            "employeeComment.equals=" + UPDATED_EMPLOYEE_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEmployeeCommentIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where employeeComment in
        defaultLeaveRequestFiltering(
            "employeeComment.in=" + DEFAULT_EMPLOYEE_COMMENT + "," + UPDATED_EMPLOYEE_COMMENT,
            "employeeComment.in=" + UPDATED_EMPLOYEE_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEmployeeCommentIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where employeeComment is not null
        defaultLeaveRequestFiltering("employeeComment.specified=true", "employeeComment.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEmployeeCommentContainsSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where employeeComment contains
        defaultLeaveRequestFiltering(
            "employeeComment.contains=" + DEFAULT_EMPLOYEE_COMMENT,
            "employeeComment.contains=" + UPDATED_EMPLOYEE_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEmployeeCommentNotContainsSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where employeeComment does not contain
        defaultLeaveRequestFiltering(
            "employeeComment.doesNotContain=" + UPDATED_EMPLOYEE_COMMENT,
            "employeeComment.doesNotContain=" + DEFAULT_EMPLOYEE_COMMENT
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByDocumentUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where documentUrl equals to
        defaultLeaveRequestFiltering("documentUrl.equals=" + DEFAULT_DOCUMENT_URL, "documentUrl.equals=" + UPDATED_DOCUMENT_URL);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByDocumentUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where documentUrl in
        defaultLeaveRequestFiltering(
            "documentUrl.in=" + DEFAULT_DOCUMENT_URL + "," + UPDATED_DOCUMENT_URL,
            "documentUrl.in=" + UPDATED_DOCUMENT_URL
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByDocumentUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where documentUrl is not null
        defaultLeaveRequestFiltering("documentUrl.specified=true", "documentUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByDocumentUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where documentUrl contains
        defaultLeaveRequestFiltering("documentUrl.contains=" + DEFAULT_DOCUMENT_URL, "documentUrl.contains=" + UPDATED_DOCUMENT_URL);
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByDocumentUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        // Get all the leaveRequestList where documentUrl does not contain
        defaultLeaveRequestFiltering(
            "documentUrl.doesNotContain=" + UPDATED_DOCUMENT_URL,
            "documentUrl.doesNotContain=" + DEFAULT_DOCUMENT_URL
        );
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            leaveRequestRepository.saveAndFlush(leaveRequest);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        leaveRequest.setEmployee(employee);
        leaveRequestRepository.saveAndFlush(leaveRequest);
        Long employeeId = employee.getId();
        // Get all the leaveRequestList where employee equals to employeeId
        defaultLeaveRequestShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the leaveRequestList where employee equals to (employeeId + 1)
        defaultLeaveRequestShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByLeaveTypeIsEqualToSomething() throws Exception {
        LeaveType leaveType;
        if (TestUtil.findAll(em, LeaveType.class).isEmpty()) {
            leaveRequestRepository.saveAndFlush(leaveRequest);
            leaveType = LeaveTypeResourceIT.createEntity(em);
        } else {
            leaveType = TestUtil.findAll(em, LeaveType.class).get(0);
        }
        em.persist(leaveType);
        em.flush();
        leaveRequest.setLeaveType(leaveType);
        leaveRequestRepository.saveAndFlush(leaveRequest);
        Long leaveTypeId = leaveType.getId();
        // Get all the leaveRequestList where leaveType equals to leaveTypeId
        defaultLeaveRequestShouldBeFound("leaveTypeId.equals=" + leaveTypeId);

        // Get all the leaveRequestList where leaveType equals to (leaveTypeId + 1)
        defaultLeaveRequestShouldNotBeFound("leaveTypeId.equals=" + (leaveTypeId + 1));
    }

    @Test
    @Transactional
    void getAllLeaveRequestsByApprovedByIsEqualToSomething() throws Exception {
        UserProfile approvedBy;
        if (TestUtil.findAll(em, UserProfile.class).isEmpty()) {
            leaveRequestRepository.saveAndFlush(leaveRequest);
            approvedBy = UserProfileResourceIT.createEntity(em);
        } else {
            approvedBy = TestUtil.findAll(em, UserProfile.class).get(0);
        }
        em.persist(approvedBy);
        em.flush();
        leaveRequest.setApprovedBy(approvedBy);
        leaveRequestRepository.saveAndFlush(leaveRequest);
        Long approvedById = approvedBy.getId();
        // Get all the leaveRequestList where approvedBy equals to approvedById
        defaultLeaveRequestShouldBeFound("approvedById.equals=" + approvedById);

        // Get all the leaveRequestList where approvedBy equals to (approvedById + 1)
        defaultLeaveRequestShouldNotBeFound("approvedById.equals=" + (approvedById + 1));
    }

    private void defaultLeaveRequestFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultLeaveRequestShouldBeFound(shouldBeFound);
        defaultLeaveRequestShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultLeaveRequestShouldBeFound(String filter) throws Exception {
        restLeaveRequestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(leaveRequest.getId().intValue())))
            .andExpect(jsonPath("$.[*].startDate").value(hasItem(DEFAULT_START_DATE.toString())))
            .andExpect(jsonPath("$.[*].endDate").value(hasItem(DEFAULT_END_DATE.toString())))
            .andExpect(jsonPath("$.[*].numberOfDays").value(hasItem(DEFAULT_NUMBER_OF_DAYS)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].requestedAt").value(hasItem(DEFAULT_REQUESTED_AT.toString())))
            .andExpect(jsonPath("$.[*].processedAt").value(hasItem(DEFAULT_PROCESSED_AT.toString())))
            .andExpect(jsonPath("$.[*].managerComment").value(hasItem(DEFAULT_MANAGER_COMMENT)))
            .andExpect(jsonPath("$.[*].employeeComment").value(hasItem(DEFAULT_EMPLOYEE_COMMENT)))
            .andExpect(jsonPath("$.[*].documentUrl").value(hasItem(DEFAULT_DOCUMENT_URL)));

        // Check, that the count call also returns 1
        restLeaveRequestMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultLeaveRequestShouldNotBeFound(String filter) throws Exception {
        restLeaveRequestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restLeaveRequestMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingLeaveRequest() throws Exception {
        // Get the leaveRequest
        restLeaveRequestMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingLeaveRequest() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveRequest
        LeaveRequest updatedLeaveRequest = leaveRequestRepository.findById(leaveRequest.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedLeaveRequest are not directly saved in db
        em.detach(updatedLeaveRequest);
        updatedLeaveRequest
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .numberOfDays(UPDATED_NUMBER_OF_DAYS)
            .status(UPDATED_STATUS)
            .requestedAt(UPDATED_REQUESTED_AT)
            .processedAt(UPDATED_PROCESSED_AT)
            .managerComment(UPDATED_MANAGER_COMMENT)
            .employeeComment(UPDATED_EMPLOYEE_COMMENT)
            .documentUrl(UPDATED_DOCUMENT_URL);
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(updatedLeaveRequest);

        restLeaveRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveRequestDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveRequestDTO))
            )
            .andExpect(status().isOk());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedLeaveRequestToMatchAllProperties(updatedLeaveRequest);
    }

    @Test
    @Transactional
    void putNonExistingLeaveRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveRequest.setId(longCount.incrementAndGet());

        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveRequestDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchLeaveRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveRequest.setId(longCount.incrementAndGet());

        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLeaveRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveRequest.setId(longCount.incrementAndGet());

        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveRequestMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateLeaveRequestWithPatch() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveRequest using partial update
        LeaveRequest partialUpdatedLeaveRequest = new LeaveRequest();
        partialUpdatedLeaveRequest.setId(leaveRequest.getId());

        partialUpdatedLeaveRequest
            .endDate(UPDATED_END_DATE)
            .requestedAt(UPDATED_REQUESTED_AT)
            .managerComment(UPDATED_MANAGER_COMMENT)
            .documentUrl(UPDATED_DOCUMENT_URL);

        restLeaveRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaveRequest.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeaveRequest))
            )
            .andExpect(status().isOk());

        // Validate the LeaveRequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveRequestUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedLeaveRequest, leaveRequest),
            getPersistedLeaveRequest(leaveRequest)
        );
    }

    @Test
    @Transactional
    void fullUpdateLeaveRequestWithPatch() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveRequest using partial update
        LeaveRequest partialUpdatedLeaveRequest = new LeaveRequest();
        partialUpdatedLeaveRequest.setId(leaveRequest.getId());

        partialUpdatedLeaveRequest
            .startDate(UPDATED_START_DATE)
            .endDate(UPDATED_END_DATE)
            .numberOfDays(UPDATED_NUMBER_OF_DAYS)
            .status(UPDATED_STATUS)
            .requestedAt(UPDATED_REQUESTED_AT)
            .processedAt(UPDATED_PROCESSED_AT)
            .managerComment(UPDATED_MANAGER_COMMENT)
            .employeeComment(UPDATED_EMPLOYEE_COMMENT)
            .documentUrl(UPDATED_DOCUMENT_URL);

        restLeaveRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaveRequest.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeaveRequest))
            )
            .andExpect(status().isOk());

        // Validate the LeaveRequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveRequestUpdatableFieldsEquals(partialUpdatedLeaveRequest, getPersistedLeaveRequest(partialUpdatedLeaveRequest));
    }

    @Test
    @Transactional
    void patchNonExistingLeaveRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveRequest.setId(longCount.incrementAndGet());

        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, leaveRequestDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLeaveRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveRequest.setId(longCount.incrementAndGet());

        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLeaveRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveRequest.setId(longCount.incrementAndGet());

        // Create the LeaveRequest
        LeaveRequestDTO leaveRequestDTO = leaveRequestMapper.toDto(leaveRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveRequestMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(leaveRequestDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the LeaveRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteLeaveRequest() throws Exception {
        // Initialize the database
        insertedLeaveRequest = leaveRequestRepository.saveAndFlush(leaveRequest);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the leaveRequest
        restLeaveRequestMockMvc
            .perform(delete(ENTITY_API_URL_ID, leaveRequest.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return leaveRequestRepository.count();
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

    protected LeaveRequest getPersistedLeaveRequest(LeaveRequest leaveRequest) {
        return leaveRequestRepository.findById(leaveRequest.getId()).orElseThrow();
    }

    protected void assertPersistedLeaveRequestToMatchAllProperties(LeaveRequest expectedLeaveRequest) {
        assertLeaveRequestAllPropertiesEquals(expectedLeaveRequest, getPersistedLeaveRequest(expectedLeaveRequest));
    }

    protected void assertPersistedLeaveRequestToMatchUpdatableProperties(LeaveRequest expectedLeaveRequest) {
        assertLeaveRequestAllUpdatablePropertiesEquals(expectedLeaveRequest, getPersistedLeaveRequest(expectedLeaveRequest));
    }
}
