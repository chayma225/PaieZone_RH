package tn.paiezone.rh.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.CompanySubscription;
import tn.paiezone.rh.domain.enumeration.PlanType;
import tn.paiezone.rh.repository.CompanySubscriptionRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.service.mapper.CompanySubscriptionMapper;

@Service
@Transactional
public class CompanySubscriptionService {

    private static final Logger LOG = LoggerFactory.getLogger(CompanySubscriptionService.class);
    private static final String ENTITY_NAME = "companySubscription";

    private final CompanySubscriptionRepository companySubscriptionRepository;
    private final CompanySubscriptionMapper companySubscriptionMapper;
    private final EmployeeRepository employeeRepository; // ← ajouté

    public CompanySubscriptionService(
        CompanySubscriptionRepository companySubscriptionRepository,
        CompanySubscriptionMapper companySubscriptionMapper,
        EmployeeRepository employeeRepository // ← ajouté
    ) {
        this.companySubscriptionRepository = companySubscriptionRepository;
        this.companySubscriptionMapper = companySubscriptionMapper;
        this.employeeRepository = employeeRepository; // ← ajouté
    }

    // ── US-S1-03 : Créer un abonnement ───────────────────────────────────────
    public CompanySubscriptionDTO save(CompanySubscriptionDTO dto) {
        LOG.debug("Request to save CompanySubscription : {}", dto);

        // Valider maxEmployees selon le plan
        validateMaxEmployees(dto.getPlan(), dto.getMaxEmployees());

        CompanySubscription entity = companySubscriptionMapper.toEntity(dto);
        entity = companySubscriptionRepository.save(entity);
        return companySubscriptionMapper.toDto(entity);
    }

    // ── US-S1-04 : Changer le plan ────────────────────────────────────────────
    public CompanySubscriptionDTO update(CompanySubscriptionDTO dto) {
        LOG.debug("Request to update CompanySubscription : {}", dto);

        // Récupérer l'abonnement actuel
        CompanySubscription existing = companySubscriptionRepository
            .findById(dto.getId())
            .orElseThrow(() -> new BusinessException("Abonnement introuvable", ENTITY_NAME, "idnotfound"));

        // Valider maxEmployees selon le nouveau plan
        validateMaxEmployees(dto.getPlan(), dto.getMaxEmployees());

        // Vérifier que le nouveau plan supporte le nombre d'employés actifs
        if (existing.getCompany() != null) {
            long activeEmployees = employeeRepository.countByCompanyIdAndActiveTrue(existing.getCompany().getId());

            if (dto.getMaxEmployees() < activeEmployees) {
                throw new BusinessException(
                    "Impossible de réduire la limite : " +
                        activeEmployees +
                        " employés actifs dépassent la nouvelle limite de " +
                        dto.getMaxEmployees(),
                    ENTITY_NAME,
                    "maxEmployeesExceeded"
                );
            }
        }

        CompanySubscription entity = companySubscriptionMapper.toEntity(dto);
        entity = companySubscriptionRepository.save(entity);
        return companySubscriptionMapper.toDto(entity);
    }

    public Optional<CompanySubscriptionDTO> partialUpdate(CompanySubscriptionDTO dto) {
        LOG.debug("Request to partially update CompanySubscription : {}", dto);
        return companySubscriptionRepository
            .findById(dto.getId())
            .map(existing -> {
                companySubscriptionMapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(companySubscriptionRepository::save)
            .map(companySubscriptionMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<CompanySubscriptionDTO> findAll() {
        LOG.debug("Request to get all CompanySubscriptions");
        return companySubscriptionRepository
            .findAll()
            .stream()
            .map(companySubscriptionMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public List<CompanySubscriptionDTO> findAllWhereCompanyIsNull() {
        LOG.debug("Request to get all companySubscriptions where Company is null");
        return StreamSupport.stream(companySubscriptionRepository.findAll().spliterator(), false)
            .filter(sub -> sub.getCompany() == null)
            .map(companySubscriptionMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    @Transactional(readOnly = true)
    public Optional<CompanySubscriptionDTO> findOne(Long id) {
        LOG.debug("Request to get CompanySubscription : {}", id);
        return companySubscriptionRepository.findById(id).map(companySubscriptionMapper::toDto);
    }

    public void delete(Long id) {
        LOG.debug("Request to delete CompanySubscription : {}", id);
        companySubscriptionRepository.deleteById(id);
    }

    // ── Validation plan ↔ maxEmployees ────────────────────────────────────────
    private void validateMaxEmployees(PlanType plan, Integer maxEmployees) {
        if (plan == null || maxEmployees == null) return;

        int min = getMinEmployees(plan);
        int max = getMaxEmployees(plan);

        if (maxEmployees < min || maxEmployees > max) {
            throw new BusinessException(
                "Le plan " +
                    plan.name() +
                    " accepte entre " +
                    min +
                    " et " +
                    max +
                    " employés maximum. Vous avez saisi : " +
                    maxEmployees +
                    ". Veuillez corriger la valeur.",
                ENTITY_NAME,
                "invalidMaxEmployees"
            );
        }
    }

    private int getMinEmployees(PlanType plan) {
        return switch (plan) {
            case STARTER -> 1;
            case PME -> 11;
            case BUSINESS -> 41;
            case ENTERPRISE -> 141;
            case CUSTOM -> 501;
        };
    }

    private int getMaxEmployees(PlanType plan) {
        return switch (plan) {
            case STARTER -> 10;
            case PME -> 40;
            case BUSINESS -> 140;
            case ENTERPRISE -> 500;
            case CUSTOM -> Integer.MAX_VALUE; // 500+
        };
    }
}
