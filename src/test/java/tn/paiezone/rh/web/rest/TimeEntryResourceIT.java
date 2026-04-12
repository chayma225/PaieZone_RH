package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.TimeEntryAsserts.*;
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
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.IntegrationTest;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.TimeEntry;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.TimeEntrySource;
import tn.paiezone.rh.domain.enumeration.TimeEntryStatus;
import tn.paiezone.rh.repository.TimeEntryRepository;
import tn.paiezone.rh.service.dto.TimeEntryDTO;
import tn.paiezone.rh.service.mapper.TimeEntryMapper;

/**
 * Integration tests for the {@link TimeEntryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class TimeEntryResourceIT {

    private static final LocalDate DEFAULT_ENTRY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_ENTRY_DATE = LocalDate.now(ZoneId.systemDefault());
    private static final LocalDate SMALLER_ENTRY_DATE = LocalDate.ofEpochDay(-1L);

    private static final Instant DEFAULT_CHECK_IN = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CHECK_IN = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Instant DEFAULT_CHECK_OUT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CHECK_OUT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final BigDecimal DEFAULT_WORKED_HOURS = new BigDecimal(1);
    private static final BigDecimal UPDATED_WORKED_HOURS = new BigDecimal(2);
    private static final BigDecimal SMALLER_WORKED_HOURS = new BigDecimal(1 - 1);

    private static final BigDecimal DEFAULT_OVERTIME_HOURS = new BigDecimal(1);
    private static final BigDecimal UPDATED_OVERTIME_HOURS = new BigDecimal(2);
    private static final BigDecimal SMALLER_OVERTIME_HOURS = new BigDecimal(1 - 1);

    private static final Integer DEFAULT_LATE_MINUTES = 1;
    private static final Integer UPDATED_LATE_MINUTES = 2;
    private static final Integer SMALLER_LATE_MINUTES = 1 - 1;

    private static final TimeEntrySource DEFAULT_SOURCE = TimeEntrySource.MANUAL;
    private static final TimeEntrySource UPDATED_SOURCE = TimeEntrySource.BADGE;

    private static final TimeEntryStatus DEFAULT_STATUS = TimeEntryStatus.PENDING;
    private static final TimeEntryStatus UPDATED_STATUS = TimeEntryStatus.VALIDATED;

    private static final String DEFAULT_ANOMALY_NOTE = "AAAAAAAAAA";
    private static final String UPDATED_ANOMALY_NOTE = "BBBBBBBBBB";

    private static final String DEFAULT_VALIDATED_BY = "AAAAAAAAAA";
    private static final String UPDATED_VALIDATED_BY = "BBBBBBBBBB";

    private static final Instant DEFAULT_VALIDATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_VALIDATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/time-entries";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private TimeEntryRepository timeEntryRepository;

    @Autowired
    private TimeEntryMapper timeEntryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restTimeEntryMockMvc;

    private TimeEntry timeEntry;

    private TimeEntry insertedTimeEntry;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeEntry createEntity(EntityManager em) {
        TimeEntry timeEntry = new TimeEntry()
            .entryDate(DEFAULT_ENTRY_DATE)
            .checkIn(DEFAULT_CHECK_IN)
            .checkOut(DEFAULT_CHECK_OUT)
            .workedHours(DEFAULT_WORKED_HOURS)
            .overtimeHours(DEFAULT_OVERTIME_HOURS)
            .lateMinutes(DEFAULT_LATE_MINUTES)
            .source(DEFAULT_SOURCE)
            .status(DEFAULT_STATUS)
            .anomalyNote(DEFAULT_ANOMALY_NOTE)
            .validatedBy(DEFAULT_VALIDATED_BY)
            .validatedAt(DEFAULT_VALIDATED_AT);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        timeEntry.setEmployee(employee);
        return timeEntry;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static TimeEntry createUpdatedEntity(EntityManager em) {
        TimeEntry updatedTimeEntry = new TimeEntry()
            .entryDate(UPDATED_ENTRY_DATE)
            .checkIn(UPDATED_CHECK_IN)
            .checkOut(UPDATED_CHECK_OUT)
            .workedHours(UPDATED_WORKED_HOURS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .lateMinutes(UPDATED_LATE_MINUTES)
            .source(UPDATED_SOURCE)
            .status(UPDATED_STATUS)
            .anomalyNote(UPDATED_ANOMALY_NOTE)
            .validatedBy(UPDATED_VALIDATED_BY)
            .validatedAt(UPDATED_VALIDATED_AT);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedTimeEntry.setEmployee(employee);
        return updatedTimeEntry;
    }

    @BeforeEach
    void initTest() {
        timeEntry = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedTimeEntry != null) {
            timeEntryRepository.delete(insertedTimeEntry);
            insertedTimeEntry = null;
        }
    }

    @Test
    @Transactional
    void createTimeEntry() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);
        var returnedTimeEntryDTO = om.readValue(
            restTimeEntryMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            TimeEntryDTO.class
        );

        // Validate the TimeEntry in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedTimeEntry = timeEntryMapper.toEntity(returnedTimeEntryDTO);
        assertTimeEntryUpdatableFieldsEquals(returnedTimeEntry, getPersistedTimeEntry(returnedTimeEntry));

        insertedTimeEntry = returnedTimeEntry;
    }

    @Test
    @Transactional
    void createTimeEntryWithExistingId() throws Exception {
        // Create the TimeEntry with an existing ID
        timeEntry.setId(1L);
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEntryDateIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setEntryDate(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSourceIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setSource(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        timeEntry.setStatus(null);

        // Create the TimeEntry, which fails.
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        restTimeEntryMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllTimeEntries() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(timeEntry.getId().intValue())))
            .andExpect(jsonPath("$.[*].entryDate").value(hasItem(DEFAULT_ENTRY_DATE.toString())))
            .andExpect(jsonPath("$.[*].checkIn").value(hasItem(DEFAULT_CHECK_IN.toString())))
            .andExpect(jsonPath("$.[*].checkOut").value(hasItem(DEFAULT_CHECK_OUT.toString())))
            .andExpect(jsonPath("$.[*].workedHours").value(hasItem(sameNumber(DEFAULT_WORKED_HOURS))))
            .andExpect(jsonPath("$.[*].overtimeHours").value(hasItem(sameNumber(DEFAULT_OVERTIME_HOURS))))
            .andExpect(jsonPath("$.[*].lateMinutes").value(hasItem(DEFAULT_LATE_MINUTES)))
            .andExpect(jsonPath("$.[*].source").value(hasItem(DEFAULT_SOURCE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].anomalyNote").value(hasItem(DEFAULT_ANOMALY_NOTE)))
            .andExpect(jsonPath("$.[*].validatedBy").value(hasItem(DEFAULT_VALIDATED_BY)))
            .andExpect(jsonPath("$.[*].validatedAt").value(hasItem(DEFAULT_VALIDATED_AT.toString())));
    }

    @Test
    @Transactional
    void getTimeEntry() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get the timeEntry
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL_ID, timeEntry.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(timeEntry.getId().intValue()))
            .andExpect(jsonPath("$.entryDate").value(DEFAULT_ENTRY_DATE.toString()))
            .andExpect(jsonPath("$.checkIn").value(DEFAULT_CHECK_IN.toString()))
            .andExpect(jsonPath("$.checkOut").value(DEFAULT_CHECK_OUT.toString()))
            .andExpect(jsonPath("$.workedHours").value(sameNumber(DEFAULT_WORKED_HOURS)))
            .andExpect(jsonPath("$.overtimeHours").value(sameNumber(DEFAULT_OVERTIME_HOURS)))
            .andExpect(jsonPath("$.lateMinutes").value(DEFAULT_LATE_MINUTES))
            .andExpect(jsonPath("$.source").value(DEFAULT_SOURCE.toString()))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()))
            .andExpect(jsonPath("$.anomalyNote").value(DEFAULT_ANOMALY_NOTE))
            .andExpect(jsonPath("$.validatedBy").value(DEFAULT_VALIDATED_BY))
            .andExpect(jsonPath("$.validatedAt").value(DEFAULT_VALIDATED_AT.toString()));
    }

    @Test
    @Transactional
    void getTimeEntriesByIdFiltering() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        Long id = timeEntry.getId();

        defaultTimeEntryFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultTimeEntryFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultTimeEntryFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate equals to
        defaultTimeEntryFiltering("entryDate.equals=" + DEFAULT_ENTRY_DATE, "entryDate.equals=" + UPDATED_ENTRY_DATE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate in
        defaultTimeEntryFiltering("entryDate.in=" + DEFAULT_ENTRY_DATE + "," + UPDATED_ENTRY_DATE, "entryDate.in=" + UPDATED_ENTRY_DATE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate is not null
        defaultTimeEntryFiltering("entryDate.specified=true", "entryDate.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate is greater than or equal to
        defaultTimeEntryFiltering(
            "entryDate.greaterThanOrEqual=" + DEFAULT_ENTRY_DATE,
            "entryDate.greaterThanOrEqual=" + UPDATED_ENTRY_DATE
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate is less than or equal to
        defaultTimeEntryFiltering("entryDate.lessThanOrEqual=" + DEFAULT_ENTRY_DATE, "entryDate.lessThanOrEqual=" + SMALLER_ENTRY_DATE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate is less than
        defaultTimeEntryFiltering("entryDate.lessThan=" + UPDATED_ENTRY_DATE, "entryDate.lessThan=" + DEFAULT_ENTRY_DATE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEntryDateIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where entryDate is greater than
        defaultTimeEntryFiltering("entryDate.greaterThan=" + SMALLER_ENTRY_DATE, "entryDate.greaterThan=" + DEFAULT_ENTRY_DATE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByCheckInIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where checkIn equals to
        defaultTimeEntryFiltering("checkIn.equals=" + DEFAULT_CHECK_IN, "checkIn.equals=" + UPDATED_CHECK_IN);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByCheckInIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where checkIn in
        defaultTimeEntryFiltering("checkIn.in=" + DEFAULT_CHECK_IN + "," + UPDATED_CHECK_IN, "checkIn.in=" + UPDATED_CHECK_IN);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByCheckInIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where checkIn is not null
        defaultTimeEntryFiltering("checkIn.specified=true", "checkIn.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByCheckOutIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where checkOut equals to
        defaultTimeEntryFiltering("checkOut.equals=" + DEFAULT_CHECK_OUT, "checkOut.equals=" + UPDATED_CHECK_OUT);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByCheckOutIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where checkOut in
        defaultTimeEntryFiltering("checkOut.in=" + DEFAULT_CHECK_OUT + "," + UPDATED_CHECK_OUT, "checkOut.in=" + UPDATED_CHECK_OUT);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByCheckOutIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where checkOut is not null
        defaultTimeEntryFiltering("checkOut.specified=true", "checkOut.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours equals to
        defaultTimeEntryFiltering("workedHours.equals=" + DEFAULT_WORKED_HOURS, "workedHours.equals=" + UPDATED_WORKED_HOURS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours in
        defaultTimeEntryFiltering(
            "workedHours.in=" + DEFAULT_WORKED_HOURS + "," + UPDATED_WORKED_HOURS,
            "workedHours.in=" + UPDATED_WORKED_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours is not null
        defaultTimeEntryFiltering("workedHours.specified=true", "workedHours.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours is greater than or equal to
        defaultTimeEntryFiltering(
            "workedHours.greaterThanOrEqual=" + DEFAULT_WORKED_HOURS,
            "workedHours.greaterThanOrEqual=" + UPDATED_WORKED_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours is less than or equal to
        defaultTimeEntryFiltering(
            "workedHours.lessThanOrEqual=" + DEFAULT_WORKED_HOURS,
            "workedHours.lessThanOrEqual=" + SMALLER_WORKED_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours is less than
        defaultTimeEntryFiltering("workedHours.lessThan=" + UPDATED_WORKED_HOURS, "workedHours.lessThan=" + DEFAULT_WORKED_HOURS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByWorkedHoursIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where workedHours is greater than
        defaultTimeEntryFiltering("workedHours.greaterThan=" + SMALLER_WORKED_HOURS, "workedHours.greaterThan=" + DEFAULT_WORKED_HOURS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours equals to
        defaultTimeEntryFiltering("overtimeHours.equals=" + DEFAULT_OVERTIME_HOURS, "overtimeHours.equals=" + UPDATED_OVERTIME_HOURS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours in
        defaultTimeEntryFiltering(
            "overtimeHours.in=" + DEFAULT_OVERTIME_HOURS + "," + UPDATED_OVERTIME_HOURS,
            "overtimeHours.in=" + UPDATED_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours is not null
        defaultTimeEntryFiltering("overtimeHours.specified=true", "overtimeHours.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours is greater than or equal to
        defaultTimeEntryFiltering(
            "overtimeHours.greaterThanOrEqual=" + DEFAULT_OVERTIME_HOURS,
            "overtimeHours.greaterThanOrEqual=" + UPDATED_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours is less than or equal to
        defaultTimeEntryFiltering(
            "overtimeHours.lessThanOrEqual=" + DEFAULT_OVERTIME_HOURS,
            "overtimeHours.lessThanOrEqual=" + SMALLER_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours is less than
        defaultTimeEntryFiltering("overtimeHours.lessThan=" + UPDATED_OVERTIME_HOURS, "overtimeHours.lessThan=" + DEFAULT_OVERTIME_HOURS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByOvertimeHoursIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where overtimeHours is greater than
        defaultTimeEntryFiltering(
            "overtimeHours.greaterThan=" + SMALLER_OVERTIME_HOURS,
            "overtimeHours.greaterThan=" + DEFAULT_OVERTIME_HOURS
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes equals to
        defaultTimeEntryFiltering("lateMinutes.equals=" + DEFAULT_LATE_MINUTES, "lateMinutes.equals=" + UPDATED_LATE_MINUTES);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes in
        defaultTimeEntryFiltering(
            "lateMinutes.in=" + DEFAULT_LATE_MINUTES + "," + UPDATED_LATE_MINUTES,
            "lateMinutes.in=" + UPDATED_LATE_MINUTES
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes is not null
        defaultTimeEntryFiltering("lateMinutes.specified=true", "lateMinutes.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes is greater than or equal to
        defaultTimeEntryFiltering(
            "lateMinutes.greaterThanOrEqual=" + DEFAULT_LATE_MINUTES,
            "lateMinutes.greaterThanOrEqual=" + UPDATED_LATE_MINUTES
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes is less than or equal to
        defaultTimeEntryFiltering(
            "lateMinutes.lessThanOrEqual=" + DEFAULT_LATE_MINUTES,
            "lateMinutes.lessThanOrEqual=" + SMALLER_LATE_MINUTES
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes is less than
        defaultTimeEntryFiltering("lateMinutes.lessThan=" + UPDATED_LATE_MINUTES, "lateMinutes.lessThan=" + DEFAULT_LATE_MINUTES);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByLateMinutesIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where lateMinutes is greater than
        defaultTimeEntryFiltering("lateMinutes.greaterThan=" + SMALLER_LATE_MINUTES, "lateMinutes.greaterThan=" + DEFAULT_LATE_MINUTES);
    }

    @Test
    @Transactional
    void getAllTimeEntriesBySourceIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where source equals to
        defaultTimeEntryFiltering("source.equals=" + DEFAULT_SOURCE, "source.equals=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesBySourceIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where source in
        defaultTimeEntryFiltering("source.in=" + DEFAULT_SOURCE + "," + UPDATED_SOURCE, "source.in=" + UPDATED_SOURCE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesBySourceIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where source is not null
        defaultTimeEntryFiltering("source.specified=true", "source.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByStatusIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where status equals to
        defaultTimeEntryFiltering("status.equals=" + DEFAULT_STATUS, "status.equals=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByStatusIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where status in
        defaultTimeEntryFiltering("status.in=" + DEFAULT_STATUS + "," + UPDATED_STATUS, "status.in=" + UPDATED_STATUS);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByStatusIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where status is not null
        defaultTimeEntryFiltering("status.specified=true", "status.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByAnomalyNoteIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where anomalyNote equals to
        defaultTimeEntryFiltering("anomalyNote.equals=" + DEFAULT_ANOMALY_NOTE, "anomalyNote.equals=" + UPDATED_ANOMALY_NOTE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByAnomalyNoteIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where anomalyNote in
        defaultTimeEntryFiltering(
            "anomalyNote.in=" + DEFAULT_ANOMALY_NOTE + "," + UPDATED_ANOMALY_NOTE,
            "anomalyNote.in=" + UPDATED_ANOMALY_NOTE
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByAnomalyNoteIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where anomalyNote is not null
        defaultTimeEntryFiltering("anomalyNote.specified=true", "anomalyNote.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByAnomalyNoteContainsSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where anomalyNote contains
        defaultTimeEntryFiltering("anomalyNote.contains=" + DEFAULT_ANOMALY_NOTE, "anomalyNote.contains=" + UPDATED_ANOMALY_NOTE);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByAnomalyNoteNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where anomalyNote does not contain
        defaultTimeEntryFiltering(
            "anomalyNote.doesNotContain=" + UPDATED_ANOMALY_NOTE,
            "anomalyNote.doesNotContain=" + DEFAULT_ANOMALY_NOTE
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedByIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedBy equals to
        defaultTimeEntryFiltering("validatedBy.equals=" + DEFAULT_VALIDATED_BY, "validatedBy.equals=" + UPDATED_VALIDATED_BY);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedByIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedBy in
        defaultTimeEntryFiltering(
            "validatedBy.in=" + DEFAULT_VALIDATED_BY + "," + UPDATED_VALIDATED_BY,
            "validatedBy.in=" + UPDATED_VALIDATED_BY
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedByIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedBy is not null
        defaultTimeEntryFiltering("validatedBy.specified=true", "validatedBy.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedByContainsSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedBy contains
        defaultTimeEntryFiltering("validatedBy.contains=" + DEFAULT_VALIDATED_BY, "validatedBy.contains=" + UPDATED_VALIDATED_BY);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedByNotContainsSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedBy does not contain
        defaultTimeEntryFiltering(
            "validatedBy.doesNotContain=" + UPDATED_VALIDATED_BY,
            "validatedBy.doesNotContain=" + DEFAULT_VALIDATED_BY
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedAt equals to
        defaultTimeEntryFiltering("validatedAt.equals=" + DEFAULT_VALIDATED_AT, "validatedAt.equals=" + UPDATED_VALIDATED_AT);
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedAt in
        defaultTimeEntryFiltering(
            "validatedAt.in=" + DEFAULT_VALIDATED_AT + "," + UPDATED_VALIDATED_AT,
            "validatedAt.in=" + UPDATED_VALIDATED_AT
        );
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        // Get all the timeEntryList where validatedAt is not null
        defaultTimeEntryFiltering("validatedAt.specified=true", "validatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllTimeEntriesByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            timeEntryRepository.saveAndFlush(timeEntry);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        timeEntry.setEmployee(employee);
        timeEntryRepository.saveAndFlush(timeEntry);
        Long employeeId = employee.getId();
        // Get all the timeEntryList where employee equals to employeeId
        defaultTimeEntryShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the timeEntryList where employee equals to (employeeId + 1)
        defaultTimeEntryShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllTimeEntriesByValidatedByUserIsEqualToSomething() throws Exception {
        UserProfile validatedByUser;
        if (TestUtil.findAll(em, UserProfile.class).isEmpty()) {
            timeEntryRepository.saveAndFlush(timeEntry);
            validatedByUser = UserProfileResourceIT.createEntity(em);
        } else {
            validatedByUser = TestUtil.findAll(em, UserProfile.class).get(0);
        }
        em.persist(validatedByUser);
        em.flush();
        timeEntry.setValidatedByUser(validatedByUser);
        timeEntryRepository.saveAndFlush(timeEntry);
        Long validatedByUserId = validatedByUser.getId();
        // Get all the timeEntryList where validatedByUser equals to validatedByUserId
        defaultTimeEntryShouldBeFound("validatedByUserId.equals=" + validatedByUserId);

        // Get all the timeEntryList where validatedByUser equals to (validatedByUserId + 1)
        defaultTimeEntryShouldNotBeFound("validatedByUserId.equals=" + (validatedByUserId + 1));
    }

    private void defaultTimeEntryFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultTimeEntryShouldBeFound(shouldBeFound);
        defaultTimeEntryShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultTimeEntryShouldBeFound(String filter) throws Exception {
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(timeEntry.getId().intValue())))
            .andExpect(jsonPath("$.[*].entryDate").value(hasItem(DEFAULT_ENTRY_DATE.toString())))
            .andExpect(jsonPath("$.[*].checkIn").value(hasItem(DEFAULT_CHECK_IN.toString())))
            .andExpect(jsonPath("$.[*].checkOut").value(hasItem(DEFAULT_CHECK_OUT.toString())))
            .andExpect(jsonPath("$.[*].workedHours").value(hasItem(sameNumber(DEFAULT_WORKED_HOURS))))
            .andExpect(jsonPath("$.[*].overtimeHours").value(hasItem(sameNumber(DEFAULT_OVERTIME_HOURS))))
            .andExpect(jsonPath("$.[*].lateMinutes").value(hasItem(DEFAULT_LATE_MINUTES)))
            .andExpect(jsonPath("$.[*].source").value(hasItem(DEFAULT_SOURCE.toString())))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())))
            .andExpect(jsonPath("$.[*].anomalyNote").value(hasItem(DEFAULT_ANOMALY_NOTE)))
            .andExpect(jsonPath("$.[*].validatedBy").value(hasItem(DEFAULT_VALIDATED_BY)))
            .andExpect(jsonPath("$.[*].validatedAt").value(hasItem(DEFAULT_VALIDATED_AT.toString())));

        // Check, that the count call also returns 1
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultTimeEntryShouldNotBeFound(String filter) throws Exception {
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restTimeEntryMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingTimeEntry() throws Exception {
        // Get the timeEntry
        restTimeEntryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingTimeEntry() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeEntry
        TimeEntry updatedTimeEntry = timeEntryRepository.findById(timeEntry.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedTimeEntry are not directly saved in db
        em.detach(updatedTimeEntry);
        updatedTimeEntry
            .entryDate(UPDATED_ENTRY_DATE)
            .checkIn(UPDATED_CHECK_IN)
            .checkOut(UPDATED_CHECK_OUT)
            .workedHours(UPDATED_WORKED_HOURS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .lateMinutes(UPDATED_LATE_MINUTES)
            .source(UPDATED_SOURCE)
            .status(UPDATED_STATUS)
            .anomalyNote(UPDATED_ANOMALY_NOTE)
            .validatedBy(UPDATED_VALIDATED_BY)
            .validatedAt(UPDATED_VALIDATED_AT);
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(updatedTimeEntry);

        restTimeEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, timeEntryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isOk());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedTimeEntryToMatchAllProperties(updatedTimeEntry);
    }

    @Test
    @Transactional
    void putNonExistingTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, timeEntryDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateTimeEntryWithPatch() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeEntry using partial update
        TimeEntry partialUpdatedTimeEntry = new TimeEntry();
        partialUpdatedTimeEntry.setId(timeEntry.getId());

        partialUpdatedTimeEntry
            .workedHours(UPDATED_WORKED_HOURS)
            .lateMinutes(UPDATED_LATE_MINUTES)
            .validatedBy(UPDATED_VALIDATED_BY)
            .validatedAt(UPDATED_VALIDATED_AT);

        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTimeEntry.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTimeEntry))
            )
            .andExpect(status().isOk());

        // Validate the TimeEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTimeEntryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedTimeEntry, timeEntry),
            getPersistedTimeEntry(timeEntry)
        );
    }

    @Test
    @Transactional
    void fullUpdateTimeEntryWithPatch() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the timeEntry using partial update
        TimeEntry partialUpdatedTimeEntry = new TimeEntry();
        partialUpdatedTimeEntry.setId(timeEntry.getId());

        partialUpdatedTimeEntry
            .entryDate(UPDATED_ENTRY_DATE)
            .checkIn(UPDATED_CHECK_IN)
            .checkOut(UPDATED_CHECK_OUT)
            .workedHours(UPDATED_WORKED_HOURS)
            .overtimeHours(UPDATED_OVERTIME_HOURS)
            .lateMinutes(UPDATED_LATE_MINUTES)
            .source(UPDATED_SOURCE)
            .status(UPDATED_STATUS)
            .anomalyNote(UPDATED_ANOMALY_NOTE)
            .validatedBy(UPDATED_VALIDATED_BY)
            .validatedAt(UPDATED_VALIDATED_AT);

        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedTimeEntry.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedTimeEntry))
            )
            .andExpect(status().isOk());

        // Validate the TimeEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertTimeEntryUpdatableFieldsEquals(partialUpdatedTimeEntry, getPersistedTimeEntry(partialUpdatedTimeEntry));
    }

    @Test
    @Transactional
    void patchNonExistingTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, timeEntryDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(timeEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamTimeEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        timeEntry.setId(longCount.incrementAndGet());

        // Create the TimeEntry
        TimeEntryDTO timeEntryDTO = timeEntryMapper.toDto(timeEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restTimeEntryMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(timeEntryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the TimeEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteTimeEntry() throws Exception {
        // Initialize the database
        insertedTimeEntry = timeEntryRepository.saveAndFlush(timeEntry);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the timeEntry
        restTimeEntryMockMvc
            .perform(delete(ENTITY_API_URL_ID, timeEntry.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return timeEntryRepository.count();
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

    protected TimeEntry getPersistedTimeEntry(TimeEntry timeEntry) {
        return timeEntryRepository.findById(timeEntry.getId()).orElseThrow();
    }

    protected void assertPersistedTimeEntryToMatchAllProperties(TimeEntry expectedTimeEntry) {
        assertTimeEntryAllPropertiesEquals(expectedTimeEntry, getPersistedTimeEntry(expectedTimeEntry));
    }

    protected void assertPersistedTimeEntryToMatchUpdatableProperties(TimeEntry expectedTimeEntry) {
        assertTimeEntryAllUpdatablePropertiesEquals(expectedTimeEntry, getPersistedTimeEntry(expectedTimeEntry));
    }
}
