package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.JobPosition;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.JobPositionRepository;
import tn.paiezone.rh.service.dto.JobPositionDTO;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.service.mapper.JobPositionMapper;

@Service
@Transactional
public class JobPositionService {

    private static final Logger LOG = LoggerFactory.getLogger(JobPositionService.class);
    private static final String ENTITY_NAME = "jobPosition";

    private final JobPositionRepository jobPositionRepository;
    private final JobPositionMapper jobPositionMapper;
    private final EmployeeRepository employeeRepository;

    public JobPositionService(
        JobPositionRepository jobPositionRepository,
        JobPositionMapper jobPositionMapper,
        EmployeeRepository employeeRepository
    ) {
        this.jobPositionRepository = jobPositionRepository;
        this.jobPositionMapper = jobPositionMapper;
        this.employeeRepository = employeeRepository;
    }

    // ── US-S1-12 : Créer un poste ─────────────────────────────────────────────
    public JobPositionDTO save(JobPositionDTO dto) {
        LOG.debug("Request to save JobPosition : {}", dto);

        // Valider la grille salariale
        validateSalaryGrid(dto);

        JobPosition jobPosition = jobPositionMapper.toEntity(dto);
        jobPosition = jobPositionRepository.save(jobPosition);
        return jobPositionMapper.toDto(jobPosition);
    }

    public JobPositionDTO update(JobPositionDTO dto) {
        LOG.debug("Request to update JobPosition : {}", dto);

        if (!jobPositionRepository.existsById(dto.getId())) {
            throw new BusinessException("Poste introuvable.", ENTITY_NAME, "idnotfound");
        }

        validateSalaryGrid(dto);

        JobPosition jobPosition = jobPositionMapper.toEntity(dto);
        jobPosition = jobPositionRepository.save(jobPosition);
        return jobPositionMapper.toDto(jobPosition);
    }

    public Optional<JobPositionDTO> partialUpdate(JobPositionDTO dto) {
        LOG.debug("Request to partially update JobPosition : {}", dto);
        return jobPositionRepository
            .findById(dto.getId())
            .map(existing -> {
                jobPositionMapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(jobPositionRepository::save)
            .map(jobPositionMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<JobPositionDTO> findAll() {
        LOG.debug("Request to get all JobPositions");
        return jobPositionRepository.findAll().stream().map(jobPositionMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public List<JobPositionDTO> findByCompany(Long companyId) {
        return jobPositionRepository
            .findByCompanyId(companyId)
            .stream()
            .map(jobPositionMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<JobPositionDTO> findOne(Long id) {
        LOG.debug("Request to get JobPosition : {}", id);
        return jobPositionRepository.findById(id).map(jobPositionMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete JobPosition : {}", id);

        long count = employeeRepository.countByPositionId(id);
        if (count > 0) {
            throw new BusinessException(
                "Impossible de supprimer ce poste : " + count + " employé(s) y sont affectés.",
                ENTITY_NAME,
                "hasEmployees"
            );
        }

        jobPositionRepository.deleteById(id);
    }

    // ── Validation grille salariale ───────────────────────────────────────────
    private void validateSalaryGrid(JobPositionDTO dto) {
        if (dto.getMinSalary() != null && dto.getMaxSalary() != null) {
            if (dto.getMinSalary().compareTo(dto.getMaxSalary()) > 0) {
                throw new BusinessException(
                    "Le salaire minimum (" +
                        dto.getMinSalary() +
                        " TND) ne peut pas être supérieur au salaire maximum (" +
                        dto.getMaxSalary() +
                        " TND).",
                    ENTITY_NAME,
                    "invalidSalaryGrid"
                );
            }
            if (dto.getMinSalary().doubleValue() < 0) {
                throw new BusinessException("Le salaire minimum ne peut pas être négatif.", ENTITY_NAME, "negativeSalary");
            }
        }
    }
}
