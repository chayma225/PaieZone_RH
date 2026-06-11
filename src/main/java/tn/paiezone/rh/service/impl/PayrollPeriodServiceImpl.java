package tn.paiezone.rh.service.impl;

import jakarta.persistence.EntityNotFoundException;
import java.time.Instant;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.repository.CompanyRepository;
import tn.paiezone.rh.repository.EmployeeRepository;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.service.exception.BusinessException;
import tn.paiezone.rh.security.SecurityUtils;
import tn.paiezone.rh.service.AccountingGenerationService;
import tn.paiezone.rh.service.PayrollCalculationService;
import tn.paiezone.rh.service.PayrollPeriodService;
import tn.paiezone.rh.service.TenantContextService;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;
import tn.paiezone.rh.service.dto.PayrollPeriodDTO;
import tn.paiezone.rh.service.mapper.PayrollPeriodMapper;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PayrollPeriodServiceImpl implements PayrollPeriodService {

    private static final String ENTITY_NAME = "payrollPeriod";

    private final PayrollPeriodRepository periodRepository;
    private final PaySlipRepository paySlipRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollPeriodMapper periodMapper;
    private final CompanyRepository companyRepository;
    private final PayrollCalculationService calculationService;
    private final UserProfileRepository userProfileRepository;
    private final TenantContextService tenantContextService;
    private final AccountingGenerationService accountingGenerationService;

    // ── Récupère la société de l'utilisateur connecté ─────────────
    private Optional<Company> getCurrentCompany() {
        Long companyId = tenantContextService.getCurrentCompanyId();
        if (companyId == null || companyId < 0) return Optional.empty();
        return companyRepository.findById(companyId);
    }

    @Override
    public PayrollPeriodDTO save(PayrollPeriodDTO dto) {
        Company company = getCurrentCompany()
            .or(() ->
                dto.getCompanyId() != null
                    ? companyRepository.findById(dto.getCompanyId())
                    : companyRepository.findAll().stream().findFirst()
            )
            .orElseThrow(() -> new EntityNotFoundException("Aucune société trouvée."));

        if (periodRepository.existsByCompanyIdAndMonthAndYear(company.getId(), dto.getMonth(), dto.getYear())) {
            throw new BusinessException(
                "Une période existe déjà pour " + dto.getMonth() + "/" + dto.getYear() + ".",
                ENTITY_NAME, "periodeExistante");
        }

        PayrollPeriod entity = periodMapper.toEntity(dto);
        entity.setCompany(company);
        if (entity.getStatus() == null) entity.setStatus(PayrollStatus.DRAFT);

        Instant now = Instant.now();
        String login = SecurityUtils.getCurrentUserLogin().orElse("system");
        entity.setCreatedBy(login);
        entity.setCreatedDate(now);
        entity.setLastModifiedBy(login);
        entity.setLastModifiedDate(now);

        PayrollPeriod saved = periodRepository.save(entity);
        log.info("✅ Période créée : {}/{} statut={}", saved.getMonth(), saved.getYear(), saved.getStatus());
        return periodMapper.toDto(saved);
    }

    @Override
    public PayrollPeriodDTO update(PayrollPeriodDTO dto) {
        PayrollPeriod existing = periodRepository
            .findById(dto.getId())
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + dto.getId()));

        if (existing.getStatus() == PayrollStatus.LOCKED)
            throw new BusinessException("Impossible de modifier une période clôturée.", ENTITY_NAME, "periodeLocked");

        periodMapper.partialUpdate(existing, dto);
        existing.setLastModifiedBy(SecurityUtils.getCurrentUserLogin().orElse("system"));
        existing.setLastModifiedDate(Instant.now());
        return periodMapper.toDto(periodRepository.save(existing));
    }

    @Override
    public Optional<PayrollPeriodDTO> partialUpdate(PayrollPeriodDTO dto) {
        return periodRepository
            .findById(dto.getId())
            .map(e -> {
                periodMapper.partialUpdate(e, dto);
                return e;
            })
            .map(periodRepository::save)
            .map(periodMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayrollPeriodDTO> findAll(Pageable pageable) {
        Optional<Company> company = getCurrentCompany();
        if (company.isPresent()) {
            Company comp = company.orElseThrow();
            log.debug("findAll filtré par company ID={}", comp.getId());
            return periodRepository.findByCompanyId(comp.getId(), pageable).map(periodMapper::toDto).map(this::enrichWithTotals);
        }
        if (!tenantContextService.isSuperAdmin()) {
            log.warn("Aucune société trouvée pour l'utilisateur courant — retour liste vide (fail-closed).");
            return Page.empty(pageable);
        }
        return periodRepository.findAll(pageable).map(periodMapper::toDto).map(this::enrichWithTotals);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PayrollPeriodDTO> findOne(Long id) {
        return periodRepository.findById(id).map(periodMapper::toDto).map(this::enrichWithTotals);
    }

    /** Injecte totalGross, totalNet, employeeCount depuis les bulletins calculés. */
    private PayrollPeriodDTO enrichWithTotals(PayrollPeriodDTO dto) {
        if (dto.getId() == null) return dto;
        try {
            Object[] agg = paySlipRepository.aggregateTotalsByPeriod(dto.getId());
            if (agg != null && agg.length >= 3) {
                dto.setEmployeeCount(((Number) agg[0]).intValue());
                dto.setTotalGross(new java.math.BigDecimal(agg[1].toString()));
                dto.setTotalNet(new java.math.BigDecimal(agg[2].toString()));
            }
        } catch (Exception e) {
            log.warn("Impossible d'agréger les totaux pour la période {} : {}", dto.getId(), e.getMessage());
        }
        return dto;
    }

    @Override
    public void delete(Long id) {
        PayrollPeriod p = periodRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + id));
        if (p.getStatus() == PayrollStatus.LOCKED)
            throw new BusinessException("Impossible de supprimer une période clôturée.", ENTITY_NAME, "periodeLocked");
        if (p.getStatus() == PayrollStatus.VALIDATED)
            throw new BusinessException("Impossible de supprimer une période validée.", ENTITY_NAME, "periodeValidated");
        periodRepository.deleteById(id);
        log.info("🗑 Période supprimée : ID={}", id);
    }

    @Override
    public BulkCalculationResultDTO triggerCalculation(Long periodId) {
        log.info("▶ Calcul batch | période ID={}", periodId);
        return calculationService.calculateAllPaySlips(periodId);
    }

    @Override
    public void calculatePayroll(Long periodId) {
        triggerCalculation(periodId);
    }

    @Override
    public void validatePeriod(Long periodId) {
        PayrollPeriod p = periodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        if (p.getStatus() != PayrollStatus.CALCULATED)
            throw new BusinessException(
                "La période doit être à l'état CALCULÉ pour être validée. Statut actuel : " + p.getStatus() + ".",
                ENTITY_NAME, "periodeNonCalculee");

        if (employeeRepository.countByActiveTrue() == 0)
            throw new BusinessException("Aucun employé actif. Impossible de valider la période.", ENTITY_NAME, "aucunEmployeActif");

        long pending = paySlipRepository.countByPayrollPeriodIdAndStatusNot(p.getId(), PayrollStatus.CALCULATED);
        if (pending > 0)
            throw new BusinessException(
                pending + " bulletin(s) non calculé(s). Calculez tous les bulletins avant de valider.",
                ENTITY_NAME, "bulletinsNonCalcules");

        p.setStatus(PayrollStatus.VALIDATED);
        p.setValidatedAt(Instant.now());
        periodRepository.save(p);
        // Passer tous les bulletins de la période à VALIDATED
        paySlipRepository
            .findAllByPeriodIdOrdered(periodId)
            .forEach(ps -> {
                ps.setStatus(PayrollStatus.VALIDATED);
                paySlipRepository.save(ps);
            });
        log.info("✅ Période {}/{} validée", p.getMonth(), p.getYear());
    }

    @Override
    public void lockPeriod(Long periodId) {
        PayrollPeriod p = periodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        if (p.getStatus() != PayrollStatus.VALIDATED)
            throw new BusinessException(
                "La période doit être à l'état VALIDÉ pour être clôturée. Statut actuel : " + p.getStatus() + ".",
                ENTITY_NAME, "periodeNonValidee");
        p.setStatus(PayrollStatus.LOCKED);
        p.setLockedAt(Instant.now());
        p.setClosedBy(SecurityUtils.getCurrentUserLogin().orElse("system"));
        periodRepository.save(p);
        log.info("🔒 Période {}/{} clôturée", p.getMonth(), p.getYear());
        accountingGenerationService.generateForPeriod(p);
    }
}
