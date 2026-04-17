package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Department;
import tn.paiezone.rh.repository.DepartmentRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.service.dto.DepartmentDTO;
import tn.paiezone.rh.service.mapper.DepartmentMapper;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@Service
@Transactional
public class DepartmentService {

    private static final Logger LOG = LoggerFactory.getLogger(DepartmentService.class);
    private static final String ENTITY_NAME = "department";

    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(
        DepartmentRepository departmentRepository,
        DepartmentMapper departmentMapper,
        EmployeeRepository employeeRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
        this.employeeRepository = employeeRepository;
    }

    // ── US-S1-11 : Créer un département ──────────────────────────────────────
    public DepartmentDTO save(DepartmentDTO dto) {
        LOG.debug("Request to save Department : {}", dto);

        // Vérifier unicité du code dans la company
        if (dto.getCompany() != null && departmentRepository.existsByCodeAndCompanyId(dto.getCode(), dto.getCompany().getId())) {
            throw new BadRequestAlertException(
                "Un département avec le code '" + dto.getCode() + "' existe déjà dans cette entreprise.",
                ENTITY_NAME,
                "codeExists"
            );
        }

        Department department = departmentMapper.toEntity(dto);
        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    public DepartmentDTO update(DepartmentDTO dto) {
        LOG.debug("Request to update Department : {}", dto);

        Department existing = departmentRepository
            .findById(dto.getId())
            .orElseThrow(() -> new BadRequestAlertException("Département introuvable.", ENTITY_NAME, "idnotfound"));

        // Vérifier unicité code si changé
        if (
            !existing.getCode().equals(dto.getCode()) &&
            dto.getCompany() != null &&
            departmentRepository.existsByCodeAndCompanyId(dto.getCode(), dto.getCompany().getId())
        ) {
            throw new BadRequestAlertException(
                "Un département avec le code '" + dto.getCode() + "' existe déjà.",
                ENTITY_NAME,
                "codeExists"
            );
        }

        Department department = departmentMapper.toEntity(dto);
        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    public Optional<DepartmentDTO> partialUpdate(DepartmentDTO dto) {
        LOG.debug("Request to partially update Department : {}", dto);
        return departmentRepository
            .findById(dto.getId())
            .map(existing -> {
                departmentMapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(departmentRepository::save)
            .map(departmentMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<DepartmentDTO> findAll() {
        LOG.debug("Request to get all Departments");
        return departmentRepository.findAll().stream().map(departmentMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public List<DepartmentDTO> findByCompany(Long companyId) {
        LOG.debug("Request to get Departments by Company : {}", companyId);
        return departmentRepository
            .findByCompanyId(companyId)
            .stream()
            .map(departmentMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<DepartmentDTO> findOne(Long id) {
        LOG.debug("Request to get Department : {}", id);
        return departmentRepository.findById(id).map(departmentMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete Department : {}", id);

        // Vérifier s'il y a des employés dans ce département
        long count = employeeRepository.countByDepartmentId(id);
        if (count > 0) {
            throw new BadRequestAlertException(
                "Impossible de supprimer ce département : " + count + " employé(s) y sont affectés.",
                ENTITY_NAME,
                "hasEmployees"
            );
        }

        departmentRepository.deleteById(id);
    }
}
