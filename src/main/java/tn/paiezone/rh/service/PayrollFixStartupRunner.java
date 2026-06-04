package tn.paiezone.rh.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import tn.paiezone.rh.domain.PayrollPeriod;
import tn.paiezone.rh.repository.PaySlipRepository;
import tn.paiezone.rh.repository.PayrollPeriodRepository;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.impl.PayrollCalculationServiceImpl;

@Component
@RequiredArgsConstructor
@Slf4j
public class PayrollFixStartupRunner implements ApplicationRunner {

    private final PayrollParamFixer paramFixer;
    private final RegulatoryParamRepository regulatoryParamRepository;
    private final PayrollPeriodRepository periodRepository;
    private final PaySlipRepository paySlipRepository;
    private final PayrollCalculationServiceImpl calculationService;

    @Override
    public void run(ApplicationArguments args) {
        boolean needsFix = paramFixer.needsFix(regulatoryParamRepository);
        if (!needsFix) {
            log.info("✅ Paramètres LF 2026 déjà corrects — pas de recalcul automatique");
            return;
        }

        log.warn("⚙  Correction paramètres LF 2026 + recalcul global au démarrage...");

        // ÉTAPE 1 — commit dans sa propre transaction (visible par les REQUIRES_NEW suivants)
        paramFixer.fixSocialRates();

        // ÉTAPE 2 — recalcul de toutes les périodes avec bulletins
        List<PayrollPeriod> allPeriods = periodRepository.findAll();
        int recalculated = 0;

        for (PayrollPeriod period : allPeriods) {
            if (!paySlipRepository.existsByPayrollPeriodId(period.getId())) continue;
            try {
                calculationService.forceRecalculateAll(period.getId());
                recalculated++;
                log.info("♻  Période {}/{} recalculée", period.getMonth(), period.getYear());
            } catch (Exception e) {
                log.error("❌ Période {}/{} : {}", period.getMonth(), period.getYear(), e.getMessage());
            }
        }

        log.info("✅ Correction LF 2026 terminée — {} période(s) traitée(s)", recalculated);
    }
}
