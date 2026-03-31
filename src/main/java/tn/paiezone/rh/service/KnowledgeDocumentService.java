package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.KnowledgeDocument;
import tn.paiezone.rh.repository.KnowledgeDocumentRepository;
import tn.paiezone.rh.service.dto.KnowledgeDocumentDTO;
import tn.paiezone.rh.service.mapper.KnowledgeDocumentMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.KnowledgeDocument}.
 */
@Service
@Transactional
public class KnowledgeDocumentService {

    private static final Logger LOG = LoggerFactory.getLogger(KnowledgeDocumentService.class);

    private final KnowledgeDocumentRepository knowledgeDocumentRepository;

    private final KnowledgeDocumentMapper knowledgeDocumentMapper;

    public KnowledgeDocumentService(
        KnowledgeDocumentRepository knowledgeDocumentRepository,
        KnowledgeDocumentMapper knowledgeDocumentMapper
    ) {
        this.knowledgeDocumentRepository = knowledgeDocumentRepository;
        this.knowledgeDocumentMapper = knowledgeDocumentMapper;
    }

    /**
     * Save a knowledgeDocument.
     *
     * @param knowledgeDocumentDTO the entity to save.
     * @return the persisted entity.
     */
    public KnowledgeDocumentDTO save(KnowledgeDocumentDTO knowledgeDocumentDTO) {
        LOG.debug("Request to save KnowledgeDocument : {}", knowledgeDocumentDTO);
        KnowledgeDocument knowledgeDocument = knowledgeDocumentMapper.toEntity(knowledgeDocumentDTO);
        knowledgeDocument = knowledgeDocumentRepository.save(knowledgeDocument);
        return knowledgeDocumentMapper.toDto(knowledgeDocument);
    }

    /**
     * Update a knowledgeDocument.
     *
     * @param knowledgeDocumentDTO the entity to save.
     * @return the persisted entity.
     */
    public KnowledgeDocumentDTO update(KnowledgeDocumentDTO knowledgeDocumentDTO) {
        LOG.debug("Request to update KnowledgeDocument : {}", knowledgeDocumentDTO);
        KnowledgeDocument knowledgeDocument = knowledgeDocumentMapper.toEntity(knowledgeDocumentDTO);
        knowledgeDocument = knowledgeDocumentRepository.save(knowledgeDocument);
        return knowledgeDocumentMapper.toDto(knowledgeDocument);
    }

    /**
     * Partially update a knowledgeDocument.
     *
     * @param knowledgeDocumentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<KnowledgeDocumentDTO> partialUpdate(KnowledgeDocumentDTO knowledgeDocumentDTO) {
        LOG.debug("Request to partially update KnowledgeDocument : {}", knowledgeDocumentDTO);

        return knowledgeDocumentRepository
            .findById(knowledgeDocumentDTO.getId())
            .map(existingKnowledgeDocument -> {
                knowledgeDocumentMapper.partialUpdate(existingKnowledgeDocument, knowledgeDocumentDTO);

                return existingKnowledgeDocument;
            })
            .map(knowledgeDocumentRepository::save)
            .map(knowledgeDocumentMapper::toDto);
    }

    /**
     * Get all the knowledgeDocuments.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<KnowledgeDocumentDTO> findAll() {
        LOG.debug("Request to get all KnowledgeDocuments");
        return knowledgeDocumentRepository
            .findAll()
            .stream()
            .map(knowledgeDocumentMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one knowledgeDocument by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<KnowledgeDocumentDTO> findOne(Long id) {
        LOG.debug("Request to get KnowledgeDocument : {}", id);
        return knowledgeDocumentRepository.findById(id).map(knowledgeDocumentMapper::toDto);
    }

    /**
     * Delete the knowledgeDocument by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete KnowledgeDocument : {}", id);
        knowledgeDocumentRepository.deleteById(id);
    }
}
