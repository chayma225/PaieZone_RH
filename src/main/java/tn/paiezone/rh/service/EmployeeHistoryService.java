package tn.paiezone.rh.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.repository.EmployeeHistoryRepository;
import tn.paiezone.rh.service.dto.EmployeeHistoryDTO;
import tn.paiezone.rh.service.mapper.EmployeeHistoryMapper;

@Service
@Transactional(readOnly = true)
public class EmployeeHistoryService {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeHistoryService.class);

    private final EmployeeHistoryRepository employeeHistoryRepository;
    private final EmployeeHistoryMapper employeeHistoryMapper;

    public EmployeeHistoryService(EmployeeHistoryRepository employeeHistoryRepository, EmployeeHistoryMapper employeeHistoryMapper) {
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.employeeHistoryMapper = employeeHistoryMapper;
    }

    // ── Historique d'un employé ───────────────────────────────────────────────
    public Page<EmployeeHistoryDTO> findByEmployee(Long employeeId, Pageable pageable) {
        LOG.debug("Request to get history for Employee : {}", employeeId);
        return employeeHistoryRepository.findByEmployeeIdOrderByChangedAtDesc(employeeId, pageable).map(employeeHistoryMapper::toDto);
    }

    // ── Tous les historiques avec filtres ────────────────────────────────────
    public Page<EmployeeHistoryDTO> findWithFilters(
        String firstName,
        String lastName,
        Long departmentId,
        Long positionId,
        String fieldName,
        Pageable pageable
    ) {
        LOG.debug("Request to get EmployeeHistories with filters");

        // Convertir les chaînes vides en null pour la requête
        String fn = (firstName == null || firstName.isBlank()) ? null : firstName.trim();
        String ln = (lastName == null || lastName.isBlank()) ? null : lastName.trim();
        String field = (fieldName == null || fieldName.isBlank()) ? null : fieldName.trim();

        return employeeHistoryRepository
            .findWithFilters(fn, ln, departmentId, positionId, field, pageable)
            .map(employeeHistoryMapper::toDto);
    }

    // ── Tous sans filtre ──────────────────────────────────────────────────────
    public Page<EmployeeHistoryDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all EmployeeHistories");
        return employeeHistoryRepository.findAll(pageable).map(employeeHistoryMapper::toDto);
    }
}
