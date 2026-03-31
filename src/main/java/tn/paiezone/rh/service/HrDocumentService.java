package tn.paiezone.rh.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.HrDocument;
import tn.paiezone.rh.repository.HrDocumentRepository;
import tn.paiezone.rh.service.dto.HrDocumentDTO;
import tn.paiezone.rh.service.mapper.HrDocumentMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.HrDocument}.
 */
@Service
@Transactional
public class HrDocumentService {

    private static final Logger LOG = LoggerFactory.getLogger(HrDocumentService.class);

    private final HrDocumentRepository hrDocumentRepository;

    private final HrDocumentMapper hrDocumentMapper;

    public HrDocumentService(HrDocumentRepository hrDocumentRepository, HrDocumentMapper hrDocumentMapper) {
        this.hrDocumentRepository = hrDocumentRepository;
        this.hrDocumentMapper = hrDocumentMapper;
    }

    /**
     * Save a hrDocument.
     *
     * @param hrDocumentDTO the entity to save.
     * @return the persisted entity.
     */
    public HrDocumentDTO save(HrDocumentDTO hrDocumentDTO) {
        LOG.debug("Request to save HrDocument : {}", hrDocumentDTO);
        HrDocument hrDocument = hrDocumentMapper.toEntity(hrDocumentDTO);
        hrDocument = hrDocumentRepository.save(hrDocument);
        return hrDocumentMapper.toDto(hrDocument);
    }

    /**
     * Update a hrDocument.
     *
     * @param hrDocumentDTO the entity to save.
     * @return the persisted entity.
     */
    public HrDocumentDTO update(HrDocumentDTO hrDocumentDTO) {
        LOG.debug("Request to update HrDocument : {}", hrDocumentDTO);
        HrDocument hrDocument = hrDocumentMapper.toEntity(hrDocumentDTO);
        hrDocument = hrDocumentRepository.save(hrDocument);
        return hrDocumentMapper.toDto(hrDocument);
    }

    /**
     * Partially update a hrDocument.
     *
     * @param hrDocumentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<HrDocumentDTO> partialUpdate(HrDocumentDTO hrDocumentDTO) {
        LOG.debug("Request to partially update HrDocument : {}", hrDocumentDTO);

        return hrDocumentRepository
            .findById(hrDocumentDTO.getId())
            .map(existingHrDocument -> {
                hrDocumentMapper.partialUpdate(existingHrDocument, hrDocumentDTO);

                return existingHrDocument;
            })
            .map(hrDocumentRepository::save)
            .map(hrDocumentMapper::toDto);
    }

    /**
     * Get all the hrDocuments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<HrDocumentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all HrDocuments");
        return hrDocumentRepository.findAll(pageable).map(hrDocumentMapper::toDto);
    }

    /**
     * Get one hrDocument by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<HrDocumentDTO> findOne(Long id) {
        LOG.debug("Request to get HrDocument : {}", id);
        return hrDocumentRepository.findById(id).map(hrDocumentMapper::toDto);
    }

    /**
     * Delete the hrDocument by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete HrDocument : {}", id);
        hrDocumentRepository.deleteById(id);
    }
}
