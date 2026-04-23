package tn.paiezone.rh.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.domain.enumeration.ContractType;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.service.ContractService;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.service.mapper.ContractMapper;

/**
 * Implémentation du service de gestion des contrats
 * Conforme à la Loi de Finances 2026 Tunisie (LF n°17-2025)
 */
@Service
@Transactional
public class ContractServiceImpl implements ContractService {

    private static final Logger LOG = LoggerFactory.getLogger(ContractServiceImpl.class);
    private static final String ENTITY_NAME = "contract";

    // ── Constantes LF 2026 Tunisie ────────────────────────────────────────────
    /** SMIG mensuel 48h - LF 2026 */
    private static final BigDecimal SMIG_48H = new BigDecimal("524.954");

    /** SMIG mensuel 40h - LF 2026 */
    private static final BigDecimal SMIG_40H = new BigDecimal("447.540");

    /** Gratification minimale stage (50% SMIG 48h) */
    private static final BigDecimal STAGE_MIN = new BigDecimal("262.477");

    /** Salaire minimum intérim (SMIG + 10% précarité) */
    private static final BigDecimal INTERIM_MIN = SMIG_48H.multiply(new BigDecimal("1.10"));

    private final ContractRepository contractRepository;
    private final ContractMapper contractMapper;

    public ContractServiceImpl(ContractRepository contractRepository, ContractMapper contractMapper) {
        this.contractRepository = contractRepository;
        this.contractMapper = contractMapper;
    }

    // ── Créer un contrat ──────────────────────────────────────────────────────
    @Override
    public ContractDTO save(ContractDTO dto) {
        LOG.debug("Request to save Contract : {}", dto);

        // 1. Vérifier unicité référence
        if (contractRepository.existsByReference(dto.getReference())) {
            throw new BusinessException(
                "Un contrat avec la référence '" + dto.getReference() + "' existe déjà.",
                ENTITY_NAME,
                "referenceExists"
            );
        }

        // 2. Valider selon la LF 2026
        validateContractLF2026(dto);

        dto.setCreatedAt(Instant.now());
        dto.setStatus(ContractStatus.DRAFT);

        Contract contract = contractMapper.toEntity(dto);
        contract = contractRepository.save(contract);
        return contractMapper.toDto(contract);
    }

    // ── Modifier un contrat ───────────────────────────────────────────────────
    @Override
    public ContractDTO update(ContractDTO dto) {
        LOG.debug("Request to update Contract : {}", dto);

        Contract existing = contractRepository
            .findById(dto.getId())
            .orElseThrow(() -> new BusinessException("Contrat introuvable.", ENTITY_NAME, "idnotfound"));

        if (ContractStatus.TERMINATED.equals(existing.getStatus()) || ContractStatus.EXPIRED.equals(existing.getStatus())) {
            throw new BusinessException("Impossible de modifier un contrat terminé ou expiré.", ENTITY_NAME, "contractClosed");
        }

        if (!existing.getReference().equals(dto.getReference()) && contractRepository.existsByReference(dto.getReference())) {
            throw new BusinessException(
                "Un contrat avec la référence '" + dto.getReference() + "' existe déjà.",
                ENTITY_NAME,
                "referenceExists"
            );
        }

        validateContractLF2026(dto);
        dto.setCreatedAt(existing.getCreatedAt());

        Contract contract = contractMapper.toEntity(dto);
        contract = contractRepository.save(contract);
        return contractMapper.toDto(contract);
    }

    @Override
    public Optional<ContractDTO> partialUpdate(ContractDTO dto) {
        return contractRepository
            .findById(dto.getId())
            .map(existing -> {
                contractMapper.partialUpdate(existing, dto);
                return existing;
            })
            .map(contractRepository::save)
            .map(contractMapper::toDto);
    }

    // ── Activer un contrat (DRAFT → ACTIVE) ───────────────────────────────────
    public ContractDTO activate(Long id) {
        Contract contract = contractRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("Contrat introuvable.", ENTITY_NAME, "idnotfound"));
        if (!ContractStatus.DRAFT.equals(contract.getStatus())) {
            throw new BusinessException("Seul un contrat en brouillon peut être activé.", ENTITY_NAME, "invalidStatus");
        }
        contract.setStatus(ContractStatus.ACTIVE);
        return contractMapper.toDto(contractRepository.save(contract));
    }

    // ── Terminer un contrat ───────────────────────────────────────────────────
    public ContractDTO terminate(Long id) {
        Contract contract = contractRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("Contrat introuvable.", ENTITY_NAME, "idnotfound"));
        if (!ContractStatus.ACTIVE.equals(contract.getStatus()) && !ContractStatus.SUSPENDED.equals(contract.getStatus())) {
            throw new BusinessException("Seul un contrat actif ou suspendu peut être terminé.", ENTITY_NAME, "invalidStatus");
        }
        contract.setStatus(ContractStatus.TERMINATED);
        contract.setEndDate(LocalDate.now());
        return contractMapper.toDto(contractRepository.save(contract));
    }

    // ── Renouveler un CDD ─────────────────────────────────────────────────────
    public ContractDTO renew(Long id, LocalDate newEndDate) {
        Contract contract = contractRepository
            .findById(id)
            .orElseThrow(() -> new BusinessException("Contrat introuvable.", ENTITY_NAME, "idnotfound"));

        if (!ContractType.CDD.equals(contract.getContractType())) {
            throw new BusinessException("Seul un CDD peut être renouvelé.", ENTITY_NAME, "notCDD");
        }

        // LF 2026 : max 2 renouvellements → sinon CDI automatique
        int currentRenewals = contract.getRenewalCount() != null ? contract.getRenewalCount() : 0;
        if (currentRenewals >= 2) {
            throw new BusinessException(
                "⚠️ Ce CDD a atteint le nombre maximum de renouvellements (2). " +
                    "Conformément à la Loi de Finances 2026, ce contrat doit être " +
                    "transformé en CDI automatiquement.",
                ENTITY_NAME,
                "maxRenewalsReached"
            );
        }

        contract.setEndDate(newEndDate);
        contract.setRenewalCount(currentRenewals + 1);
        return contractMapper.toDto(contractRepository.save(contract));
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ContractDTO> findAll(Pageable pageable) {
        return contractRepository.findAll(pageable).map(contractMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ContractDTO> findOne(Long id) {
        return contractRepository.findById(id).map(contractMapper::toDto);
    }

    @Override
    public void delete(Long id) {
        contractRepository.deleteById(id);
    }

    // =========================================================================
    // VALIDATION CONFORME LF 2026 TUNISIE
    // =========================================================================

    private void validateContractLF2026(ContractDTO dto) {
        if (dto.getContractType() == null) return;

        // Validation communes
        validateDates(dto);

        switch (dto.getContractType()) {
            case CDI -> validateCDI(dto);
            case CDD -> validateCDD(dto);
            case CIVP -> validateCIVP(dto);
            case KARAMA -> validateKARAMA(dto);
            case INTERIMAIRE -> validateInterim(dto);
            case STAGE -> validateStage(dto);
            default -> validateSalaryMinimum(dto, SMIG_48H, dto.getContractType().name());
        }
    }

    /**
     * CDI — Contrat à Durée Indéterminée (LF 2026)
     * - Salaire ≥ SMIG 48h (524.954 TND)
     * - Pas de date de fin
     * - Période essai max 6 mois + 1 renouvellement (12 mois total)
     */
    private void validateCDI(ContractDTO dto) {
        // Pas de date de fin pour un CDI
        if (dto.getEndDate() != null) {
            throw new BusinessException(
                "❌ LF 2026 — Un CDI ne peut pas avoir de date de fin. " + "Pour un contrat limité dans le temps, utilisez un CDD.",
                ENTITY_NAME,
                "cdiWithEndDate"
            );
        }

        // Salaire minimum SMIG
        validateSalaryMinimum(dto, SMIG_48H, "CDI");

        // Période d'essai max 6 mois (12 mois avec renouvellement)
        if (dto.getTrialPeriodMonths() != null && dto.getTrialPeriodMonths() > 12) {
            throw new BusinessException(
                "❌ LF 2026 — La période d'essai d'un CDI ne peut pas dépasser 12 mois " + "(6 mois + 1 renouvellement de 6 mois maximum).",
                ENTITY_NAME,
                "trialPeriodTooLong"
            );
        }

        LOG.debug("✅ CDI validé — Salaire: {} TND, Essai: {} mois", dto.getBaseSalary(), dto.getTrialPeriodMonths());
    }

    /**
     * CDD — Contrat à Durée Déterminée (LF 2026)
     * - Salaire ≥ SMIG 48h
     * - Date de fin obligatoire
     * - Période d'essai max 3 mois (non renouvelable)
     * - Max 2 renouvellements → sinon CDI automatique
     * - Seulement pour : remplacement, surcroît activité, travaux saisonniers
     */
    private void validateCDD(ContractDTO dto) {
        // Date de fin obligatoire
        if (dto.getEndDate() == null) {
            throw new BusinessException(
                "❌ LF 2026 — Un CDD doit obligatoirement avoir une date de fin.",
                ENTITY_NAME,
                "cddWithoutEndDate"
            );
        }

        // Salaire minimum
        validateSalaryMinimum(dto, SMIG_48H, "CDD");

        // Période d'essai max 3 mois pour CDD
        if (dto.getTrialPeriodMonths() != null && dto.getTrialPeriodMonths() > 3) {
            throw new BusinessException(
                "❌ LF 2026 — La période d'essai d'un CDD ne peut pas dépasser 3 mois.",
                ENTITY_NAME,
                "trialPeriodTooLong"
            );
        }

        // Vérifier durée raisonnable
        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            long months = ChronoUnit.MONTHS.between(dto.getStartDate(), dto.getEndDate());
            if (months > 48) {
                throw new BusinessException(
                    "❌ LF 2026 — Un CDD ne peut pas dépasser 48 mois (4 ans) au total.",
                    ENTITY_NAME,
                    "cddTooLong"
                );
            }
        }

        LOG.debug("✅ CDD validé — Fin: {}, Essai: {} mois", dto.getEndDate(), dto.getTrialPeriodMonths());
    }

    /**
     * CIVP — Contrat d'Insertion à la Vie Professionnelle (LF 2026)
     * - Durée : 24 mois max
     * - Salaire ≥ SMIG + Aide État 200 TND/mois
     * - Période d'essai max 3 mois
     * - Éligible : primo-demandeurs d'emploi
     */
    private void validateCIVP(ContractDTO dto) {
        if (dto.getEndDate() == null) {
            throw new BusinessException(
                "❌ LF 2026 — Un CIVP doit avoir une date de fin (durée max 24 mois).",
                ENTITY_NAME,
                "civpWithoutEndDate"
            );
        }

        // Durée max 24 mois
        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            long months = ChronoUnit.MONTHS.between(dto.getStartDate(), dto.getEndDate());
            if (months > 24) {
                throw new BusinessException(
                    "❌ LF 2026 — Un CIVP ne peut pas dépasser 24 mois. " + "Durée saisie : " + months + " mois.",
                    ENTITY_NAME,
                    "civpTooLong"
                );
            }
        }

        validateSalaryMinimum(dto, SMIG_48H, "CIVP");

        if (dto.getTrialPeriodMonths() != null && dto.getTrialPeriodMonths() > 3) {
            throw new BusinessException(
                "❌ LF 2026 — La période d'essai d'un CIVP ne peut pas dépasser 3 mois.",
                ENTITY_NAME,
                "trialPeriodTooLong"
            );
        }

        LOG.debug("✅ CIVP validé — Aide État: 200 TND/mois pendant 24 mois max");
    }

    /**
     * KARAMA — Contrat pour chômeurs longue durée (LF 2026)
     * - Durée : 36 mois max
     * - Aide État : 200 TND/mois
     * - CNSS prise en charge par ANETI
     * - Pour chômeurs > 1 an sans emploi
     */
    private void validateKARAMA(ContractDTO dto) {
        if (dto.getEndDate() == null) {
            throw new BusinessException(
                "❌ LF 2026 — Un contrat KARAMA doit avoir une date de fin (durée max 36 mois).",
                ENTITY_NAME,
                "karamaWithoutEndDate"
            );
        }

        // Durée max 36 mois
        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            long months = ChronoUnit.MONTHS.between(dto.getStartDate(), dto.getEndDate());
            if (months > 36) {
                throw new BusinessException(
                    "❌ LF 2026 — Un contrat KARAMA ne peut pas dépasser 36 mois. " + "Durée saisie : " + months + " mois.",
                    ENTITY_NAME,
                    "karamaTooLong"
                );
            }
        }

        validateSalaryMinimum(dto, SMIG_48H, "KARAMA");

        LOG.debug("✅ KARAMA validé — Aide État 200 TND/mois, CNSS ANETI pendant 36 mois max");
    }

    /**
     * INTÉRIMAIRE (LF 2026)
     * - Salaire ≥ SMIG + 10% prime de précarité
     * - Durée max 2 ans discontinus chez même utilisateur
     * - CNSS obligatoire
     */
    private void validateInterim(ContractDTO dto) {
        // Salaire min = SMIG + 10% précarité
        if (dto.getBaseSalary() != null && dto.getBaseSalary().compareTo(INTERIM_MIN) < 0) {
            throw new BusinessException(
                String.format(
                    "❌ LF 2026 — Le salaire d'un contrat intérimaire doit être ≥ %.3f TND " +
                        "(SMIG 524.954 + 10%% prime de précarité). " +
                        "Salaire saisi : %.3f TND.",
                    INTERIM_MIN.doubleValue(),
                    dto.getBaseSalary().doubleValue()
                ),
                ENTITY_NAME,
                "salaryBelowInterimMinimum"
            );
        }

        LOG.debug("✅ Intérim validé — Salaire avec prime précarité 10%: {} TND", dto.getBaseSalary());
    }

    /**
     * STAGE (LF 2026)
     * - Gratification ≥ 50% SMIG (≈ 262.477 TND)
     * - Durée max 6 mois par an
     * - CNSS non obligatoire si < 2 mois
     */
    private void validateStage(ContractDTO dto) {
        // Gratification min 50% SMIG
        if (dto.getBaseSalary() != null && dto.getBaseSalary().compareTo(STAGE_MIN) < 0) {
            throw new BusinessException(
                String.format(
                    "❌ LF 2026 — La gratification d'un stage doit être ≥ %.3f TND " + "(50%% du SMIG 48h). " + "Montant saisi : %.3f TND.",
                    STAGE_MIN.doubleValue(),
                    dto.getBaseSalary().doubleValue()
                ),
                ENTITY_NAME,
                "gratificationBelowMinimum"
            );
        }

        // Durée max 6 mois
        if (dto.getStartDate() != null && dto.getEndDate() != null) {
            long months = ChronoUnit.MONTHS.between(dto.getStartDate(), dto.getEndDate());
            if (months > 6) {
                throw new BusinessException(
                    "❌ LF 2026 — Un stage ne peut pas dépasser 6 mois par an. " + "Durée saisie : " + months + " mois.",
                    ENTITY_NAME,
                    "stageTooLong"
                );
            }
        }

        LOG.debug("✅ Stage validé — Gratification: {} TND (min 262.477 TND)", dto.getBaseSalary());
    }

    // ── Validation salaire minimum SMIG ───────────────────────────────────────
    private void validateSalaryMinimum(ContractDTO dto, BigDecimal minimum, String contractType) {
        if (dto.getBaseSalary() == null) {
            throw new BusinessException("Le salaire de base est obligatoire.", ENTITY_NAME, "salaryRequired");
        }

        if (dto.getBaseSalary().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le salaire de base doit être positif.", ENTITY_NAME, "invalidSalary");
        }

        if (dto.getBaseSalary().compareTo(minimum) < 0) {
            throw new BusinessException(
                String.format(
                    "❌ LF 2026 — Le salaire d'un %s doit être ≥ %.3f TND (SMIG 48h 2026). " + "Salaire saisi : %.3f TND.",
                    contractType,
                    minimum.doubleValue(),
                    dto.getBaseSalary().doubleValue()
                ),
                ENTITY_NAME,
                "salaryBelowSMIG"
            );
        }
    }

    // ── Validation des dates ──────────────────────────────────────────────────
    private void validateDates(ContractDTO dto) {
        if (dto.getStartDate() == null) {
            throw new BusinessException("La date de début est obligatoire.", ENTITY_NAME, "startDateRequired");
        }

        if (dto.getEndDate() != null && dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new BusinessException(
                "La date de fin (" +
                    dto.getEndDate() +
                    ") ne peut pas être " +
                    "antérieure à la date de début (" +
                    dto.getStartDate() +
                    ").",
                ENTITY_NAME,
                "invalidDates"
            );
        }

        if (dto.getSignedDate() != null && dto.getStartDate() != null && dto.getSignedDate().isAfter(dto.getStartDate())) {
            throw new BusinessException(
                "La date de signature (" +
                    dto.getSignedDate() +
                    ") ne peut pas être " +
                    "postérieure à la date de début (" +
                    dto.getStartDate() +
                    ").",
                ENTITY_NAME,
                "invalidSignedDate"
            );
        }

        // Heures de travail
        if (dto.getWorkingHoursWeek() != null) {
            if (dto.getWorkingHoursWeek() < 1 || dto.getWorkingHoursWeek() > 48) {
                throw new BusinessException(
                    "❌ LF 2026 — Les heures de travail hebdomadaires doivent être " + "entre 1 et 48h (régime légal tunisien).",
                    ENTITY_NAME,
                    "invalidWorkingHours"
                );
            }
        }
    }
}
