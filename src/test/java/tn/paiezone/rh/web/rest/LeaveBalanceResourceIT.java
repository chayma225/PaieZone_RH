package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.LeaveBalanceAsserts.*;
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
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.IntegrationTest;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.LeaveBalance;
import tn.paiezone.rh.domain.LeaveType;
import tn.paiezone.rh.repository.LeaveBalanceRepository;
import tn.paiezone.rh.service.dto.LeaveBalanceDTO;
import tn.paiezone.rh.service.mapper.LeaveBalanceMapper;

/**
 * Integration tests for the {@link LeaveBalanceResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class LeaveBalanceResourceIT {

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;

    private static final BigDecimal DEFAULT_ENTITLED = new BigDecimal(1);
    private static final BigDecimal UPDATED_ENTITLED = new BigDecimal(2);

    private static final BigDecimal DEFAULT_TAKEN = new BigDecimal(1);
    private static final BigDecimal UPDATED_TAKEN = new BigDecimal(2);

    private static final BigDecimal DEFAULT_PENDING = new BigDecimal(1);
    private static final BigDecimal UPDATED_PENDING = new BigDecimal(2);

    private static final BigDecimal DEFAULT_CARRY_OVER = new BigDecimal(1);
    private static final BigDecimal UPDATED_CARRY_OVER = new BigDecimal(2);

    private static final BigDecimal DEFAULT_REMAINING = new BigDecimal(1);
    private static final BigDecimal UPDATED_REMAINING = new BigDecimal(2);

    private static final Instant DEFAULT_LAST_UPDATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_LAST_UPDATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/leave-balances";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveBalanceMapper leaveBalanceMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restLeaveBalanceMockMvc;

    private LeaveBalance leaveBalance;

    private LeaveBalance insertedLeaveBalance;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LeaveBalance createEntity(EntityManager em) {
        LeaveBalance leaveBalance = new LeaveBalance()
            .year(DEFAULT_YEAR)
            .entitled(DEFAULT_ENTITLED)
            .taken(DEFAULT_TAKEN)
            .pending(DEFAULT_PENDING)
            .carryOver(DEFAULT_CARRY_OVER)
            .remaining(DEFAULT_REMAINING)
            .lastUpdatedAt(DEFAULT_LAST_UPDATED_AT);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        leaveBalance.setEmployee(employee);
        // Add required entity
        LeaveType leaveType;
        if (TestUtil.findAll(em, LeaveType.class).isEmpty()) {
            leaveType = LeaveTypeResourceIT.createEntity(em);
            em.persist(leaveType);
            em.flush();
        } else {
            leaveType = TestUtil.findAll(em, LeaveType.class).get(0);
        }
        leaveBalance.setLeaveType(leaveType);
        return leaveBalance;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static LeaveBalance createUpdatedEntity(EntityManager em) {
        LeaveBalance updatedLeaveBalance = new LeaveBalance()
            .year(UPDATED_YEAR)
            .entitled(UPDATED_ENTITLED)
            .taken(UPDATED_TAKEN)
            .pending(UPDATED_PENDING)
            .carryOver(UPDATED_CARRY_OVER)
            .remaining(UPDATED_REMAINING)
            .lastUpdatedAt(UPDATED_LAST_UPDATED_AT);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedLeaveBalance.setEmployee(employee);
        // Add required entity
        LeaveType leaveType;
        if (TestUtil.findAll(em, LeaveType.class).isEmpty()) {
            leaveType = LeaveTypeResourceIT.createUpdatedEntity(em);
            em.persist(leaveType);
            em.flush();
        } else {
            leaveType = TestUtil.findAll(em, LeaveType.class).get(0);
        }
        updatedLeaveBalance.setLeaveType(leaveType);
        return updatedLeaveBalance;
    }

    @BeforeEach
    void initTest() {
        leaveBalance = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedLeaveBalance != null) {
            leaveBalanceRepository.delete(insertedLeaveBalance);
            insertedLeaveBalance = null;
        }
    }

    @Test
    @Transactional
    void createLeaveBalance() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);
        var returnedLeaveBalanceDTO = om.readValue(
            restLeaveBalanceMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            LeaveBalanceDTO.class
        );

        // Validate the LeaveBalance in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedLeaveBalance = leaveBalanceMapper.toEntity(returnedLeaveBalanceDTO);
        assertLeaveBalanceUpdatableFieldsEquals(returnedLeaveBalance, getPersistedLeaveBalance(returnedLeaveBalance));

        insertedLeaveBalance = returnedLeaveBalance;
    }

    @Test
    @Transactional
    void createLeaveBalanceWithExistingId() throws Exception {
        // Create the LeaveBalance with an existing ID
        leaveBalance.setId(1L);
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setYear(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEntitledIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setEntitled(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTakenIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setTaken(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkPendingIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setPending(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCarryOverIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setCarryOver(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkRemainingIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setRemaining(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLastUpdatedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        leaveBalance.setLastUpdatedAt(null);

        // Create the LeaveBalance, which fails.
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        restLeaveBalanceMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllLeaveBalances() throws Exception {
        // Initialize the database
        insertedLeaveBalance = leaveBalanceRepository.saveAndFlush(leaveBalance);

        // Get all the leaveBalanceList
        restLeaveBalanceMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(leaveBalance.getId().intValue())))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].entitled").value(hasItem(sameNumber(DEFAULT_ENTITLED))))
            .andExpect(jsonPath("$.[*].taken").value(hasItem(sameNumber(DEFAULT_TAKEN))))
            .andExpect(jsonPath("$.[*].pending").value(hasItem(sameNumber(DEFAULT_PENDING))))
            .andExpect(jsonPath("$.[*].carryOver").value(hasItem(sameNumber(DEFAULT_CARRY_OVER))))
            .andExpect(jsonPath("$.[*].remaining").value(hasItem(sameNumber(DEFAULT_REMAINING))))
            .andExpect(jsonPath("$.[*].lastUpdatedAt").value(hasItem(DEFAULT_LAST_UPDATED_AT.toString())));
    }

    @Test
    @Transactional
    void getLeaveBalance() throws Exception {
        // Initialize the database
        insertedLeaveBalance = leaveBalanceRepository.saveAndFlush(leaveBalance);

        // Get the leaveBalance
        restLeaveBalanceMockMvc
            .perform(get(ENTITY_API_URL_ID, leaveBalance.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(leaveBalance.getId().intValue()))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.entitled").value(sameNumber(DEFAULT_ENTITLED)))
            .andExpect(jsonPath("$.taken").value(sameNumber(DEFAULT_TAKEN)))
            .andExpect(jsonPath("$.pending").value(sameNumber(DEFAULT_PENDING)))
            .andExpect(jsonPath("$.carryOver").value(sameNumber(DEFAULT_CARRY_OVER)))
            .andExpect(jsonPath("$.remaining").value(sameNumber(DEFAULT_REMAINING)))
            .andExpect(jsonPath("$.lastUpdatedAt").value(DEFAULT_LAST_UPDATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingLeaveBalance() throws Exception {
        // Get the leaveBalance
        restLeaveBalanceMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingLeaveBalance() throws Exception {
        // Initialize the database
        insertedLeaveBalance = leaveBalanceRepository.saveAndFlush(leaveBalance);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveBalance
        LeaveBalance updatedLeaveBalance = leaveBalanceRepository.findById(leaveBalance.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedLeaveBalance are not directly saved in db
        em.detach(updatedLeaveBalance);
        updatedLeaveBalance
            .year(UPDATED_YEAR)
            .entitled(UPDATED_ENTITLED)
            .taken(UPDATED_TAKEN)
            .pending(UPDATED_PENDING)
            .carryOver(UPDATED_CARRY_OVER)
            .remaining(UPDATED_REMAINING)
            .lastUpdatedAt(UPDATED_LAST_UPDATED_AT);
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(updatedLeaveBalance);

        restLeaveBalanceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveBalanceDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveBalanceDTO))
            )
            .andExpect(status().isOk());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedLeaveBalanceToMatchAllProperties(updatedLeaveBalance);
    }

    @Test
    @Transactional
    void putNonExistingLeaveBalance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveBalance.setId(longCount.incrementAndGet());

        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveBalanceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, leaveBalanceDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveBalanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchLeaveBalance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveBalance.setId(longCount.incrementAndGet());

        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveBalanceMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(leaveBalanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamLeaveBalance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveBalance.setId(longCount.incrementAndGet());

        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveBalanceMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateLeaveBalanceWithPatch() throws Exception {
        // Initialize the database
        insertedLeaveBalance = leaveBalanceRepository.saveAndFlush(leaveBalance);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveBalance using partial update
        LeaveBalance partialUpdatedLeaveBalance = new LeaveBalance();
        partialUpdatedLeaveBalance.setId(leaveBalance.getId());

        partialUpdatedLeaveBalance
            .year(UPDATED_YEAR)
            .taken(UPDATED_TAKEN)
            .pending(UPDATED_PENDING)
            .remaining(UPDATED_REMAINING)
            .lastUpdatedAt(UPDATED_LAST_UPDATED_AT);

        restLeaveBalanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaveBalance.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeaveBalance))
            )
            .andExpect(status().isOk());

        // Validate the LeaveBalance in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveBalanceUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedLeaveBalance, leaveBalance),
            getPersistedLeaveBalance(leaveBalance)
        );
    }

    @Test
    @Transactional
    void fullUpdateLeaveBalanceWithPatch() throws Exception {
        // Initialize the database
        insertedLeaveBalance = leaveBalanceRepository.saveAndFlush(leaveBalance);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the leaveBalance using partial update
        LeaveBalance partialUpdatedLeaveBalance = new LeaveBalance();
        partialUpdatedLeaveBalance.setId(leaveBalance.getId());

        partialUpdatedLeaveBalance
            .year(UPDATED_YEAR)
            .entitled(UPDATED_ENTITLED)
            .taken(UPDATED_TAKEN)
            .pending(UPDATED_PENDING)
            .carryOver(UPDATED_CARRY_OVER)
            .remaining(UPDATED_REMAINING)
            .lastUpdatedAt(UPDATED_LAST_UPDATED_AT);

        restLeaveBalanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedLeaveBalance.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedLeaveBalance))
            )
            .andExpect(status().isOk());

        // Validate the LeaveBalance in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertLeaveBalanceUpdatableFieldsEquals(partialUpdatedLeaveBalance, getPersistedLeaveBalance(partialUpdatedLeaveBalance));
    }

    @Test
    @Transactional
    void patchNonExistingLeaveBalance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveBalance.setId(longCount.incrementAndGet());

        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restLeaveBalanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, leaveBalanceDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveBalanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchLeaveBalance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveBalance.setId(longCount.incrementAndGet());

        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveBalanceMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(leaveBalanceDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamLeaveBalance() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        leaveBalance.setId(longCount.incrementAndGet());

        // Create the LeaveBalance
        LeaveBalanceDTO leaveBalanceDTO = leaveBalanceMapper.toDto(leaveBalance);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restLeaveBalanceMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(leaveBalanceDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the LeaveBalance in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteLeaveBalance() throws Exception {
        // Initialize the database
        insertedLeaveBalance = leaveBalanceRepository.saveAndFlush(leaveBalance);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the leaveBalance
        restLeaveBalanceMockMvc
            .perform(delete(ENTITY_API_URL_ID, leaveBalance.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return leaveBalanceRepository.count();
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

    protected LeaveBalance getPersistedLeaveBalance(LeaveBalance leaveBalance) {
        return leaveBalanceRepository.findById(leaveBalance.getId()).orElseThrow();
    }

    protected void assertPersistedLeaveBalanceToMatchAllProperties(LeaveBalance expectedLeaveBalance) {
        assertLeaveBalanceAllPropertiesEquals(expectedLeaveBalance, getPersistedLeaveBalance(expectedLeaveBalance));
    }

    protected void assertPersistedLeaveBalanceToMatchUpdatableProperties(LeaveBalance expectedLeaveBalance) {
        assertLeaveBalanceAllUpdatablePropertiesEquals(expectedLeaveBalance, getPersistedLeaveBalance(expectedLeaveBalance));
    }
}
