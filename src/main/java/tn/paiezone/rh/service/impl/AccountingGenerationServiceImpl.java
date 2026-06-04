package tn.paiezone.rh.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.AccountingEntry;
import tn.paiezone.rh.domain.Company;
import tn.paiezone.rh.domain.PaySlip;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.domain.enumeration.AccountingEntryType;
import tn.paiezone.rh.repository.AccountingEntryRepository;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.service.AccountingGenerationService;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AccountingGenerationServiceImpl implements AccountingGenerationService {

    private final PaySlipRepository paySlipRepository;
    private final AccountingEntryRepository accountingEntryRepository;

    @Override
    public void generateForPeriod(PayrollPeriod period) {
        // Idempotent: purge existing entries for this period first
        accountingEntryRepository.deleteByPayrollPeriodId(period.getId());

        List<PaySlip> slips = paySlipRepository.findByPayrollPeriodId(period.getId());
        if (slips.isEmpty()) {
            log.warn("Aucun bulletin pour la période ID={} — aucune écriture générée", period.getId());
            return;
        }

        BigDecimal grossTotal = sum(slips, PaySlip::getGrossSalary);
        BigDecimal cnssTotal = sum(slips, PaySlip::getCnssSalaryAmount);
        BigDecimal irppTotal = sum(slips, PaySlip::getIrppAmount);
        BigDecimal cssTotal = sumNullable(slips, PaySlip::getCssAmount);
        BigDecimal cavisTotal = sumNullable(slips, PaySlip::getCavisAmount);
        BigDecimal empCnss = sum(slips, PaySlip::getEmployerCnss);

        Company company = period.getCompany();
        String ref = "PAIE-" + period.getYear() + String.format("%02d", period.getMonth());
        String lbl = period.getMonth() + "/" + period.getYear();
        // Entry date = last day of the payroll month
        LocalDate entryDate = LocalDate.of(period.getYear(), period.getMonth(), 1).with(TemporalAdjusters.lastDayOfMonth());

        List<AccountingEntry> entries = new ArrayList<>();

        // 1. Salaires bruts  → 641000 / 421000
        entries.add(
            build(
                company,
                period,
                entryDate,
                ref,
                AccountingEntryType.SALARY_EXPENSE,
                "Salaires bruts " + lbl,
                "641000",
                "421000",
                grossTotal
            )
        );

        // 2. CNSS salarié  → 421000 / 431000
        if (positive(cnssTotal)) {
            entries.add(
                build(
                    company,
                    period,
                    entryDate,
                    ref,
                    AccountingEntryType.CNSS_PAYABLE,
                    "CNSS salarié " + lbl,
                    "421000",
                    "431000",
                    cnssTotal
                )
            );
        }

        // 3. IRPP  → 421000 / 432000
        if (positive(irppTotal)) {
            entries.add(
                build(
                    company,
                    period,
                    entryDate,
                    ref,
                    AccountingEntryType.TAX_PAYABLE,
                    "Retenue IRPP " + lbl,
                    "421000",
                    "432000",
                    irppTotal
                )
            );
        }

        // 4. CSS  → 421000 / 433000
        if (positive(cssTotal)) {
            entries.add(
                build(company, period, entryDate, ref, AccountingEntryType.TAX_PAYABLE, "CSS " + lbl, "421000", "433000", cssTotal)
            );
        }

        // 5. CAVIS  → 421000 / 434000
        if (positive(cavisTotal)) {
            entries.add(
                build(company, period, entryDate, ref, AccountingEntryType.CNSS_PAYABLE, "CAVIS " + lbl, "421000", "434000", cavisTotal)
            );
        }

        // 6. Charges patronales CNSS  → 641100 / 431000
        if (positive(empCnss)) {
            entries.add(
                build(
                    company,
                    period,
                    entryDate,
                    ref,
                    AccountingEntryType.CNSS_EXPENSE,
                    "Charges patronales CNSS " + lbl,
                    "641100",
                    "431000",
                    empCnss
                )
            );
        }

        accountingEntryRepository.saveAll(entries);
        log.info("✅ {} écritures comptables générées pour la période {}/{}", entries.size(), period.getMonth(), period.getYear());
    }

    // ── helpers ──────────────────────────────────────────────────────────

    private AccountingEntry build(
        Company company,
        PayrollPeriod period,
        LocalDate date,
        String ref,
        AccountingEntryType type,
        String description,
        String debit,
        String credit,
        BigDecimal amount
    ) {
        AccountingEntry e = new AccountingEntry();
        e.setCompany(company);
        e.setPayrollPeriod(period);
        e.setEntryDate(date);
        e.setJournalRef(ref);
        e.setEntryType(type);
        e.setDescription(description);
        e.setDebitAccount(debit);
        e.setCreditAccount(credit);
        e.setAmount(amount.setScale(3, java.math.RoundingMode.HALF_UP));
        return e;
    }

    @FunctionalInterface
    private interface Extractor {
        BigDecimal get(PaySlip s);
    }

    private BigDecimal sum(List<PaySlip> slips, Extractor fn) {
        return slips.stream().map(fn::get).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumNullable(List<PaySlip> slips, Extractor fn) {
        return slips
            .stream()
            .map(s -> {
                BigDecimal v = fn.get(s);
                return v != null ? v : BigDecimal.ZERO;
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean positive(BigDecimal v) {
        return v != null && v.compareTo(BigDecimal.ZERO) > 0;
    }
}
