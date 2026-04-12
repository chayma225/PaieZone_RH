package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.BonusAsserts.*;
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
import tn.paiezone.rh.domain.Bonus;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.enumeration.BonusType;
import tn.paiezone.rh.repository.BonusRepository;
import tn.paiezone.rh.service.dto.BonusDTO;
import tn.paiezone.rh.service.mapper.BonusMapper;

/**
 * Integration tests for the {@link BonusResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class BonusResourceIT {

    private static final BonusType DEFAULT_BONUS_TYPE = BonusType.PERFORMANCE;
    private static final BonusType UPDATED_BONUS_TYPE = BonusType.TRANSPORT;

    private static final String DEFAULT_LABEL = "AAAAAAAAAA";
    private static final String UPDATED_LABEL = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);
    private static final BigDecimal SMALLER_AMOUNT = new BigDecimal(1 - 1);

    private static final Boolean DEFAULT_TAXABLE = false;
    private static final Boolean UPDATED_TAXABLE = true;

    private static final Integer DEFAULT_MONTH = 1;
    private static final Integer UPDATED_MONTH = 2;
    private static final Integer SMALLER_MONTH = 1 - 1;

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;
    private static final Integer SMALLER_YEAR = 1 - 1;

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/bonuses";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private BonusRepository bonusRepository;

    @Autowired
    private BonusMapper bonusMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restBonusMockMvc;

    private Bonus bonus;

    private Bonus insertedBonus;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Bonus createEntity(EntityManager em) {
        Bonus bonus = new Bonus()
            .bonusType(DEFAULT_BONUS_TYPE)
            .label(DEFAULT_LABEL)
            .amount(DEFAULT_AMOUNT)
            .taxable(DEFAULT_TAXABLE)
            .month(DEFAULT_MONTH)
            .year(DEFAULT_YEAR)
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
        bonus.setEmployee(employee);
        return bonus;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Bonus createUpdatedEntity(EntityManager em) {
        Bonus updatedBonus = new Bonus()
            .bonusType(UPDATED_BONUS_TYPE)
            .label(UPDATED_LABEL)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
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
        updatedBonus.setEmployee(employee);
        return updatedBonus;
    }

    @BeforeEach
    void initTest() {
        bonus = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedBonus != null) {
            bonusRepository.delete(insertedBonus);
            insertedBonus = null;
        }
    }

    @Test
    @Transactional
    void createBonus() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);
        var returnedBonusDTO = om.readValue(
            restBonusMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            BonusDTO.class
        );

        // Validate the Bonus in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedBonus = bonusMapper.toEntity(returnedBonusDTO);
        assertBonusUpdatableFieldsEquals(returnedBonus, getPersistedBonus(returnedBonus));

        insertedBonus = returnedBonus;
    }

    @Test
    @Transactional
    void createBonusWithExistingId() throws Exception {
        // Create the Bonus with an existing ID
        bonus.setId(1L);
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkBonusTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        bonus.setBonusType(null);

        // Create the Bonus, which fails.
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLabelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        bonus.setLabel(null);

        // Create the Bonus, which fails.
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAmountIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        bonus.setAmount(null);

        // Create the Bonus, which fails.
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTaxableIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        bonus.setTaxable(null);

        // Create the Bonus, which fails.
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkMonthIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        bonus.setMonth(null);

        // Create the Bonus, which fails.
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        bonus.setYear(null);

        // Create the Bonus, which fails.
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        restBonusMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllBonuses() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList
        restBonusMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(bonus.getId().intValue())))
            .andExpect(jsonPath("$.[*].bonusType").value(hasItem(DEFAULT_BONUS_TYPE.toString())))
            .andExpect(jsonPath("$.[*].label").value(hasItem(DEFAULT_LABEL)))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].taxable").value(hasItem(DEFAULT_TAXABLE)))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getBonus() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get the bonus
        restBonusMockMvc
            .perform(get(ENTITY_API_URL_ID, bonus.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(bonus.getId().intValue()))
            .andExpect(jsonPath("$.bonusType").value(DEFAULT_BONUS_TYPE.toString()))
            .andExpect(jsonPath("$.label").value(DEFAULT_LABEL))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.taxable").value(DEFAULT_TAXABLE))
            .andExpect(jsonPath("$.month").value(DEFAULT_MONTH))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getBonusesByIdFiltering() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        Long id = bonus.getId();

        defaultBonusFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultBonusFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultBonusFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllBonusesByBonusTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where bonusType equals to
        defaultBonusFiltering("bonusType.equals=" + DEFAULT_BONUS_TYPE, "bonusType.equals=" + UPDATED_BONUS_TYPE);
    }

    @Test
    @Transactional
    void getAllBonusesByBonusTypeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where bonusType in
        defaultBonusFiltering("bonusType.in=" + DEFAULT_BONUS_TYPE + "," + UPDATED_BONUS_TYPE, "bonusType.in=" + UPDATED_BONUS_TYPE);
    }

    @Test
    @Transactional
    void getAllBonusesByBonusTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where bonusType is not null
        defaultBonusFiltering("bonusType.specified=true", "bonusType.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByLabelIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where label equals to
        defaultBonusFiltering("label.equals=" + DEFAULT_LABEL, "label.equals=" + UPDATED_LABEL);
    }

    @Test
    @Transactional
    void getAllBonusesByLabelIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where label in
        defaultBonusFiltering("label.in=" + DEFAULT_LABEL + "," + UPDATED_LABEL, "label.in=" + UPDATED_LABEL);
    }

    @Test
    @Transactional
    void getAllBonusesByLabelIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where label is not null
        defaultBonusFiltering("label.specified=true", "label.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByLabelContainsSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where label contains
        defaultBonusFiltering("label.contains=" + DEFAULT_LABEL, "label.contains=" + UPDATED_LABEL);
    }

    @Test
    @Transactional
    void getAllBonusesByLabelNotContainsSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where label does not contain
        defaultBonusFiltering("label.doesNotContain=" + UPDATED_LABEL, "label.doesNotContain=" + DEFAULT_LABEL);
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount equals to
        defaultBonusFiltering("amount.equals=" + DEFAULT_AMOUNT, "amount.equals=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount in
        defaultBonusFiltering("amount.in=" + DEFAULT_AMOUNT + "," + UPDATED_AMOUNT, "amount.in=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount is not null
        defaultBonusFiltering("amount.specified=true", "amount.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount is greater than or equal to
        defaultBonusFiltering("amount.greaterThanOrEqual=" + DEFAULT_AMOUNT, "amount.greaterThanOrEqual=" + UPDATED_AMOUNT);
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount is less than or equal to
        defaultBonusFiltering("amount.lessThanOrEqual=" + DEFAULT_AMOUNT, "amount.lessThanOrEqual=" + SMALLER_AMOUNT);
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount is less than
        defaultBonusFiltering("amount.lessThan=" + UPDATED_AMOUNT, "amount.lessThan=" + DEFAULT_AMOUNT);
    }

    @Test
    @Transactional
    void getAllBonusesByAmountIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where amount is greater than
        defaultBonusFiltering("amount.greaterThan=" + SMALLER_AMOUNT, "amount.greaterThan=" + DEFAULT_AMOUNT);
    }

    @Test
    @Transactional
    void getAllBonusesByTaxableIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where taxable equals to
        defaultBonusFiltering("taxable.equals=" + DEFAULT_TAXABLE, "taxable.equals=" + UPDATED_TAXABLE);
    }

    @Test
    @Transactional
    void getAllBonusesByTaxableIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where taxable in
        defaultBonusFiltering("taxable.in=" + DEFAULT_TAXABLE + "," + UPDATED_TAXABLE, "taxable.in=" + UPDATED_TAXABLE);
    }

    @Test
    @Transactional
    void getAllBonusesByTaxableIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where taxable is not null
        defaultBonusFiltering("taxable.specified=true", "taxable.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month equals to
        defaultBonusFiltering("month.equals=" + DEFAULT_MONTH, "month.equals=" + UPDATED_MONTH);
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month in
        defaultBonusFiltering("month.in=" + DEFAULT_MONTH + "," + UPDATED_MONTH, "month.in=" + UPDATED_MONTH);
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month is not null
        defaultBonusFiltering("month.specified=true", "month.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month is greater than or equal to
        defaultBonusFiltering("month.greaterThanOrEqual=" + DEFAULT_MONTH, "month.greaterThanOrEqual=" + (DEFAULT_MONTH + 1));
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month is less than or equal to
        defaultBonusFiltering("month.lessThanOrEqual=" + DEFAULT_MONTH, "month.lessThanOrEqual=" + SMALLER_MONTH);
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month is less than
        defaultBonusFiltering("month.lessThan=" + (DEFAULT_MONTH + 1), "month.lessThan=" + DEFAULT_MONTH);
    }

    @Test
    @Transactional
    void getAllBonusesByMonthIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where month is greater than
        defaultBonusFiltering("month.greaterThan=" + SMALLER_MONTH, "month.greaterThan=" + DEFAULT_MONTH);
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year equals to
        defaultBonusFiltering("year.equals=" + DEFAULT_YEAR, "year.equals=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year in
        defaultBonusFiltering("year.in=" + DEFAULT_YEAR + "," + UPDATED_YEAR, "year.in=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year is not null
        defaultBonusFiltering("year.specified=true", "year.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year is greater than or equal to
        defaultBonusFiltering("year.greaterThanOrEqual=" + DEFAULT_YEAR, "year.greaterThanOrEqual=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year is less than or equal to
        defaultBonusFiltering("year.lessThanOrEqual=" + DEFAULT_YEAR, "year.lessThanOrEqual=" + SMALLER_YEAR);
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year is less than
        defaultBonusFiltering("year.lessThan=" + UPDATED_YEAR, "year.lessThan=" + DEFAULT_YEAR);
    }

    @Test
    @Transactional
    void getAllBonusesByYearIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where year is greater than
        defaultBonusFiltering("year.greaterThan=" + SMALLER_YEAR, "year.greaterThan=" + DEFAULT_YEAR);
    }

    @Test
    @Transactional
    void getAllBonusesByNotesIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where notes equals to
        defaultBonusFiltering("notes.equals=" + DEFAULT_NOTES, "notes.equals=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllBonusesByNotesIsInShouldWork() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where notes in
        defaultBonusFiltering("notes.in=" + DEFAULT_NOTES + "," + UPDATED_NOTES, "notes.in=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllBonusesByNotesIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where notes is not null
        defaultBonusFiltering("notes.specified=true", "notes.specified=false");
    }

    @Test
    @Transactional
    void getAllBonusesByNotesContainsSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where notes contains
        defaultBonusFiltering("notes.contains=" + DEFAULT_NOTES, "notes.contains=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllBonusesByNotesNotContainsSomething() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        // Get all the bonusList where notes does not contain
        defaultBonusFiltering("notes.doesNotContain=" + UPDATED_NOTES, "notes.doesNotContain=" + DEFAULT_NOTES);
    }

    @Test
    @Transactional
    void getAllBonusesByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            bonusRepository.saveAndFlush(bonus);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        bonus.setEmployee(employee);
        bonusRepository.saveAndFlush(bonus);
        Long employeeId = employee.getId();
        // Get all the bonusList where employee equals to employeeId
        defaultBonusShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the bonusList where employee equals to (employeeId + 1)
        defaultBonusShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllBonusesByPaySlipIsEqualToSomething() throws Exception {
        PaySlip paySlip;
        if (TestUtil.findAll(em, PaySlip.class).isEmpty()) {
            bonusRepository.saveAndFlush(bonus);
            paySlip = PaySlipResourceIT.createEntity(em);
        } else {
            paySlip = TestUtil.findAll(em, PaySlip.class).get(0);
        }
        em.persist(paySlip);
        em.flush();
        bonus.setPaySlip(paySlip);
        bonusRepository.saveAndFlush(bonus);
        Long paySlipId = paySlip.getId();
        // Get all the bonusList where paySlip equals to paySlipId
        defaultBonusShouldBeFound("paySlipId.equals=" + paySlipId);

        // Get all the bonusList where paySlip equals to (paySlipId + 1)
        defaultBonusShouldNotBeFound("paySlipId.equals=" + (paySlipId + 1));
    }

    private void defaultBonusFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultBonusShouldBeFound(shouldBeFound);
        defaultBonusShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultBonusShouldBeFound(String filter) throws Exception {
        restBonusMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(bonus.getId().intValue())))
            .andExpect(jsonPath("$.[*].bonusType").value(hasItem(DEFAULT_BONUS_TYPE.toString())))
            .andExpect(jsonPath("$.[*].label").value(hasItem(DEFAULT_LABEL)))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].taxable").value(hasItem(DEFAULT_TAXABLE)))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restBonusMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultBonusShouldNotBeFound(String filter) throws Exception {
        restBonusMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restBonusMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingBonus() throws Exception {
        // Get the bonus
        restBonusMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingBonus() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the bonus
        Bonus updatedBonus = bonusRepository.findById(bonus.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedBonus are not directly saved in db
        em.detach(updatedBonus);
        updatedBonus
            .bonusType(UPDATED_BONUS_TYPE)
            .label(UPDATED_LABEL)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .notes(UPDATED_NOTES);
        BonusDTO bonusDTO = bonusMapper.toDto(updatedBonus);

        restBonusMockMvc
            .perform(
                put(ENTITY_API_URL_ID, bonusDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO))
            )
            .andExpect(status().isOk());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedBonusToMatchAllProperties(updatedBonus);
    }

    @Test
    @Transactional
    void putNonExistingBonus() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        bonus.setId(longCount.incrementAndGet());

        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBonusMockMvc
            .perform(
                put(ENTITY_API_URL_ID, bonusDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchBonus() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        bonus.setId(longCount.incrementAndGet());

        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBonusMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(bonusDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamBonus() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        bonus.setId(longCount.incrementAndGet());

        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBonusMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateBonusWithPatch() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the bonus using partial update
        Bonus partialUpdatedBonus = new Bonus();
        partialUpdatedBonus.setId(bonus.getId());

        partialUpdatedBonus
            .label(UPDATED_LABEL)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .notes(UPDATED_NOTES);

        restBonusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBonus.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedBonus))
            )
            .andExpect(status().isOk());

        // Validate the Bonus in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBonusUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedBonus, bonus), getPersistedBonus(bonus));
    }

    @Test
    @Transactional
    void fullUpdateBonusWithPatch() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the bonus using partial update
        Bonus partialUpdatedBonus = new Bonus();
        partialUpdatedBonus.setId(bonus.getId());

        partialUpdatedBonus
            .bonusType(UPDATED_BONUS_TYPE)
            .label(UPDATED_LABEL)
            .amount(UPDATED_AMOUNT)
            .taxable(UPDATED_TAXABLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .notes(UPDATED_NOTES);

        restBonusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedBonus.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedBonus))
            )
            .andExpect(status().isOk());

        // Validate the Bonus in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertBonusUpdatableFieldsEquals(partialUpdatedBonus, getPersistedBonus(partialUpdatedBonus));
    }

    @Test
    @Transactional
    void patchNonExistingBonus() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        bonus.setId(longCount.incrementAndGet());

        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restBonusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, bonusDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(bonusDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchBonus() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        bonus.setId(longCount.incrementAndGet());

        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBonusMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(bonusDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamBonus() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        bonus.setId(longCount.incrementAndGet());

        // Create the Bonus
        BonusDTO bonusDTO = bonusMapper.toDto(bonus);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restBonusMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(bonusDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Bonus in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteBonus() throws Exception {
        // Initialize the database
        insertedBonus = bonusRepository.saveAndFlush(bonus);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the bonus
        restBonusMockMvc
            .perform(delete(ENTITY_API_URL_ID, bonus.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return bonusRepository.count();
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

    protected Bonus getPersistedBonus(Bonus bonus) {
        return bonusRepository.findById(bonus.getId()).orElseThrow();
    }

    protected void assertPersistedBonusToMatchAllProperties(Bonus expectedBonus) {
        assertBonusAllPropertiesEquals(expectedBonus, getPersistedBonus(expectedBonus));
    }

    protected void assertPersistedBonusToMatchUpdatableProperties(Bonus expectedBonus) {
        assertBonusAllUpdatablePropertiesEquals(expectedBonus, getPersistedBonus(expectedBonus));
    }
}
