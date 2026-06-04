package tn.paiezone.rh.service;

import java.math.BigDecimal;
import javax.cache.CacheManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.repository.RegulatoryParamRepository;

/**
 * Corrige les taux LF 2026 via SQL natif (bypass cache Hibernate L2)
 * puis vide explicitement le cache Redis pour que le moteur de paie
 * lise les nouvelles valeurs immédiatement.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PayrollParamFixer {

    static final BigDecimal CNSS_RATE_CORRECT = new BigDecimal("0.0918");

    private final RegulatoryParamRepository regulatoryParamRepository;
    private final CacheManager cacheManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void fixSocialRates() {
        // SQL natif → bypass Hibernate L2 cache, update direct en base
        int n1 = regulatoryParamRepository.updateValueByKeyNative("CNSS_TAUX_SALARIAL", CNSS_RATE_CORRECT);
        int n2 = regulatoryParamRepository.updateValueByKeyNative("CAVIS_TAUX_SALARIE", BigDecimal.ZERO);
        int n3 = regulatoryParamRepository.updateValueByKeyNative("CSS_TAUX", BigDecimal.ZERO);
        int n4 = regulatoryParamRepository.updateValueByKeyNative("CNSS_PLAFOND_MENSUEL", new BigDecimal("999999"));
        regulatoryParamRepository.flush();

        log.info("✅ SQL natif — CNSS={} CAVIS={} CSS={} plafond={} ligne(s) modifiée(s)", n1, n2, n3, n4);

        // Vider le cache L2 Redis pour RegulatoryParam → forcer relecture depuis DB
        evictCache("tn.paiezone.rh.domain.RegulatoryParam");
    }

    private void evictCache(String cacheName) {
        try {
            javax.cache.Cache<?, ?> cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                log.info("🧹 Cache '{}' vidé", cacheName);
            }
        } catch (Exception e) {
            log.warn("Impossible de vider le cache '{}' : {}", cacheName, e.getMessage());
        }
    }

    public boolean needsFix(RegulatoryParamRepository repo) {
        return repo
            .findAllActive()
            .stream()
            .anyMatch(p -> {
                if ("CAVIS_TAUX_SALARIE".equals(p.getParamKey())) return (
                    p.getNumericValue() != null && p.getNumericValue().compareTo(BigDecimal.ZERO) > 0
                );
                if ("CNSS_TAUX_SALARIAL".equals(p.getParamKey())) return (
                    p.getNumericValue() != null && p.getNumericValue().compareTo(CNSS_RATE_CORRECT) != 0
                );
                return false;
            });
    }
}
