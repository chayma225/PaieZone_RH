package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.HrDocumentAsserts.*;
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
import tn.paiezone.rh.domain.HrDocument;
import tn.paiezone.rh.domain.enumeration.DocumentType;
import tn.paiezone.rh.repository.HrDocumentRepository;
import tn.paiezone.rh.service.dto.HrDocumentDTO;
import tn.paiezone.rh.service.mapper.HrDocumentMapper;

/**
 * Integration tests for the {@link HrDocumentResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class HrDocumentResourceIT {

    private static final DocumentType DEFAULT_DOCUMENT_TYPE = DocumentType.CONTRACT;
    private static final DocumentType UPDATED_DOCUMENT_TYPE = DocumentType.CIN_COPY;

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_FILE_URL = "AAAAAAAAAA";
    private static final String UPDATED_FILE_URL = "BBBBBBBBBB";

    private static final Long DEFAULT_FILE_SIZE = 1L;
    private static final Long UPDATED_FILE_SIZE = 2L;

    private static final String DEFAULT_MIME_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_MIME_TYPE = "BBBBBBBBBB";

    private static final Instant DEFAULT_UPLOADED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_UPLOADED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final LocalDate DEFAULT_EXPIRY_DATE = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_EXPIRY_DATE = LocalDate.now(ZoneId.systemDefault());

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final String ENTITY_API_URL = "/api/hr-documents";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private HrDocumentRepository hrDocumentRepository;

    @Autowired
    private HrDocumentMapper hrDocumentMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restHrDocumentMockMvc;

    private HrDocument hrDocument;

    private HrDocument insertedHrDocument;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HrDocument createEntity(EntityManager em) {
        HrDocument hrDocument = new HrDocument()
            .documentType(DEFAULT_DOCUMENT_TYPE)
            .title(DEFAULT_TITLE)
            .description(DEFAULT_DESCRIPTION)
            .fileUrl(DEFAULT_FILE_URL)
            .fileSize(DEFAULT_FILE_SIZE)
            .mimeType(DEFAULT_MIME_TYPE)
            .uploadedAt(DEFAULT_UPLOADED_AT)
            .expiryDate(DEFAULT_EXPIRY_DATE)
            .active(DEFAULT_ACTIVE);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        hrDocument.setEmployee(employee);
        return hrDocument;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static HrDocument createUpdatedEntity(EntityManager em) {
        HrDocument updatedHrDocument = new HrDocument()
            .documentType(UPDATED_DOCUMENT_TYPE)
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fileUrl(UPDATED_FILE_URL)
            .fileSize(UPDATED_FILE_SIZE)
            .mimeType(UPDATED_MIME_TYPE)
            .uploadedAt(UPDATED_UPLOADED_AT)
            .expiryDate(UPDATED_EXPIRY_DATE)
            .active(UPDATED_ACTIVE);
        // Add required entity
        Employee employee;
        if (TestUtil.findAll(em, Employee.class).isEmpty()) {
            employee = EmployeeResourceIT.createUpdatedEntity(em);
            em.persist(employee);
            em.flush();
        } else {
            employee = TestUtil.findAll(em, Employee.class).get(0);
        }
        updatedHrDocument.setEmployee(employee);
        return updatedHrDocument;
    }

    @BeforeEach
    void initTest() {
        hrDocument = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedHrDocument != null) {
            hrDocumentRepository.delete(insertedHrDocument);
            insertedHrDocument = null;
        }
    }

    @Test
    @Transactional
    void createHrDocument() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);
        var returnedHrDocumentDTO = om.readValue(
            restHrDocumentMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            HrDocumentDTO.class
        );

        // Validate the HrDocument in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedHrDocument = hrDocumentMapper.toEntity(returnedHrDocumentDTO);
        assertHrDocumentUpdatableFieldsEquals(returnedHrDocument, getPersistedHrDocument(returnedHrDocument));

        insertedHrDocument = returnedHrDocument;
    }

    @Test
    @Transactional
    void createHrDocumentWithExistingId() throws Exception {
        // Create the HrDocument with an existing ID
        hrDocument.setId(1L);
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restHrDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDocumentTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hrDocument.setDocumentType(null);

        // Create the HrDocument, which fails.
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        restHrDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hrDocument.setTitle(null);

        // Create the HrDocument, which fails.
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        restHrDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFileUrlIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hrDocument.setFileUrl(null);

        // Create the HrDocument, which fails.
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        restHrDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkUploadedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hrDocument.setUploadedAt(null);

        // Create the HrDocument, which fails.
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        restHrDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        hrDocument.setActive(null);

        // Create the HrDocument, which fails.
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        restHrDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllHrDocuments() throws Exception {
        // Initialize the database
        insertedHrDocument = hrDocumentRepository.saveAndFlush(hrDocument);

        // Get all the hrDocumentList
        restHrDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(hrDocument.getId().intValue())))
            .andExpect(jsonPath("$.[*].documentType").value(hasItem(DEFAULT_DOCUMENT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].fileUrl").value(hasItem(DEFAULT_FILE_URL)))
            .andExpect(jsonPath("$.[*].fileSize").value(hasItem(DEFAULT_FILE_SIZE.intValue())))
            .andExpect(jsonPath("$.[*].mimeType").value(hasItem(DEFAULT_MIME_TYPE)))
            .andExpect(jsonPath("$.[*].uploadedAt").value(hasItem(DEFAULT_UPLOADED_AT.toString())))
            .andExpect(jsonPath("$.[*].expiryDate").value(hasItem(DEFAULT_EXPIRY_DATE.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)));
    }

    @Test
    @Transactional
    void getHrDocument() throws Exception {
        // Initialize the database
        insertedHrDocument = hrDocumentRepository.saveAndFlush(hrDocument);

        // Get the hrDocument
        restHrDocumentMockMvc
            .perform(get(ENTITY_API_URL_ID, hrDocument.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(hrDocument.getId().intValue()))
            .andExpect(jsonPath("$.documentType").value(DEFAULT_DOCUMENT_TYPE.toString()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.fileUrl").value(DEFAULT_FILE_URL))
            .andExpect(jsonPath("$.fileSize").value(DEFAULT_FILE_SIZE.intValue()))
            .andExpect(jsonPath("$.mimeType").value(DEFAULT_MIME_TYPE))
            .andExpect(jsonPath("$.uploadedAt").value(DEFAULT_UPLOADED_AT.toString()))
            .andExpect(jsonPath("$.expiryDate").value(DEFAULT_EXPIRY_DATE.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE));
    }

    @Test
    @Transactional
    void getNonExistingHrDocument() throws Exception {
        // Get the hrDocument
        restHrDocumentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingHrDocument() throws Exception {
        // Initialize the database
        insertedHrDocument = hrDocumentRepository.saveAndFlush(hrDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the hrDocument
        HrDocument updatedHrDocument = hrDocumentRepository.findById(hrDocument.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedHrDocument are not directly saved in db
        em.detach(updatedHrDocument);
        updatedHrDocument
            .documentType(UPDATED_DOCUMENT_TYPE)
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fileUrl(UPDATED_FILE_URL)
            .fileSize(UPDATED_FILE_SIZE)
            .mimeType(UPDATED_MIME_TYPE)
            .uploadedAt(UPDATED_UPLOADED_AT)
            .expiryDate(UPDATED_EXPIRY_DATE)
            .active(UPDATED_ACTIVE);
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(updatedHrDocument);

        restHrDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, hrDocumentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(hrDocumentDTO))
            )
            .andExpect(status().isOk());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedHrDocumentToMatchAllProperties(updatedHrDocument);
    }

    @Test
    @Transactional
    void putNonExistingHrDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hrDocument.setId(longCount.incrementAndGet());

        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHrDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, hrDocumentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(hrDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchHrDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hrDocument.setId(longCount.incrementAndGet());

        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHrDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(hrDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamHrDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hrDocument.setId(longCount.incrementAndGet());

        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHrDocumentMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateHrDocumentWithPatch() throws Exception {
        // Initialize the database
        insertedHrDocument = hrDocumentRepository.saveAndFlush(hrDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the hrDocument using partial update
        HrDocument partialUpdatedHrDocument = new HrDocument();
        partialUpdatedHrDocument.setId(hrDocument.getId());

        partialUpdatedHrDocument
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fileUrl(UPDATED_FILE_URL)
            .mimeType(UPDATED_MIME_TYPE)
            .expiryDate(UPDATED_EXPIRY_DATE);

        restHrDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHrDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHrDocument))
            )
            .andExpect(status().isOk());

        // Validate the HrDocument in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHrDocumentUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedHrDocument, hrDocument),
            getPersistedHrDocument(hrDocument)
        );
    }

    @Test
    @Transactional
    void fullUpdateHrDocumentWithPatch() throws Exception {
        // Initialize the database
        insertedHrDocument = hrDocumentRepository.saveAndFlush(hrDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the hrDocument using partial update
        HrDocument partialUpdatedHrDocument = new HrDocument();
        partialUpdatedHrDocument.setId(hrDocument.getId());

        partialUpdatedHrDocument
            .documentType(UPDATED_DOCUMENT_TYPE)
            .title(UPDATED_TITLE)
            .description(UPDATED_DESCRIPTION)
            .fileUrl(UPDATED_FILE_URL)
            .fileSize(UPDATED_FILE_SIZE)
            .mimeType(UPDATED_MIME_TYPE)
            .uploadedAt(UPDATED_UPLOADED_AT)
            .expiryDate(UPDATED_EXPIRY_DATE)
            .active(UPDATED_ACTIVE);

        restHrDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedHrDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedHrDocument))
            )
            .andExpect(status().isOk());

        // Validate the HrDocument in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertHrDocumentUpdatableFieldsEquals(partialUpdatedHrDocument, getPersistedHrDocument(partialUpdatedHrDocument));
    }

    @Test
    @Transactional
    void patchNonExistingHrDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hrDocument.setId(longCount.incrementAndGet());

        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restHrDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, hrDocumentDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(hrDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchHrDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hrDocument.setId(longCount.incrementAndGet());

        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHrDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(hrDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamHrDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        hrDocument.setId(longCount.incrementAndGet());

        // Create the HrDocument
        HrDocumentDTO hrDocumentDTO = hrDocumentMapper.toDto(hrDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restHrDocumentMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(hrDocumentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the HrDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteHrDocument() throws Exception {
        // Initialize the database
        insertedHrDocument = hrDocumentRepository.saveAndFlush(hrDocument);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the hrDocument
        restHrDocumentMockMvc
            .perform(delete(ENTITY_API_URL_ID, hrDocument.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return hrDocumentRepository.count();
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

    protected HrDocument getPersistedHrDocument(HrDocument hrDocument) {
        return hrDocumentRepository.findById(hrDocument.getId()).orElseThrow();
    }

    protected void assertPersistedHrDocumentToMatchAllProperties(HrDocument expectedHrDocument) {
        assertHrDocumentAllPropertiesEquals(expectedHrDocument, getPersistedHrDocument(expectedHrDocument));
    }

    protected void assertPersistedHrDocumentToMatchUpdatableProperties(HrDocument expectedHrDocument) {
        assertHrDocumentAllUpdatablePropertiesEquals(expectedHrDocument, getPersistedHrDocument(expectedHrDocument));
    }
}
