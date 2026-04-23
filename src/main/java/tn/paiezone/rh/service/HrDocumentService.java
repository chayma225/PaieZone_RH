package tn.paiezone.rh.service;

import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.HrDocument;
import tn.paiezone.rh.repository.HrDocumentRepository;
import tn.paiezone.rh.service.dto.HrDocumentDTO;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.service.mapper.HrDocumentMapper;

@Service
@Transactional
public class HrDocumentService {

    private static final Logger LOG = LoggerFactory.getLogger(HrDocumentService.class);
    private static final String ENTITY_NAME = "hrDocument";

    // Types MIME autorisés
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // Taille max : 10 MB
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    private final HrDocumentRepository hrDocumentRepository;
    private final HrDocumentMapper hrDocumentMapper;

    public HrDocumentService(HrDocumentRepository hrDocumentRepository, HrDocumentMapper hrDocumentMapper) {
        this.hrDocumentRepository = hrDocumentRepository;
        this.hrDocumentMapper = hrDocumentMapper;
    }

    // ── US-12 : Créer un document ─────────────────────────────────────────────
    public HrDocumentDTO save(HrDocumentDTO dto) {
        LOG.debug("Request to save HrDocument : {}", dto);

        // Valider le type MIME
        if (dto.getMimeType() != null && !ALLOWED_MIME_TYPES.contains(dto.getMimeType())) {
            throw new BusinessException(
                "Type de fichier non autorisé : '" + dto.getMimeType() + "'. Types acceptés : PDF, JPEG, PNG, DOC, DOCX.",
                ENTITY_NAME,
                "invalidMimeType"
            );
        }

        // Valider la taille
        if (dto.getFileSize() != null && dto.getFileSize() > MAX_FILE_SIZE) {
            throw new BusinessException("La taille du fichier dépasse la limite autorisée de 10 MB.", ENTITY_NAME, "fileTooLarge");
        }

        dto.setUploadedAt(Instant.now());
        dto.setActive(true);

        HrDocument hrDocument = hrDocumentMapper.toEntity(dto);
        hrDocument = hrDocumentRepository.save(hrDocument);
        return hrDocumentMapper.toDto(hrDocument);
    }

    public HrDocumentDTO update(HrDocumentDTO dto) {
        LOG.debug("Request to update HrDocument : {}", dto);
        HrDocument hrDocument = hrDocumentMapper.toEntity(dto);
        hrDocument = hrDocumentRepository.save(hrDocument);
        return hrDocumentMapper.toDto(hrDocument);
    }

    public Optional<HrDocumentDTO> partialUpdate(HrDocumentDTO dto) {
        return hrDocumentRepository
            .findById(dto.getId())
            .map(existing -> {
                hrDocumentMapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(hrDocumentRepository::save)
            .map(hrDocumentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<HrDocumentDTO> findAll(org.springframework.data.domain.Pageable pageable) {
        LOG.debug("Request to get all HrDocuments");
        return hrDocumentRepository.findAll(pageable).map(hrDocumentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<HrDocumentDTO> findByEmployee(Long employeeId) {
        return hrDocumentRepository
            .findByEmployeeIdAndActiveTrue(employeeId)
            .stream()
            .map(hrDocumentMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<HrDocumentDTO> findOne(Long id) {
        return hrDocumentRepository.findById(id).map(hrDocumentMapper::toDto);
    }

    // Archiver (soft delete)
    public void delete(Long id) {
        hrDocumentRepository
            .findById(id)
            .ifPresent(doc -> {
                doc.setActive(false);
                hrDocumentRepository.save(doc);
            });
    }
}
