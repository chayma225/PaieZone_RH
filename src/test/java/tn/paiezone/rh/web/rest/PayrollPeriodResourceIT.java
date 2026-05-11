package tn.paiezone.rh.web.rest;  // ← ligne 1, pas d'autre classe avant

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;
import tn.paiezone.rh.service.mapper.PayrollPeriodMapper;

@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class PayrollPeriodResourceIT {

    private static final Integer DEFAULT_MONTH  = 1;
    private static final Integer UPDATED_MONTH  = 2;
    private static final Integer DEFAULT_YEAR   = 2026;
    private static final Integer UPDATED_YEAR   = 2027;
    private static final PayrollStatus DEFAULT_STATUS  = PayrollStatus.DRAFT;
    private static final PayrollStatus UPDATED_STATUS  = PayrollStatus.CALCULATED;
    private static final Instant DEFAULT_CALCULATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CALCULATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL    = "/api/payroll-periods";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random     random    = new Random();
    private static final AtomicLong longCount = new AtomicLong(
        random.nextInt() + (2L * Integer.MAX_VALUE)
    );

    @Autowired private ObjectMapper            om;
    @Autowired private PayrollPeriodRepository payrollPeriodRepository;
    @Autowired private PayrollPeriodMapper     payrollPeriodMapper;
    @Autowired private EntityManager           em;
    @Autowired private MockMvc                 restPayrollPeriodMockMvc;

    private PayrollPeriod payrollPeriod;
    private PayrollPeriod insertedPayrollPeriod;

    // ── Méthodes statiques appelées par PaySlipResourceIT ─────────

    public static PayrollPeriod createEntity(EntityManager em) {
        PayrollPeriod period = new PayrollPeriod()
            .month(DEFAULT_MONTH)
            .year(DEFAULT_YEAR)
            .status(DEFAULT_STATUS);
        if (!TestUtil.findAll(em, Company.class).isEmpty()) {
            period.setCompany(TestUtil.findAll(em, Company.class).get(0));
        }
        return period;
    }

    public static PayrollPeriod createUpdatedEntity(EntityManager em) {
        PayrollPeriod period = new PayrollPeriod()
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .status(UPDATED_STATUS)
            .calculatedAt(UPDATED_CALCULATED_AT);
        if (!TestUtil.findAll(em, Company.class).isEmpty()) {
            period.setCompany(TestUtil.findAll(em, Company.class).get(0));
        }
        return period;
    }

    // ── Setup ──────────────────────────────────────────────────────

    @BeforeEach
    void initTest() {
        payrollPeriod = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedPayrollPeriod != null) {
            payrollPeriodRepository.delete(insertedPayrollPeriod);
            insertedPayrollPeriod = null;
        }
    }

    // ── Tests CRUD ─────────────────────────────────────────────────

    @Test
    @Transactional
    void createPayrollPeriod() throws Exception {
        long countBefore = payrollPeriodRepository.count();
        PayrollPeriodDTO dto = payrollPeriodMapper.toDto(payrollPeriod);

        restPayrollPeriodMockMvc
            .perform(post(ENTITY_API_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(om.writeValueAsBytes(dto)))
            .andExpect(status().isCreated());

        assertThat(payrollPeriodRepository.count()).isEqualTo(countBefore + 1);
    }

    @Test
    @Transactional
    void getAllPayrollPeriods() throws Exception {
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        restPayrollPeriodMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(payrollPeriod.getId().intValue())))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS.toString())));
    }

    @Test
    @Transactional
    void getPayrollPeriod() throws Exception {
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);

        restPayrollPeriodMockMvc
            .perform(get(ENTITY_API_URL_ID, payrollPeriod.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(payrollPeriod.getId().intValue()))
            .andExpect(jsonPath("$.month").value(DEFAULT_MONTH))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS.toString()));
    }

    @Test
    @Transactional
    void getNonExistingPayrollPeriod() throws Exception {
        restPayrollPeriodMockMvc
            .perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE))
            .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void deletePayrollPeriod() throws Exception {
        insertedPayrollPeriod = payrollPeriodRepository.saveAndFlush(payrollPeriod);
        long countBefore = payrollPeriodRepository.count();

        restPayrollPeriodMockMvc
            .perform(delete(ENTITY_API_URL_ID, payrollPeriod.getId())
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        assertThat(payrollPeriodRepository.count()).isEqualTo(countBefore - 1);
    }
}
