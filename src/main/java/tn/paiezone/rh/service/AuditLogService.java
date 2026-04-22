package tn.paiezone.rh.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AuditLog;
import tn.paiezone.rh.repository.AuditLogRepository;
import tn.paiezone.rh.service.dto.AuditLogDTO;
import tn.paiezone.rh.service.mapper.AuditLogMapper;

/**
 * Service Implementation pour la gestion des logs d'audit {@link AuditLog}.
 * Cette classe gère les opérations CRUD standard via des DTO.
 */
@Service
@Transactional
public class AuditLogService {

    private static final Logger LOG = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public AuditLogService(AuditLogRepository auditLogRepository, AuditLogMapper auditLogMapper) {
        this.auditLogRepository = auditLogRepository;
        this.auditLogMapper = auditLogMapper;
    }

    /**
     * Enregistre un nouveau log d'audit.
     *
     * @param auditLogDTO l'entité à enregistrer.
     * @return l'entité persistée.
     */
    public AuditLogDTO save(AuditLogDTO auditLogDTO) {
        LOG.debug("Requête pour enregistrer un AuditLog : {}", auditLogDTO);
        AuditLog auditLog = auditLogMapper.toEntity(auditLogDTO);
        auditLog = auditLogRepository.save(auditLog);
        return auditLogMapper.toDto(auditLog);
    }

    /**
     * Met à jour un log d'audit existant.
     *
     * @param auditLogDTO l'entité à mettre à jour.
     * @return l'entité persistée.
     */
    public AuditLogDTO update(AuditLogDTO auditLogDTO) {
        LOG.debug("Requête pour mettre à jour l'AuditLog : {}", auditLogDTO);
        AuditLog auditLog = auditLogMapper.toEntity(auditLogDTO);
        auditLog = auditLogRepository.save(auditLog);
        return auditLogMapper.toDto(auditLog);
    }

    /**
     * Met à jour partiellement un log d'audit.
     *
     * @param auditLogDTO l'entité à modifier.
     * @return l'entité persistée enveloppée dans un Optional.
     */
    public Optional<AuditLogDTO> partialUpdate(AuditLogDTO auditLogDTO) {
        LOG.debug("Requête pour une mise à jour partielle de l'AuditLog : {}", auditLogDTO);

        return auditLogRepository
            .findById(auditLogDTO.getId())
            .map(existingAuditLog -> {
                auditLogMapper.partialUpdate(existingAuditLog, auditLogDTO);
                return existingAuditLog;
            })
            .map(auditLogRepository::save)
            .map(auditLogMapper::toDto);
    }

    /**
     * Récupère tous les logs d'audit avec pagination.
     *
     * @param pageable les informations de pagination.
     * @return la liste des entités sous forme de page.
     */
    @Transactional(readOnly = true)
    public Page<AuditLogDTO> findAll(Pageable pageable) {
        LOG.debug("Requête pour récupérer tous les AuditLogs");
        return auditLogRepository.findAll(pageable).map(auditLogMapper::toDto);
    }

    /**
     * Récupère un log d'audit par son ID.
     *
     * @param id l'ID de l'entité.
     * @return l'entité enveloppée dans un Optional.
     */
    @Transactional(readOnly = true)
    public Optional<AuditLogDTO> findOne(Long id) {
        LOG.debug("Requête pour récupérer l'AuditLog : {}", id);
        return auditLogRepository.findById(id).map(auditLogMapper::toDto);
    }

    /**
     * Supprime un log d'audit par son ID.
     *
     * @param id l'ID de l'entité.
     */
    public void delete(Long id) {
        LOG.debug("Requête pour supprimer l'AuditLog : {}", id);
        auditLogRepository.deleteById(id);
    }
}
