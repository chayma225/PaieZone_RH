package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.OfficialDocumentAsserts.*;
import static tn.paiezone.rh.web.rest.TestUtil.createUpdateProxyForBean;

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
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.OfficialDocument;
import tn.paiezone.rh.domain.UserProfile;
import tn.paiezone.rh.domain.enumeration.OfficialDocType;
import tn.paiezone.rh.repository.OfficialDocumentRepository;
import tn.paiezone.rh.service.dto.OfficialDocumentDTO;
import tn.paiezone.rh.service.mapper.OfficialDocumentMapper;

/**
 * Integration tests for the {@link OfficialDocumentResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class OfficialDocumentResourceIT {

    private static final OfficialDocType DEFAULT_DOC_TYPE = OfficialDocType.WORK_CERTIFICATE;
    private static final OfficialDocType UPDATED_DOC_TYPE = OfficialDocType.SALARY_ATTESTATION;

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final Integer DEFAULT_MONTH = 1;
    private static final Integer UPDATED_MONTH = 2;
    private static final Integer SMALLER_MONTH = 1 - 1;

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;
    private static final Integer SMALLER_YEAR = 1 - 1;

    private static final Instant DEFAULT_GENERATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_GENERATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_FILE_URL = "AAAAAAAAAA";
    private static final String UPDATED_FILE_URL = "BBBBBBBBBB";

    private static final String DEFAULT_SIGNED_BY = "AAAAAAAAAA";
    private static final String UPDATED_SIGNED_BY = "BBBBBBBBBB";

    private static final Instant DEFAULT_SENT_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_SENT_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/official-documents";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private OfficialDocumentRepository officialDocumentRepository;

    @Autowired
    private OfficialDocumentMapper officialDocumentMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restOfficialDocumentMockMvc;

    private OfficialDocument officialDocument;

    private OfficialDocument insertedOfficialDocument;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static OfficialDocument createEntity(EntityManager em) {
        OfficialDocument officialDocument = new OfficialDocument()
            .docType(DEFAULT_DOC_TYPE)
            .title(DEFAULT_TITLE)
            .month(DEFAULT_MONTH)
            .year(DEFAULT_YEAR)
            .generatedAt(DEFAULT_GENERATED_AT)
            .fileUrl(DEFAULT_FILE_URL)
            .signedBy(DEFAULT_SIGNED_BY)
            .sentAt(DEFAULT_SENT_AT)
            .notes(DEFAULT_NOTES);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        officialDocument.setCompany(company);
        return officialDocument;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static OfficialDocument createUpdatedEntity(EntityManager em) {
        OfficialDocument updatedOfficialDocument = new OfficialDocument()
            .docType(UPDATED_DOC_TYPE)
            .title(UPDATED_TITLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .generatedAt(UPDATED_GENERATED_AT)
            .fileUrl(UPDATED_FILE_URL)
            .signedBy(UPDATED_SIGNED_BY)
            .sentAt(UPDATED_SENT_AT)
            .notes(UPDATED_NOTES);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createUpdatedEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        updatedOfficialDocument.setCompany(company);
        return updatedOfficialDocument;
    }

    @BeforeEach
    void initTest() {
        officialDocument = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedOfficialDocument != null) {
            officialDocumentRepository.delete(insertedOfficialDocument);
            insertedOfficialDocument = null;
        }
    }

    @Test
    @Transactional
    void createOfficialDocument() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);
        var returnedOfficialDocumentDTO = om.readValue(
            restOfficialDocumentMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            OfficialDocumentDTO.class
        );

        // Validate the OfficialDocument in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedOfficialDocument = officialDocumentMapper.toEntity(returnedOfficialDocumentDTO);
        assertOfficialDocumentUpdatableFieldsEquals(returnedOfficialDocument, getPersistedOfficialDocument(returnedOfficialDocument));

        insertedOfficialDocument = returnedOfficialDocument;
    }

    @Test
    @Transactional
    void createOfficialDocumentWithExistingId() throws Exception {
        // Create the OfficialDocument with an existing ID
        officialDocument.setId(1L);
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restOfficialDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDocTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        officialDocument.setDocType(null);

        // Create the OfficialDocument, which fails.
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        restOfficialDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        officialDocument.setTitle(null);

        // Create the OfficialDocument, which fails.
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        restOfficialDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkYearIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        officialDocument.setYear(null);

        // Create the OfficialDocument, which fails.
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        restOfficialDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGeneratedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        officialDocument.setGeneratedAt(null);

        // Create the OfficialDocument, which fails.
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        restOfficialDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllOfficialDocuments() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList
        restOfficialDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(officialDocument.getId().intValue())))
            .andExpect(jsonPath("$.[*].docType").value(hasItem(DEFAULT_DOC_TYPE.toString())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].generatedAt").value(hasItem(DEFAULT_GENERATED_AT.toString())))
            .andExpect(jsonPath("$.[*].fileUrl").value(hasItem(DEFAULT_FILE_URL)))
            .andExpect(jsonPath("$.[*].signedBy").value(hasItem(DEFAULT_SIGNED_BY)))
            .andExpect(jsonPath("$.[*].sentAt").value(hasItem(DEFAULT_SENT_AT.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));
    }

    @Test
    @Transactional
    void getOfficialDocument() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get the officialDocument
        restOfficialDocumentMockMvc
            .perform(get(ENTITY_API_URL_ID, officialDocument.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(officialDocument.getId().intValue()))
            .andExpect(jsonPath("$.docType").value(DEFAULT_DOC_TYPE.toString()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.month").value(DEFAULT_MONTH))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.generatedAt").value(DEFAULT_GENERATED_AT.toString()))
            .andExpect(jsonPath("$.fileUrl").value(DEFAULT_FILE_URL))
            .andExpect(jsonPath("$.signedBy").value(DEFAULT_SIGNED_BY))
            .andExpect(jsonPath("$.sentAt").value(DEFAULT_SENT_AT.toString()))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES));
    }

    @Test
    @Transactional
    void getOfficialDocumentsByIdFiltering() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        Long id = officialDocument.getId();

        defaultOfficialDocumentFiltering("id.equals=" + id, "id.notEquals=" + id);

        defaultOfficialDocumentFiltering("id.greaterThanOrEqual=" + id, "id.greaterThan=" + id);

        defaultOfficialDocumentFiltering("id.lessThanOrEqual=" + id, "id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByDocTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where docType equals to
        defaultOfficialDocumentFiltering("docType.equals=" + DEFAULT_DOC_TYPE, "docType.equals=" + UPDATED_DOC_TYPE);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByDocTypeIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where docType in
        defaultOfficialDocumentFiltering("docType.in=" + DEFAULT_DOC_TYPE + "," + UPDATED_DOC_TYPE, "docType.in=" + UPDATED_DOC_TYPE);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByDocTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where docType is not null
        defaultOfficialDocumentFiltering("docType.specified=true", "docType.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByTitleIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where title equals to
        defaultOfficialDocumentFiltering("title.equals=" + DEFAULT_TITLE, "title.equals=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByTitleIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where title in
        defaultOfficialDocumentFiltering("title.in=" + DEFAULT_TITLE + "," + UPDATED_TITLE, "title.in=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByTitleIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where title is not null
        defaultOfficialDocumentFiltering("title.specified=true", "title.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByTitleContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where title contains
        defaultOfficialDocumentFiltering("title.contains=" + DEFAULT_TITLE, "title.contains=" + UPDATED_TITLE);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByTitleNotContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where title does not contain
        defaultOfficialDocumentFiltering("title.doesNotContain=" + UPDATED_TITLE, "title.doesNotContain=" + DEFAULT_TITLE);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month equals to
        defaultOfficialDocumentFiltering("month.equals=" + DEFAULT_MONTH, "month.equals=" + UPDATED_MONTH);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month in
        defaultOfficialDocumentFiltering("month.in=" + DEFAULT_MONTH + "," + UPDATED_MONTH, "month.in=" + UPDATED_MONTH);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month is not null
        defaultOfficialDocumentFiltering("month.specified=true", "month.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month is greater than or equal to
        defaultOfficialDocumentFiltering("month.greaterThanOrEqual=" + DEFAULT_MONTH, "month.greaterThanOrEqual=" + (DEFAULT_MONTH + 1));
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month is less than or equal to
        defaultOfficialDocumentFiltering("month.lessThanOrEqual=" + DEFAULT_MONTH, "month.lessThanOrEqual=" + SMALLER_MONTH);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month is less than
        defaultOfficialDocumentFiltering("month.lessThan=" + (DEFAULT_MONTH + 1), "month.lessThan=" + DEFAULT_MONTH);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByMonthIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where month is greater than
        defaultOfficialDocumentFiltering("month.greaterThan=" + SMALLER_MONTH, "month.greaterThan=" + DEFAULT_MONTH);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year equals to
        defaultOfficialDocumentFiltering("year.equals=" + DEFAULT_YEAR, "year.equals=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year in
        defaultOfficialDocumentFiltering("year.in=" + DEFAULT_YEAR + "," + UPDATED_YEAR, "year.in=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year is not null
        defaultOfficialDocumentFiltering("year.specified=true", "year.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year is greater than or equal to
        defaultOfficialDocumentFiltering("year.greaterThanOrEqual=" + DEFAULT_YEAR, "year.greaterThanOrEqual=" + UPDATED_YEAR);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsLessThanOrEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year is less than or equal to
        defaultOfficialDocumentFiltering("year.lessThanOrEqual=" + DEFAULT_YEAR, "year.lessThanOrEqual=" + SMALLER_YEAR);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsLessThanSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year is less than
        defaultOfficialDocumentFiltering("year.lessThan=" + UPDATED_YEAR, "year.lessThan=" + DEFAULT_YEAR);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByYearIsGreaterThanSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where year is greater than
        defaultOfficialDocumentFiltering("year.greaterThan=" + SMALLER_YEAR, "year.greaterThan=" + DEFAULT_YEAR);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByGeneratedAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where generatedAt equals to
        defaultOfficialDocumentFiltering("generatedAt.equals=" + DEFAULT_GENERATED_AT, "generatedAt.equals=" + UPDATED_GENERATED_AT);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByGeneratedAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where generatedAt in
        defaultOfficialDocumentFiltering(
            "generatedAt.in=" + DEFAULT_GENERATED_AT + "," + UPDATED_GENERATED_AT,
            "generatedAt.in=" + UPDATED_GENERATED_AT
        );
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByGeneratedAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where generatedAt is not null
        defaultOfficialDocumentFiltering("generatedAt.specified=true", "generatedAt.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByFileUrlIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where fileUrl equals to
        defaultOfficialDocumentFiltering("fileUrl.equals=" + DEFAULT_FILE_URL, "fileUrl.equals=" + UPDATED_FILE_URL);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByFileUrlIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where fileUrl in
        defaultOfficialDocumentFiltering("fileUrl.in=" + DEFAULT_FILE_URL + "," + UPDATED_FILE_URL, "fileUrl.in=" + UPDATED_FILE_URL);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByFileUrlIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where fileUrl is not null
        defaultOfficialDocumentFiltering("fileUrl.specified=true", "fileUrl.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByFileUrlContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where fileUrl contains
        defaultOfficialDocumentFiltering("fileUrl.contains=" + DEFAULT_FILE_URL, "fileUrl.contains=" + UPDATED_FILE_URL);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByFileUrlNotContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where fileUrl does not contain
        defaultOfficialDocumentFiltering("fileUrl.doesNotContain=" + UPDATED_FILE_URL, "fileUrl.doesNotContain=" + DEFAULT_FILE_URL);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySignedByIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where signedBy equals to
        defaultOfficialDocumentFiltering("signedBy.equals=" + DEFAULT_SIGNED_BY, "signedBy.equals=" + UPDATED_SIGNED_BY);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySignedByIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where signedBy in
        defaultOfficialDocumentFiltering("signedBy.in=" + DEFAULT_SIGNED_BY + "," + UPDATED_SIGNED_BY, "signedBy.in=" + UPDATED_SIGNED_BY);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySignedByIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where signedBy is not null
        defaultOfficialDocumentFiltering("signedBy.specified=true", "signedBy.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySignedByContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where signedBy contains
        defaultOfficialDocumentFiltering("signedBy.contains=" + DEFAULT_SIGNED_BY, "signedBy.contains=" + UPDATED_SIGNED_BY);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySignedByNotContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where signedBy does not contain
        defaultOfficialDocumentFiltering("signedBy.doesNotContain=" + UPDATED_SIGNED_BY, "signedBy.doesNotContain=" + DEFAULT_SIGNED_BY);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySentAtIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where sentAt equals to
        defaultOfficialDocumentFiltering("sentAt.equals=" + DEFAULT_SENT_AT, "sentAt.equals=" + UPDATED_SENT_AT);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySentAtIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where sentAt in
        defaultOfficialDocumentFiltering("sentAt.in=" + DEFAULT_SENT_AT + "," + UPDATED_SENT_AT, "sentAt.in=" + UPDATED_SENT_AT);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsBySentAtIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where sentAt is not null
        defaultOfficialDocumentFiltering("sentAt.specified=true", "sentAt.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByNotesIsEqualToSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where notes equals to
        defaultOfficialDocumentFiltering("notes.equals=" + DEFAULT_NOTES, "notes.equals=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByNotesIsInShouldWork() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where notes in
        defaultOfficialDocumentFiltering("notes.in=" + DEFAULT_NOTES + "," + UPDATED_NOTES, "notes.in=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByNotesIsNullOrNotNull() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where notes is not null
        defaultOfficialDocumentFiltering("notes.specified=true", "notes.specified=false");
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByNotesContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where notes contains
        defaultOfficialDocumentFiltering("notes.contains=" + DEFAULT_NOTES, "notes.contains=" + UPDATED_NOTES);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByNotesNotContainsSomething() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        // Get all the officialDocumentList where notes does not contain
        defaultOfficialDocumentFiltering("notes.doesNotContain=" + UPDATED_NOTES, "notes.doesNotContain=" + DEFAULT_NOTES);
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByCompanyIsEqualToSomething() throws Exception {
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            officialDocumentRepository.saveAndFlush(officialDocument);
            company = CompanyResourceIT.createEntity();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        em.persist(company);
        em.flush();
        officialDocument.setCompany(company);
        officialDocumentRepository.saveAndFlush(officialDocument);
        Long companyId = company.getId();
        // Get all the officialDocumentList where company equals to companyId
        defaultOfficialDocumentShouldBeFound("companyId.equals=" + companyId);

        // Get all the officialDocumentList where company equals to (companyId + 1)
        defaultOfficialDocumentShouldNotBeFound("companyId.equals=" + (companyId + 1));
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByEmployeeIsEqualToSomething() throws Exception {
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            officialDocumentRepository.saveAndFlush(officialDocument);
            employee = EmployeeResourceIT.createEntity(em);
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        em.persist(employee);
        em.flush();
        officialDocument.setEmployee(employee);
        officialDocumentRepository.saveAndFlush(officialDocument);
        Long employeeId = employee.getId();
        // Get all the officialDocumentList where employee equals to employeeId
        defaultOfficialDocumentShouldBeFound("employeeId.equals=" + employeeId);

        // Get all the officialDocumentList where employee equals to (employeeId + 1)
        defaultOfficialDocumentShouldNotBeFound("employeeId.equals=" + (employeeId + 1));
    }

    @Test
    @Transactional
    void getAllOfficialDocumentsByGeneratedByIsEqualToSomething() throws Exception {
        UserProfile generatedBy;
        if (TestUtil.findAll(em, UserProfile.class).isEmpty()) {
            officialDocumentRepository.saveAndFlush(officialDocument);
            generatedBy = UserProfileResourceIT.createEntity(em);
        } else {
            generatedBy = TestUtil.findAll(em, UserProfile.class).get(0);
        }
        em.persist(generatedBy);
        em.flush();
        officialDocument.setGeneratedBy(generatedBy);
        officialDocumentRepository.saveAndFlush(officialDocument);
        Long generatedById = generatedBy.getId();
        // Get all the officialDocumentList where generatedBy equals to generatedById
        defaultOfficialDocumentShouldBeFound("generatedById.equals=" + generatedById);

        // Get all the officialDocumentList where generatedBy equals to (generatedById + 1)
        defaultOfficialDocumentShouldNotBeFound("generatedById.equals=" + (generatedById + 1));
    }

    private void defaultOfficialDocumentFiltering(String shouldBeFound, String shouldNotBeFound) throws Exception {
        defaultOfficialDocumentShouldBeFound(shouldBeFound);
        defaultOfficialDocumentShouldNotBeFound(shouldNotBeFound);
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultOfficialDocumentShouldBeFound(String filter) throws Exception {
        restOfficialDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(officialDocument.getId().intValue())))
            .andExpect(jsonPath("$.[*].docType").value(hasItem(DEFAULT_DOC_TYPE.toString())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].month").value(hasItem(DEFAULT_MONTH)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].generatedAt").value(hasItem(DEFAULT_GENERATED_AT.toString())))
            .andExpect(jsonPath("$.[*].fileUrl").value(hasItem(DEFAULT_FILE_URL)))
            .andExpect(jsonPath("$.[*].signedBy").value(hasItem(DEFAULT_SIGNED_BY)))
            .andExpect(jsonPath("$.[*].sentAt").value(hasItem(DEFAULT_SENT_AT.toString())))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)));

        // Check, that the count call also returns 1
        restOfficialDocumentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultOfficialDocumentShouldNotBeFound(String filter) throws Exception {
        restOfficialDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restOfficialDocumentMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingOfficialDocument() throws Exception {
        // Get the officialDocument
        restOfficialDocumentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingOfficialDocument() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the officialDocument
        OfficialDocument updatedOfficialDocument = officialDocumentRepository.findById(officialDocument.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedOfficialDocument are not directly saved in db
        em.detach(updatedOfficialDocument);
        updatedOfficialDocument
            .docType(UPDATED_DOC_TYPE)
            .title(UPDATED_TITLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .generatedAt(UPDATED_GENERATED_AT)
            .fileUrl(UPDATED_FILE_URL)
            .signedBy(UPDATED_SIGNED_BY)
            .sentAt(UPDATED_SENT_AT)
            .notes(UPDATED_NOTES);
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(updatedOfficialDocument);

        restOfficialDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, officialDocumentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(officialDocumentDTO))
            )
            .andExpect(status().isOk());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedOfficialDocumentToMatchAllProperties(updatedOfficialDocument);
    }

    @Test
    @Transactional
    void putNonExistingOfficialDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        officialDocument.setId(longCount.incrementAndGet());

        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restOfficialDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, officialDocumentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(officialDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchOfficialDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        officialDocument.setId(longCount.incrementAndGet());

        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restOfficialDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(officialDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamOfficialDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        officialDocument.setId(longCount.incrementAndGet());

        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restOfficialDocumentMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateOfficialDocumentWithPatch() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the officialDocument using partial update
        OfficialDocument partialUpdatedOfficialDocument = new OfficialDocument();
        partialUpdatedOfficialDocument.setId(officialDocument.getId());

        partialUpdatedOfficialDocument
            .docType(UPDATED_DOC_TYPE)
            .title(UPDATED_TITLE)
            .year(UPDATED_YEAR)
            .fileUrl(UPDATED_FILE_URL)
            .sentAt(UPDATED_SENT_AT)
            .notes(UPDATED_NOTES);

        restOfficialDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedOfficialDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedOfficialDocument))
            )
            .andExpect(status().isOk());

        // Validate the OfficialDocument in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertOfficialDocumentUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedOfficialDocument, officialDocument),
            getPersistedOfficialDocument(officialDocument)
        );
    }

    @Test
    @Transactional
    void fullUpdateOfficialDocumentWithPatch() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the officialDocument using partial update
        OfficialDocument partialUpdatedOfficialDocument = new OfficialDocument();
        partialUpdatedOfficialDocument.setId(officialDocument.getId());

        partialUpdatedOfficialDocument
            .docType(UPDATED_DOC_TYPE)
            .title(UPDATED_TITLE)
            .month(UPDATED_MONTH)
            .year(UPDATED_YEAR)
            .generatedAt(UPDATED_GENERATED_AT)
            .fileUrl(UPDATED_FILE_URL)
            .signedBy(UPDATED_SIGNED_BY)
            .sentAt(UPDATED_SENT_AT)
            .notes(UPDATED_NOTES);

        restOfficialDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedOfficialDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedOfficialDocument))
            )
            .andExpect(status().isOk());

        // Validate the OfficialDocument in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertOfficialDocumentUpdatableFieldsEquals(
            partialUpdatedOfficialDocument,
            getPersistedOfficialDocument(partialUpdatedOfficialDocument)
        );
    }

    @Test
    @Transactional
    void patchNonExistingOfficialDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        officialDocument.setId(longCount.incrementAndGet());

        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restOfficialDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, officialDocumentDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(officialDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchOfficialDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        officialDocument.setId(longCount.incrementAndGet());

        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restOfficialDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(officialDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamOfficialDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        officialDocument.setId(longCount.incrementAndGet());

        // Create the OfficialDocument
        OfficialDocumentDTO officialDocumentDTO = officialDocumentMapper.toDto(officialDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restOfficialDocumentMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(officialDocumentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the OfficialDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteOfficialDocument() throws Exception {
        // Initialize the database
        insertedOfficialDocument = officialDocumentRepository.saveAndFlush(officialDocument);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the officialDocument
        restOfficialDocumentMockMvc
            .perform(delete(ENTITY_API_URL_ID, officialDocument.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return officialDocumentRepository.count();
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

    protected OfficialDocument getPersistedOfficialDocument(OfficialDocument officialDocument) {
        return officialDocumentRepository.findById(officialDocument.getId()).orElseThrow();
    }

    protected void assertPersistedOfficialDocumentToMatchAllProperties(OfficialDocument expectedOfficialDocument) {
        assertOfficialDocumentAllPropertiesEquals(expectedOfficialDocument, getPersistedOfficialDocument(expectedOfficialDocument));
    }

    protected void assertPersistedOfficialDocumentToMatchUpdatableProperties(OfficialDocument expectedOfficialDocument) {
        assertOfficialDocumentAllUpdatablePropertiesEquals(
            expectedOfficialDocument,
            getPersistedOfficialDocument(expectedOfficialDocument)
        );
    }
}
