package tn.paiezone.rh.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static tn.paiezone.rh.domain.KnowledgeDocumentAsserts.*;
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
import tn.paiezone.rh.domain.KnowledgeDocument;
import tn.paiezone.rh.repository.KnowledgeDocumentRepository;
import tn.paiezone.rh.service.dto.KnowledgeDocumentDTO;
import tn.paiezone.rh.service.mapper.KnowledgeDocumentMapper;

/**
 * Integration tests for the {@link KnowledgeDocumentResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class KnowledgeDocumentResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_CATEGORY = "AAAAAAAAAA";
    private static final String UPDATED_CATEGORY = "BBBBBBBBBB";

    private static final String DEFAULT_CONTENT = "AAAAAAAAAA";
    private static final String UPDATED_CONTENT = "BBBBBBBBBB";

    private static final String DEFAULT_FILE_URL = "AAAAAAAAAA";
    private static final String UPDATED_FILE_URL = "BBBBBBBBBB";

    private static final Boolean DEFAULT_VECTOR_INDEXED = false;
    private static final Boolean UPDATED_VECTOR_INDEXED = true;

    private static final Instant DEFAULT_INDEXED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_INDEXED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final Boolean DEFAULT_ACTIVE = false;
    private static final Boolean UPDATED_ACTIVE = true;

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/knowledge-documents";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2L * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private KnowledgeDocumentRepository knowledgeDocumentRepository;

    @Autowired
    private KnowledgeDocumentMapper knowledgeDocumentMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restKnowledgeDocumentMockMvc;

    private KnowledgeDocument knowledgeDocument;

    private KnowledgeDocument insertedKnowledgeDocument;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static KnowledgeDocument createEntity(EntityManager em) {
        KnowledgeDocument knowledgeDocument = new KnowledgeDocument()
            .title(DEFAULT_TITLE)
            .category(DEFAULT_CATEGORY)
            .content(DEFAULT_CONTENT)
            .fileUrl(DEFAULT_FILE_URL)
            .vectorIndexed(DEFAULT_VECTOR_INDEXED)
            .indexedAt(DEFAULT_INDEXED_AT)
            .active(DEFAULT_ACTIVE)
            .createdAt(DEFAULT_CREATED_AT);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        knowledgeDocument.setCompany(company);
        return knowledgeDocument;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static KnowledgeDocument createUpdatedEntity(EntityManager em) {
        KnowledgeDocument updatedKnowledgeDocument = new KnowledgeDocument()
            .title(UPDATED_TITLE)
            .category(UPDATED_CATEGORY)
            .content(UPDATED_CONTENT)
            .fileUrl(UPDATED_FILE_URL)
            .vectorIndexed(UPDATED_VECTOR_INDEXED)
            .indexedAt(UPDATED_INDEXED_AT)
            .active(UPDATED_ACTIVE)
            .createdAt(UPDATED_CREATED_AT);
        // Add required entity
        Company company;
        if (TestUtil.findAll(em, Company.class).isEmpty()) {
            company = CompanyResourceIT.createUpdatedEntity();
            em.persist(company);
            em.flush();
        } else {
            company = TestUtil.findAll(em, Company.class).get(0);
        }
        updatedKnowledgeDocument.setCompany(company);
        return updatedKnowledgeDocument;
    }

    @BeforeEach
    void initTest() {
        knowledgeDocument = createEntity(em);
    }

    @AfterEach
    void cleanup() {
        if (insertedKnowledgeDocument != null) {
            knowledgeDocumentRepository.delete(insertedKnowledgeDocument);
            insertedKnowledgeDocument = null;
        }
    }

    @Test
    @Transactional
    void createKnowledgeDocument() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);
        var returnedKnowledgeDocumentDTO = om.readValue(
            restKnowledgeDocumentMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            KnowledgeDocumentDTO.class
        );

        // Validate the KnowledgeDocument in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedKnowledgeDocument = knowledgeDocumentMapper.toEntity(returnedKnowledgeDocumentDTO);
        assertKnowledgeDocumentUpdatableFieldsEquals(returnedKnowledgeDocument, getPersistedKnowledgeDocument(returnedKnowledgeDocument));

        insertedKnowledgeDocument = returnedKnowledgeDocument;
    }

    @Test
    @Transactional
    void createKnowledgeDocumentWithExistingId() throws Exception {
        // Create the KnowledgeDocument with an existing ID
        knowledgeDocument.setId(1L);
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restKnowledgeDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        knowledgeDocument.setTitle(null);

        // Create the KnowledgeDocument, which fails.
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        restKnowledgeDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkVectorIndexedIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        knowledgeDocument.setVectorIndexed(null);

        // Create the KnowledgeDocument, which fails.
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        restKnowledgeDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkActiveIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        knowledgeDocument.setActive(null);

        // Create the KnowledgeDocument, which fails.
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        restKnowledgeDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkCreatedAtIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        knowledgeDocument.setCreatedAt(null);

        // Create the KnowledgeDocument, which fails.
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        restKnowledgeDocumentMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllKnowledgeDocuments() throws Exception {
        // Initialize the database
        insertedKnowledgeDocument = knowledgeDocumentRepository.saveAndFlush(knowledgeDocument);

        // Get all the knowledgeDocumentList
        restKnowledgeDocumentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(knowledgeDocument.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].category").value(hasItem(DEFAULT_CATEGORY)))
            .andExpect(jsonPath("$.[*].content").value(hasItem(DEFAULT_CONTENT)))
            .andExpect(jsonPath("$.[*].fileUrl").value(hasItem(DEFAULT_FILE_URL)))
            .andExpect(jsonPath("$.[*].vectorIndexed").value(hasItem(DEFAULT_VECTOR_INDEXED)))
            .andExpect(jsonPath("$.[*].indexedAt").value(hasItem(DEFAULT_INDEXED_AT.toString())))
            .andExpect(jsonPath("$.[*].active").value(hasItem(DEFAULT_ACTIVE)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @Test
    @Transactional
    void getKnowledgeDocument() throws Exception {
        // Initialize the database
        insertedKnowledgeDocument = knowledgeDocumentRepository.saveAndFlush(knowledgeDocument);

        // Get the knowledgeDocument
        restKnowledgeDocumentMockMvc
            .perform(get(ENTITY_API_URL_ID, knowledgeDocument.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(knowledgeDocument.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.category").value(DEFAULT_CATEGORY))
            .andExpect(jsonPath("$.content").value(DEFAULT_CONTENT))
            .andExpect(jsonPath("$.fileUrl").value(DEFAULT_FILE_URL))
            .andExpect(jsonPath("$.vectorIndexed").value(DEFAULT_VECTOR_INDEXED))
            .andExpect(jsonPath("$.indexedAt").value(DEFAULT_INDEXED_AT.toString()))
            .andExpect(jsonPath("$.active").value(DEFAULT_ACTIVE))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingKnowledgeDocument() throws Exception {
        // Get the knowledgeDocument
        restKnowledgeDocumentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingKnowledgeDocument() throws Exception {
        // Initialize the database
        insertedKnowledgeDocument = knowledgeDocumentRepository.saveAndFlush(knowledgeDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the knowledgeDocument
        KnowledgeDocument updatedKnowledgeDocument = knowledgeDocumentRepository.findById(knowledgeDocument.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedKnowledgeDocument are not directly saved in db
        em.detach(updatedKnowledgeDocument);
        updatedKnowledgeDocument
            .title(UPDATED_TITLE)
            .category(UPDATED_CATEGORY)
            .content(UPDATED_CONTENT)
            .fileUrl(UPDATED_FILE_URL)
            .vectorIndexed(UPDATED_VECTOR_INDEXED)
            .indexedAt(UPDATED_INDEXED_AT)
            .active(UPDATED_ACTIVE)
            .createdAt(UPDATED_CREATED_AT);
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(updatedKnowledgeDocument);

        restKnowledgeDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, knowledgeDocumentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(knowledgeDocumentDTO))
            )
            .andExpect(status().isOk());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedKnowledgeDocumentToMatchAllProperties(updatedKnowledgeDocument);
    }

    @Test
    @Transactional
    void putNonExistingKnowledgeDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        knowledgeDocument.setId(longCount.incrementAndGet());

        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restKnowledgeDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, knowledgeDocumentDTO.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(knowledgeDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchKnowledgeDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        knowledgeDocument.setId(longCount.incrementAndGet());

        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKnowledgeDocumentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(knowledgeDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamKnowledgeDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        knowledgeDocument.setId(longCount.incrementAndGet());

        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKnowledgeDocumentMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateKnowledgeDocumentWithPatch() throws Exception {
        // Initialize the database
        insertedKnowledgeDocument = knowledgeDocumentRepository.saveAndFlush(knowledgeDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the knowledgeDocument using partial update
        KnowledgeDocument partialUpdatedKnowledgeDocument = new KnowledgeDocument();
        partialUpdatedKnowledgeDocument.setId(knowledgeDocument.getId());

        partialUpdatedKnowledgeDocument
            .category(UPDATED_CATEGORY)
            .fileUrl(UPDATED_FILE_URL)
            .vectorIndexed(UPDATED_VECTOR_INDEXED)
            .indexedAt(UPDATED_INDEXED_AT);

        restKnowledgeDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedKnowledgeDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedKnowledgeDocument))
            )
            .andExpect(status().isOk());

        // Validate the KnowledgeDocument in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertKnowledgeDocumentUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedKnowledgeDocument, knowledgeDocument),
            getPersistedKnowledgeDocument(knowledgeDocument)
        );
    }

    @Test
    @Transactional
    void fullUpdateKnowledgeDocumentWithPatch() throws Exception {
        // Initialize the database
        insertedKnowledgeDocument = knowledgeDocumentRepository.saveAndFlush(knowledgeDocument);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the knowledgeDocument using partial update
        KnowledgeDocument partialUpdatedKnowledgeDocument = new KnowledgeDocument();
        partialUpdatedKnowledgeDocument.setId(knowledgeDocument.getId());

        partialUpdatedKnowledgeDocument
            .title(UPDATED_TITLE)
            .category(UPDATED_CATEGORY)
            .content(UPDATED_CONTENT)
            .fileUrl(UPDATED_FILE_URL)
            .vectorIndexed(UPDATED_VECTOR_INDEXED)
            .indexedAt(UPDATED_INDEXED_AT)
            .active(UPDATED_ACTIVE)
            .createdAt(UPDATED_CREATED_AT);

        restKnowledgeDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedKnowledgeDocument.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedKnowledgeDocument))
            )
            .andExpect(status().isOk());

        // Validate the KnowledgeDocument in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertKnowledgeDocumentUpdatableFieldsEquals(
            partialUpdatedKnowledgeDocument,
            getPersistedKnowledgeDocument(partialUpdatedKnowledgeDocument)
        );
    }

    @Test
    @Transactional
    void patchNonExistingKnowledgeDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        knowledgeDocument.setId(longCount.incrementAndGet());

        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restKnowledgeDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, knowledgeDocumentDTO.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(knowledgeDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchKnowledgeDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        knowledgeDocument.setId(longCount.incrementAndGet());

        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKnowledgeDocumentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(knowledgeDocumentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamKnowledgeDocument() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        knowledgeDocument.setId(longCount.incrementAndGet());

        // Create the KnowledgeDocument
        KnowledgeDocumentDTO knowledgeDocumentDTO = knowledgeDocumentMapper.toDto(knowledgeDocument);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restKnowledgeDocumentMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(knowledgeDocumentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the KnowledgeDocument in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteKnowledgeDocument() throws Exception {
        // Initialize the database
        insertedKnowledgeDocument = knowledgeDocumentRepository.saveAndFlush(knowledgeDocument);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the knowledgeDocument
        restKnowledgeDocumentMockMvc
            .perform(delete(ENTITY_API_URL_ID, knowledgeDocument.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return knowledgeDocumentRepository.count();
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

    protected KnowledgeDocument getPersistedKnowledgeDocument(KnowledgeDocument knowledgeDocument) {
        return knowledgeDocumentRepository.findById(knowledgeDocument.getId()).orElseThrow();
    }

    protected void assertPersistedKnowledgeDocumentToMatchAllProperties(KnowledgeDocument expectedKnowledgeDocument) {
        assertKnowledgeDocumentAllPropertiesEquals(expectedKnowledgeDocument, getPersistedKnowledgeDocument(expectedKnowledgeDocument));
    }

    protected void assertPersistedKnowledgeDocumentToMatchUpdatableProperties(KnowledgeDocument expectedKnowledgeDocument) {
        assertKnowledgeDocumentAllUpdatablePropertiesEquals(
            expectedKnowledgeDocument,
            getPersistedKnowledgeDocument(expectedKnowledgeDocument)
        );
    }
}
