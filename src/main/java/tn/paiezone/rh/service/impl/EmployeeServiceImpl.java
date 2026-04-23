package tn.paiezone.rh.service.impl;

import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Authority;
import tn.paiezone.rh.domain.Employee;
import tn.paiezone.rh.domain.EmployeeHistory;
import tn.paiezone.rh.domain.User;
import tn.paiezone.rh.repository.EmployeeHistoryRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.UserRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.MailService;
import tn.paiezone.rh.service.UserService;
import tn.paiezone.rh.service.dto.AdminUserDTO;
import tn.paiezone.rh.service.dto.EmployeeDTO;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.service.mapper.EmployeeMapper;

@Service
@Transactional
public class EmployeeServiceImpl implements tn.paiezone.rh.service.EmployeeService {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeServiceImpl.class);
    private static final String ENTITY_NAME = "employee";

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;
    private final EmployeeHistoryRepository employeeHistoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final MailService mailService;

    public EmployeeServiceImpl(
        EmployeeRepository employeeRepository,
        EmployeeMapper employeeMapper,
        EmployeeHistoryRepository employeeHistoryRepository,
        UserRepository userRepository,
        UserService userService,
        MailService mailService
    ) {
        this.employeeRepository = employeeRepository;
        this.employeeMapper = employeeMapper;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.mailService = mailService;
    }

    // ── US-09 : Créer un dossier employé ─────────────────────────────────────
    @Override
    public EmployeeDTO save(EmployeeDTO dto) {
        LOG.debug("Request to save Employee : {}", dto);

        // 1. Vérifier unicité matricule
        if (employeeRepository.existsByMatricule(dto.getMatricule())) {
            throw new BusinessException(
                "Un employé avec le matricule '" + dto.getMatricule() + "' existe déjà.",
                ENTITY_NAME,
                "matriculeExists"
            );
        }

        // 2. Vérifier unicité CIN (nationalId)
        if (employeeRepository.existsByNationalId(dto.getNationalId())) {
            throw new BusinessException(
                "Un employé avec le CIN '" + dto.getNationalId() + "' existe déjà.",
                ENTITY_NAME,
                "nationalIdExists"
            );
        }

        // 3. Vérifier email professionnel unique
        if (dto.getProfessionalEmail() != null && employeeRepository.existsByProfessionalEmail(dto.getProfessionalEmail())) {
            throw new BusinessException(
                "Un employé avec l'email '" + dto.getProfessionalEmail() + "' existe déjà.",
                ENTITY_NAME,
                "emailExists"
            );
        }

        // 4. Forcer createdAt
        dto.setCreatedAt(Instant.now());

        // 5. Sauvegarder l'employé
        Employee employee = employeeMapper.toEntity(dto);
        employee = employeeRepository.save(employee);

        // 6. Créer automatiquement le compte utilisateur JHipster associé
        if (dto.getProfessionalEmail() != null) {
            createUserAccountForEmployee(employee);
        }

        return employeeMapper.toDto(employee);
    }

    // ── US-10 : Modifier un dossier employé ──────────────────────────────────
    @Override
    public EmployeeDTO update(EmployeeDTO dto) {
        LOG.debug("Request to update Employee : {}", dto);

        Employee existing = employeeRepository
            .findById(dto.getId())
            .orElseThrow(() -> new BusinessException("Employé introuvable.", ENTITY_NAME, "idnotfound"));

        // Vérifier unicité matricule si changé
        if (!existing.getMatricule().equals(dto.getMatricule()) && employeeRepository.existsByMatricule(dto.getMatricule())) {
            throw new BusinessException(
                "Un employé avec le matricule '" + dto.getMatricule() + "' existe déjà.",
                ENTITY_NAME,
                "matriculeExists"
            );
        }

        // Vérifier unicité CIN si changé
        if (!existing.getNationalId().equals(dto.getNationalId()) && employeeRepository.existsByNationalId(dto.getNationalId())) {
            throw new BusinessException(
                "Un employé avec le CIN '" + dto.getNationalId() + "' existe déjà.",
                ENTITY_NAME,
                "nationalIdExists"
            );
        }

        // Enregistrer les modifications dans l'historique
        recordHistory(existing, dto);

        // Conserver createdAt original
        dto.setCreatedAt(existing.getCreatedAt());
        dto.setUpdatedAt(Instant.now());

        Employee employee = employeeMapper.toEntity(dto);
        employee = employeeRepository.save(employee);
        return employeeMapper.toDto(employee);
    }

    @Override
    public Optional<EmployeeDTO> partialUpdate(EmployeeDTO dto) {
        LOG.debug("Request to partially update Employee : {}", dto);
        return employeeRepository
            .findById(dto.getId())
            .map(existing -> {
                employeeMapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(employeeRepository::save)
            .map(employeeMapper::toDto);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<EmployeeDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all Employees");
        return employeeRepository.findAll(pageable).map(employeeMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeDTO> findOne(Long id) {
        LOG.debug("Request to get Employee : {}", id);
        return employeeRepository.findById(id).map(employeeMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        LOG.debug("Request to delete Employee : {}", id);
        // Désactiver au lieu de supprimer
        employeeRepository
            .findById(id)
            .ifPresent(employee -> {
                employee.setActive(false);
                employee.setUpdatedAt(Instant.now());
                employeeRepository.save(employee);
            });
    }

    // ── Créer compte utilisateur pour l'employé ───────────────────────────────
    private void createUserAccountForEmployee(Employee employee) {
        try {
            String login = employee.getMatricule().toLowerCase().replaceAll("[^a-z0-9]", "");

            if (userRepository.findOneByLogin(login).isPresent()) {
                login = login + "_" + employee.getId();
            }

            AdminUserDTO userDTO = new AdminUserDTO();
            userDTO.setLogin(login);
            userDTO.setFirstName(employee.getFirstName());
            userDTO.setLastName(employee.getLastName());
            userDTO.setEmail(employee.getProfessionalEmail());
            userDTO.setLangKey("fr");
            userDTO.setActivated(true);

            String tempPassword = "Temp@" + employee.getMatricule();
            User user = userService.createUser(userDTO);

            // Ajouter rôle EMPLOYE
            Authority authority = new Authority();
            authority.setName(AuthoritiesConstants.EMPLOYE);
            user.getAuthorities().add(authority);
            userRepository.save(user);

            // Envoyer email de bienvenue
            mailService.sendCreationEmail(user);

            LOG.debug("Compte utilisateur créé pour l'employé : {}", employee.getMatricule());
        } catch (Exception e) {
            LOG.warn("Impossible de créer le compte utilisateur pour l'employé {} : {}", employee.getMatricule(), e.getMessage());
        }
    }

    // ── Enregistrer historique des modifications ──────────────────────────────
    private void recordHistory(Employee existing, EmployeeDTO dto) {
        String changedBy = SecurityUtils.getCurrentUserLogin().orElse("system");

        checkAndRecord(existing.getId(), "firstName", existing.getFirstName(), dto.getFirstName(), changedBy);
        checkAndRecord(existing.getId(), "lastName", existing.getLastName(), dto.getLastName(), changedBy);
        checkAndRecord(
            existing.getId(),
            "department",
            existing.getDepartment() != null ? existing.getDepartment().getId().toString() : null,
            dto.getDepartment() != null ? dto.getDepartment().getId().toString() : null,
            changedBy
        );
        checkAndRecord(
            existing.getId(),
            "position",
            existing.getPosition() != null ? existing.getPosition().getId().toString() : null,
            dto.getPosition() != null ? dto.getPosition().getId().toString() : null,
            changedBy
        );
        checkAndRecord(existing.getId(), "active", String.valueOf(existing.getActive()), String.valueOf(dto.getActive()), changedBy);
        checkAndRecord(
            existing.getId(),
            "category",
            existing.getCategory() != null ? existing.getCategory().toString() : null,
            dto.getCategory() != null ? dto.getCategory().toString() : null,
            changedBy
        );
    }

    private void checkAndRecord(Long employeeId, String field, String oldVal, String newVal, String changedBy) {
        if (!java.util.Objects.equals(oldVal, newVal)) {
            EmployeeHistory history = new EmployeeHistory();
            history.setFieldName(field);
            history.setOldValue(oldVal);
            history.setNewValue(newVal);
            history.setChangedAt(Instant.now());
            history.setChangedBy(changedBy);
            history.setReason("Modification via interface");

            Employee emp = new Employee();
            emp.setId(employeeId);
            history.setEmployee(emp);

            employeeHistoryRepository.save(history);
        }
    }
}
