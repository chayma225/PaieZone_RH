package tn.paiezone.rh.service.impl;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.OfficialDocument;
import tn.paiezone.rh.repository.OfficialDocumentRepository;
import tn.paiezone.rh.service.OfficialDocumentService;
import tn.paiezone.rh.service.dto.OfficialDocumentDTO;
import tn.paiezone.rh.service.mapper.OfficialDocumentMapper;

/**
 * Service Implementation for managing {@link tn.paiezone.rh.domain.OfficialDocument}.
 */
@Service
@Transactional
public class OfficialDocumentServiceImpl implements OfficialDocumentService {

    private static final Logger LOG = LoggerFactory.getLogger(OfficialDocumentServiceImpl.class);

    private final OfficialDocumentRepository officialDocumentRepository;

    private final OfficialDocumentMapper officialDocumentMapper;

    public OfficialDocumentServiceImpl(
        OfficialDocumentRepository officialDocumentRepository,
        OfficialDocumentMapper officialDocumentMapper
    ) {
        this.officialDocumentRepository = officialDocumentRepository;
        this.officialDocumentMapper = officialDocumentMapper;
    }

    @Override
    public OfficialDocumentDTO save(OfficialDocumentDTO officialDocumentDTO) {
        LOG.debug("Request to save OfficialDocument : {}", officialDocumentDTO);
        OfficialDocument officialDocument = officialDocumentMapper.toEntity(officialDocumentDTO);
        officialDocument = officialDocumentRepository.save(officialDocument);
        return officialDocumentMapper.toDto(officialDocument);
    }

    @Override
    public OfficialDocumentDTO update(OfficialDocumentDTO officialDocumentDTO) {
        LOG.debug("Request to update OfficialDocument : {}", officialDocumentDTO);
        OfficialDocument officialDocument = officialDocumentMapper.toEntity(officialDocumentDTO);
        officialDocument = officialDocumentRepository.save(officialDocument);
        return officialDocumentMapper.toDto(officialDocument);
    }

    @Override
    public Optional<OfficialDocumentDTO> partialUpdate(OfficialDocumentDTO officialDocumentDTO) {
        LOG.debug("Request to partially update OfficialDocument : {}", officialDocumentDTO);

        return officialDocumentRepository
            .findById(officialDocumentDTO.getId())
            .map(existingOfficialDocument -> {
                officialDocumentMapper.partialUpdate(existingOfficialDocument, officialDocumentDTO);

                return existingOfficialDocument;
            })
            .map(officialDocumentRepository::save)
            .map(officialDocumentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OfficialDocumentDTO> findOne(Long id) {
        LOG.debug("Request to get OfficialDocument : {}", id);
        return officialDocumentRepository.findById(id).map(officialDocumentMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete OfficialDocument : {}", id);
        officialDocumentRepository.deleteById(id);
    }
}
