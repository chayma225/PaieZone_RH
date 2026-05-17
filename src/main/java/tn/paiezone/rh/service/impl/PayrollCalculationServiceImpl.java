package tn.paiezone.rh.service.impl;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.*;
import tn.paiezone.rh.domain.enumeration.AdvanceStatus;
import tn.paiezone.rh.domain.enumeration.PayrollStatus;
import tn.paiezone.rh.domain.enumeration.RubriqueType;
import tn.paiezone.rh.repository.*;
import tn.paiezone.rh.service.PayrollCalculationService;
import tn.paiezone.rh.service.TunisianTaxService;
import tn.paiezone.rh.service.dto.BulkCalculationResultDTO;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PayrollCalculationServiceImpl implements PayrollCalculationService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final RoundingMode RM = RoundingMode.HALF_UP;

    private final TunisianTaxService taxService;
    private final EmployeeRepository employeeRepository;
    private final ContractRepository contractRepository;
    private final RubriqueRepository rubriqueRepository;
    private final PaySlipRepository paySlipRepository;
    private final PaySlipLineRepository paySlipLineRepository;
    private final BonusRepository bonusRepository;
    private final AdvanceRepository advanceRepository;
    private final PayrollPeriodRepository periodRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final PublicHolidayRepository publicHolidayRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    // ═══════════════════════════════════════════════════════════════
    //  CALCUL D'UN BULLETIN — Ordre légal tunisien
    // ═══════════════════════════════════════════════════════════════

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public PaySlip calculatePaySlip(Long employeeId, Long periodId) {
        // ── Chargement des entités ────────────────────────────────
        Employee employee = employeeRepository
            .findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("Employé introuvable : " + employeeId));

        PayrollPeriod period = periodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));

        if (period.getStatus() == PayrollStatus.LOCKED) {
            throw new IllegalStateException("Période " + period.getMonth() + "/" + period.getYear() + " clôturée — recalcul impossible.");
        }

        int month = period.getMonth();
        int year = period.getYear();
        LocalDate periodStart = LocalDate.of(year, month, 1);
        LocalDate periodEnd = periodStart.withDayOfMonth(periodStart.lengthOfMonth());

        Contract contract = contractRepository
            .findActiveContractByEmployee(employeeId, periodStart, periodEnd)
            .orElseThrow(() ->
                new IllegalStateException("Aucun contrat actif pour " + employee.getMatricule() + " en " + month + "/" + year)
            );

        log.info("▶ Calcul bulletin | {} {}/{}", employee.getMatricule(), month, year);

        // ── ÉTAPE 1 : Pro-rata jours travaillés ───────────────────
        Set<LocalDate> holidays = publicHolidayRepository
            .findByYearAndActiveTrue(year)
            .stream()
            .map(PublicHoliday::getHolidayDate)
            .collect(Collectors.toSet());

        LocalDate contractStart = contract.getStartDate().isAfter(periodStart) ? contract.getStartDate() : periodStart;
        LocalDate contractEnd = (contract.getEndDate() != null && contract.getEndDate().isBefore(periodEnd))
            ? contract.getEndDate()
            : periodEnd;

        int totalWorkDays = countWorkingDays(periodStart, periodEnd, holidays);
        int workedDays = countWorkingDays(contractStart, contractEnd, holidays);

        BigDecimal proRata = (workedDays < totalWorkDays && totalWorkDays > 0)
            ? BigDecimal.valueOf(workedDays).divide(BigDecimal.valueOf(totalWorkDays), 6, RM)
            : BigDecimal.ONE;

        // Salaire de base pro-ratisé (avant déduction congés non payés)
        BigDecimal baseSalaryProRata = contract.getBaseSalary().multiply(proRata).setScale(3, RM);

        log.debug(
            "Pro-rata | contrat={} workedDays={}/{} proRata={} base={}",
            contract.getBaseSalary(),
            workedDays,
            totalWorkDays,
            proRata,
            baseSalaryProRata
        );

        // ── ÉTAPE 2 : Congés ──────────────────────────────────────
        List<LeaveRequest> approvedLeaves = leaveRequestRepository.findApprovedByEmployeeAndMonth(employeeId, month, year);

        int paidLeaveDays = approvedLeaves
            .stream()
            .filter(lr -> Boolean.TRUE.equals(lr.getLeaveType().getPaid()))
            .mapToInt(LeaveRequest::getNumberOfDays)
            .sum();

        int unpaidLeaveDaysCount = approvedLeaves
            .stream()
            .filter(lr -> Boolean.FALSE.equals(lr.getLeaveType().getPaid()))
            .mapToInt(LeaveRequest::getNumberOfDays)
            .sum();

        // Déduction congés non payés : (salaire / jours travaillés) × jours non payés
        BigDecimal unpaidLeaveDeduction = ZERO;
        if (unpaidLeaveDaysCount > 0 && workedDays > 0) {
            BigDecimal deductionParJour = baseSalaryProRata.divide(BigDecimal.valueOf(workedDays), 6, RM);
            unpaidLeaveDeduction = deductionParJour.multiply(BigDecimal.valueOf(unpaidLeaveDaysCount)).setScale(3, RM);
            log.debug("Congés non payés | {}j × {}/j = {}", unpaidLeaveDaysCount, deductionParJour, unpaidLeaveDeduction);
        }

        // Salaire de base après déduction congés non payés
        BigDecimal baseSalary = baseSalaryProRata.subtract(unpaidLeaveDeduction).max(ZERO);

        // ── ÉTAPE 3 : Heures supplémentaires ─────────────────────
        BigDecimal overtimeHours = timeEntryRepository
            .findValidatedByEmployeeAndMonth(employeeId, month, year)
            .stream()
            .map(TimeEntry::getOvertimeHours)
            .filter(Objects::nonNull)
            .reduce(ZERO, BigDecimal::add);

        // ── ÉTAPE 4 : Rubriques + Primes ─────────────────────────
        RubriqueResult rr = buildRubriqueLines(employee, contract, baseSalary, overtimeHours, year);

        List<Bonus> bonuses = bonusRepository.findByEmployeeIdAndMonthAndYear(employeeId, month, year);

        BigDecimal taxableBonuses = bonuses
            .stream()
            .filter(b -> Boolean.TRUE.equals(b.getTaxable()))
            .map(Bonus::getAmount)
            .filter(Objects::nonNull)
            .reduce(ZERO, BigDecimal::add);

        BigDecimal nonTaxableBonuses = bonuses
            .stream()
            .filter(b -> !Boolean.TRUE.equals(b.getTaxable()))
            .map(Bonus::getAmount)
            .filter(Objects::nonNull)
            .reduce(ZERO, BigDecimal::add);

        BigDecimal bonusTotal = taxableBonuses.add(nonTaxableBonuses);

        // ── ÉTAPE 5 : Base CNSS et Brut ──────────────────────────
        // Base CNSS = salaire net + gains soumis CNSS (rubriques) + primes taxables
        BigDecimal cnssBase = baseSalary.add(rr.cnssGains).add(taxableBonuses);
        // Brut total = cnssBase + gains non soumis CNSS + primes non taxables
        BigDecimal grossSalary = cnssBase.add(rr.nonCnssGains).add(nonTaxableBonuses);

        // ── ÉTAPE 6 : CNSS salarié et patronal ───────────────────
        // Tous les taux lus depuis RegulatoryParam (plus aucun hardcodé)
        BigDecimal cnssSalary = taxService.calculateEmployeeCnss(cnssBase, year);
        BigDecimal employerCnss = taxService.calculateEmployerCnss(cnssBase, year);
        BigDecimal employerCavis = taxService.calculateCavisEmployer(cnssBase, year);

        // ── ÉTAPE 7 : CAVIS salarié ───────────────────────────────
        BigDecimal cavisAmount = taxService.calculateCavisEmployee(cnssBase, year);

        // ── ÉTAPE 8 : CSS (Contribution Sociale de Solidarité) ───
        // Base CSS = brut - CNSS salarié - CAVIS salarié
        BigDecimal cssBase = grossSalary.subtract(cnssSalary).subtract(cavisAmount).max(ZERO);
        BigDecimal cssAmount = taxService.calculateCss(cssBase, year);

        // ── ÉTAPE 9 : Base IRPP ───────────────────────────────────
        // Base IRPP = salaire + gains IRPP + primes taxables - CNSS - CAVIS
        // IMPORTANT : La CSS n'est PAS déductible de la base IRPP en droit tunisien
        BigDecimal irppBase = baseSalary.add(rr.irppGains).add(taxableBonuses).subtract(cnssSalary).subtract(cavisAmount).max(ZERO);

        // ── ÉTAPE 10 : IRPP ───────────────────────────────────────
        BigDecimal irpp = taxService.calculateMonthlyIrpp(irppBase, year, employee);

        // ── ÉTAPE 11 : Avances ────────────────────────────────────
        List<Advance> advances = advanceRepository.findApprovedForDeduction(employeeId, month, year);
        BigDecimal advanceDeduction = advances.stream().map(Advance::getAmount).filter(Objects::nonNull).reduce(ZERO, BigDecimal::add);

        // ── ÉTAPE 12 : Net Salary ─────────────────────────────────
        BigDecimal totalDeductions = cnssSalary.add(cavisAmount).add(cssAmount).add(irpp).add(rr.rubriqueDeductions).add(advanceDeduction);

        BigDecimal netSalary = grossSalary
            .subtract(cnssSalary)
            .subtract(cavisAmount)
            .subtract(cssAmount)
            .subtract(irpp)
            .subtract(rr.rubriqueDeductions)
            .subtract(advanceDeduction)
            .max(ZERO);

        // ── ÉTAPE 13 : TFP (charge patronale) ────────────────────
        BigDecimal tfpAmount = taxService.calculateTfp(grossSalary, year);

        // ── ÉTAPE 14 : Total coût employeur ───────────────────────
        // Coût employeur = brut + CNSS patronal + CAVIS patronal + TFP
        BigDecimal totalEmployerCost = grossSalary.add(employerCnss).add(employerCavis).add(tfpAmount);

        // ── Supprimer l'ancien bulletin si recalcul ────────────────
        paySlipRepository
            .findByEmployeeIdAndPayrollPeriodId(employeeId, periodId)
            .ifPresent(old -> {
                paySlipLineRepository.deleteByPaySlipId(old.getId());
                // Remettre les avances DEDUCTED → APPROVED si recalcul
                advanceRepository
                    .findByPaySlipId(old.getId())
                    .forEach(a -> {
                        if (a.getStatus() == AdvanceStatus.DEDUCTED) {
                            a.setStatus(AdvanceStatus.APPROVED);
                            advanceRepository.save(a);
                        }
                    });
                // Détacher les primes de l'ancien bulletin
                bonusRepository
                    .findByPaySlipId(old.getId())
                    .forEach(b -> {
                        b.setPaySlip(null);
                        bonusRepository.save(b);
                    });
                paySlipRepository.delete(old);
                paySlipRepository.flush();
            });

        // ── Créer le nouveau bulletin ──────────────────────────────
        Instant now = Instant.now();
        PaySlip ps = new PaySlip();
        ps.setEmployee(employee);
        ps.setPayrollPeriod(period);
        ps.setContract(contract);
        ps.setMonth(month);
        ps.setYear(year);

        // Jours / heures
        ps.setWorkedDays(workedDays);
        ps.setPaidLeaveDays(paidLeaveDays);
        ps.setUnpaidDays(unpaidLeaveDaysCount);
        ps.setOvertimeHours(overtimeHours);
        ps.setOvertimeAmount(rr.overtimeAmount);

        // Salaires
        ps.setBaseSalary(baseSalary);
        ps.setUnpaidLeaveDeduction(unpaidLeaveDeduction);
        ps.setBonusTotal(bonusTotal);
        ps.setTotalGains(rr.totalGains.add(bonusTotal));
        ps.setGrossSalary(grossSalary);

        // Cotisations salariales
        ps.setCnssSalaryAmount(cnssSalary);
        ps.setCavisAmount(cavisAmount);
        ps.setCssAmount(cssAmount);

        // IRPP
        ps.setTaxableIncome(irppBase);
        ps.setIrppAmount(irpp);

        // Avances
        ps.setAdvanceDeduction(advanceDeduction);

        // Totaux
        ps.setTotalDeductions(totalDeductions);
        ps.setNetSalary(netSalary);

        // Charges patronales
        ps.setEmployerCnss(employerCnss);
        ps.setEmployerCavis(employerCavis);
        ps.setTfpAmount(tfpAmount);
        ps.setTotalEmployerCost(totalEmployerCost);

        // Métadonnées
        ps.setStatus(PayrollStatus.CALCULATED);
        ps.setGeneratedAt(now);
        ps.setCreatedBy("system");
        ps.setCreatedDate(now);

        PaySlip saved = paySlipRepository.save(ps);

        // ── Persistance des lignes ────────────────────────────────
        rr.lines.forEach(l -> {
            l.setPaySlip(saved);
            paySlipLineRepository.save(l);
        });

        // ── Rattacher les primes au bulletin ──────────────────────
        bonuses.forEach(b -> {
            b.setPaySlip(saved);
            bonusRepository.save(b);
        });

        // ── Marquer les avances DEDUCTED ──────────────────────────
        advances.forEach(a -> {
            a.setStatus(AdvanceStatus.DEDUCTED);
            advanceRepository.save(a);
        });

        log.info(
            "✅ Bulletin calculé | {} {}/{} | brut={} cnss={} cavis={} css={} irpp={} net={} | employeur: cnss={} tfp={} total={}",
            employee.getMatricule(),
            month,
            year,
            grossSalary,
            cnssSalary,
            cavisAmount,
            cssAmount,
            irpp,
            netSalary,
            employerCnss,
            tfpAmount,
            totalEmployerCost
        );

        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  CALCUL BATCH — Tous les employés d'une période
    // ═══════════════════════════════════════════════════════════════

    @Override
    public BulkCalculationResultDTO calculateAllPaySlips(Long periodId) {
        PayrollPeriod period = periodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));

        if (period.getStatus() == PayrollStatus.LOCKED) {
            throw new IllegalStateException("Période clôturée — recalcul impossible.");
        }

        List<Employee> employees = employeeRepository.findByCompanyIdAndActiveTrue(period.getCompany().getId());

        log.info("▶ Calcul batch | {} employés | période {}/{}", employees.size(), period.getMonth(), period.getYear());

        int calculated = 0;
        List<String> errors = new ArrayList<>();
        BigDecimal totalNet = ZERO,
            totalGross = ZERO;

        for (Employee emp : employees) {
            try {
                PaySlip ps = calculatePaySlip(emp.getId(), periodId);
                totalNet = totalNet.add(ps.getNetSalary());
                totalGross = totalGross.add(ps.getGrossSalary());
                calculated++;
            } catch (Exception e) {
                String msg = emp.getMatricule() + " : " + e.getMessage();
                log.error("❌ Erreur bulletin | {}", msg, e);
                errors.add(msg);
            }
        }

        // Met à jour le statut de la période
        if (errors.isEmpty()) {
            period.setStatus(PayrollStatus.CALCULATED);
            log.info("✅ Tous les bulletins calculés ({}/{})", calculated, employees.size());
        } else {
            // Même avec des erreurs, si au moins un bulletin est calculé → CALCULATED
            if (calculated > 0) period.setStatus(PayrollStatus.CALCULATED);
            log.warn("⚠️ Calcul partiel : {}/{} ok, {} erreur(s)", calculated, employees.size(), errors.size());
        }
        period.setCalculatedAt(Instant.now());
        periodRepository.save(period);

        return new BulkCalculationResultDTO(employees.size(), calculated, errors.size(), totalNet, totalGross, errors);
    }

    // ═══════════════════════════════════════════════════════════════
    //  RECALCUL
    // ═══════════════════════════════════════════════════════════════

    @Override
    public PaySlip recalculatePaySlip(Long paySlipId) {
        PaySlip existing = paySlipRepository
            .findById(paySlipId)
            .orElseThrow(() -> new EntityNotFoundException("Bulletin introuvable : " + paySlipId));

        if (existing.getPayrollPeriod().getStatus() == PayrollStatus.LOCKED) {
            throw new IllegalStateException("Impossible de recalculer : la période est clôturée (LOCKED).");
        }

        log.info(
            "♻ Recalcul bulletin ID={} | {} {}/{}",
            paySlipId,
            existing.getEmployee().getMatricule(),
            existing.getMonth(),
            existing.getYear()
        );

        return calculatePaySlip(existing.getEmployee().getId(), existing.getPayrollPeriod().getId());
    }

    @Override
    public void calculate(Long id) {
        calculateAllPaySlips(id);
    }

    // ═══════════════════════════════════════════════════════════════
    //  VALIDATION / CLÔTURE DE PÉRIODE
    // ═══════════════════════════════════════════════════════════════

    public void validatePeriod(Long periodId) {
        PayrollPeriod period = periodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        if (period.getStatus() != PayrollStatus.CALCULATED) throw new IllegalStateException(
            "La période doit être CALCULATED pour être validée. Statut actuel : " + period.getStatus()
        );
        period.setStatus(PayrollStatus.VALIDATED);
        period.setValidatedAt(Instant.now());
        periodRepository.save(period);
        log.info("✅ Période {}/{} validée", period.getMonth(), period.getYear());
    }

    public void lockPeriod(Long periodId, String lockedBy) {
        PayrollPeriod period = periodRepository
            .findById(periodId)
            .orElseThrow(() -> new EntityNotFoundException("Période introuvable : " + periodId));
        if (period.getStatus() != PayrollStatus.VALIDATED) throw new IllegalStateException(
            "La période doit être VALIDATED avant clôture. Statut actuel : " + period.getStatus()
        );

        long nonCalc = paySlipRepository.countByPayrollPeriodIdAndStatusNot(periodId, PayrollStatus.CALCULATED);
        if (nonCalc > 0) throw new IllegalStateException(nonCalc + " bulletin(s) non calculé(s) — clôture impossible.");

        period.setStatus(PayrollStatus.LOCKED);
        period.setLockedAt(Instant.now());
        period.setClosedBy(lockedBy);
        periodRepository.save(period);
        log.info("🔒 Période {}/{} clôturée par {}", period.getMonth(), period.getYear(), lockedBy);
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════

    private int countWorkingDays(LocalDate from, LocalDate to, Set<LocalDate> holidays) {
        int count = 0;
        LocalDate cur = from;
        while (!cur.isAfter(to)) {
            DayOfWeek d = cur.getDayOfWeek();
            if (d != DayOfWeek.SATURDAY && d != DayOfWeek.SUNDAY && !holidays.contains(cur)) count++;
            cur = cur.plusDays(1);
        }
        return count;
    }

    /**
     * Construit les lignes de rubriques du bulletin.
     * Les coefficients HS (×1.25 / ×1.50) sont lus depuis RegulatoryParam via TunisianTaxService.
     */
    private RubriqueResult buildRubriqueLines(Employee emp, Contract contract, BigDecimal baseSalary, BigDecimal overtimeHours, int year) {
        List<Rubrique> rubriques = rubriqueRepository.findByCompanyIdAndActiveTrueOrderBySortOrderAsc(emp.getCompany().getId());

        RubriqueResult result = new RubriqueResult();
        int sortOrder = 1;

        BigDecimal tauxHoraire = taxService.calculateHourlyRate(baseSalary, year);
        // Coefficients HS lus depuis RegulatoryParam — pilotables par le Super Admin
        BigDecimal tauxHs25 = taxService.getTauxHs25(year);
        BigDecimal tauxHs50 = taxService.getTauxHs50(year);

        for (Rubrique r : rubriques) {
            BigDecimal amount = switch (r.getBase()) {
                case FIXED -> r.getFixedAmount() != null ? r.getFixedAmount() : ZERO;
                case PERCENT_BRUT -> baseSalary.multiply(r.getRate() != null ? r.getRate() : ZERO).setScale(3, RM);
                case PERCENT_NET -> baseSalary.multiply(r.getRate() != null ? r.getRate() : ZERO).setScale(3, RM);
                case HOURS -> {
                    if (overtimeHours.compareTo(ZERO) == 0) yield ZERO;
                    // Détermine le coefficient selon le code rubrique
                    // HS_50 pour nuit/férié, HS_25 pour les autres
                    BigDecimal coeff = determineHsCoeff(r, tauxHs25, tauxHs50);
                    BigDecimal amt = overtimeHours.multiply(tauxHoraire).multiply(coeff).setScale(3, RM);
                    result.overtimeAmount = result.overtimeAmount.add(amt);
                    yield amt;
                }
                case FORMULA -> {
                    log.warn("Rubrique FORMULA '{}' ignorée (non implémentée)", r.getCode());
                    yield ZERO;
                }
                default -> ZERO;
            };

            if (amount.compareTo(ZERO) == 0) continue;

            PaySlipLine line = new PaySlipLine();
            line.setSortOrder(sortOrder++);
            line.setRubriqueCode(r.getCode());
            line.setRubriqueLabel(r.getLabel());
            line.setRubriqueType(r.getRubriqueType());
            line.setBase(baseSalary);
            line.setRate(r.getRate());
            line.setAmount(amount);
            line.setTaxable(r.getTaxable());
            line.setRubrique(r);
            result.lines.add(line);

            if (r.getRubriqueType() == RubriqueType.GAIN) {
                result.totalGains = result.totalGains.add(amount);
                if (Boolean.TRUE.equals(r.getCnssSalary())) result.cnssGains = result.cnssGains.add(amount);
                else result.nonCnssGains = result.nonCnssGains.add(amount);
                if (Boolean.TRUE.equals(r.getTaxable())) result.irppGains = result.irppGains.add(amount);
            } else if (r.getRubriqueType() == RubriqueType.DEDUCTION) {
                result.rubriqueDeductions = result.rubriqueDeductions.add(amount);
            }
        }
        return result;
    }

    /**
     * Détermine le coefficient HS d'une rubrique.
     * Convention : si le code contient "50" ou "NUIT" ou "FERIE" → ×1.50, sinon → ×1.25.
     * Le rate de la rubrique est prioritaire s'il est renseigné.
     */
    private BigDecimal determineHsCoeff(Rubrique r, BigDecimal tauxHs25, BigDecimal tauxHs50) {
        // Priorité 1 : rate de la rubrique explicitement défini
        if (r.getRate() != null && r.getRate().compareTo(BigDecimal.ONE) > 0) {
            return r.getRate();
        }
        // Priorité 2 : déduction par le code rubrique
        String code = r.getCode().toUpperCase();
        if (code.contains("50") || code.contains("NUIT") || code.contains("FERIE")) {
            return tauxHs50;
        }
        // Par défaut : ×1.25 (HS jour)
        return tauxHs25;
    }

    // ── Structure interne résultat rubriques ──────────────────────

    private static class RubriqueResult {

        BigDecimal cnssGains = ZERO;
        BigDecimal nonCnssGains = ZERO;
        BigDecimal irppGains = ZERO;
        BigDecimal rubriqueDeductions = ZERO;
        BigDecimal totalGains = ZERO;
        BigDecimal overtimeAmount = ZERO;
        List<PaySlipLine> lines = new ArrayList<>();
    }
}
