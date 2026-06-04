package tn.paiezone.rh.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.domain.ActivitySector;
import tn.paiezone.rh.domain.ConventionRule;
import tn.paiezone.rh.domain.SectoralConvention;
import tn.paiezone.rh.domain.enumeration.ConventionRuleType;
import tn.paiezone.rh.repository.ActivitySectorRepository;
import tn.paiezone.rh.repository.ConventionRuleRepository;
import tn.paiezone.rh.repository.SectoralConventionRepository;

@RestController
@RequestMapping("/api/sectoral-conventions")
public class SectoralConventionResource {

    private static final Logger log = LoggerFactory.getLogger(SectoralConventionResource.class);

    private final SectoralConventionRepository repo;
    private final ActivitySectorRepository sectorRepo;
    private final ConventionRuleRepository ruleRepo;

    public SectoralConventionResource(
        SectoralConventionRepository repo,
        ActivitySectorRepository sectorRepo,
        ConventionRuleRepository ruleRepo
    ) {
        this.repo = repo;
        this.sectorRepo = sectorRepo;
        this.ruleRepo = ruleRepo;
    }

    @GetMapping("")
    public List<SectoralConvention> getAll() {
        return repo.findByActiveTrueOrderBySector_LabelAscYearDesc();
    }

    @GetMapping("/by-sector/{sectorId}")
    public List<SectoralConvention> bySector(@PathVariable Long sectorId) {
        return repo.findBySector_IdOrderByYearDesc(sectorId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SectoralConvention> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("")
    public ResponseEntity<SectoralConvention> create(@RequestBody Map<String, Object> body) throws URISyntaxException {
        SectoralConvention conv = buildConvention(body);
        SectoralConvention saved = repo.save(conv);
        return ResponseEntity.created(new URI("/api/sectoral-conventions/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SectoralConvention> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        SectoralConvention conv = repo.findById(id).orElseThrow();
        if (body.containsKey("label")) conv.setLabel(body.get("label").toString());
        if (body.containsKey("year")) conv.setYear(Integer.valueOf(body.get("year").toString()));
        if (body.containsKey("active")) conv.setActive(Boolean.valueOf(body.get("active").toString()));
        return ResponseEntity.ok(repo.save(conv));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo
            .findById(id)
            .ifPresent(c -> {
                c.setActive(false);
                repo.save(c);
            });
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/sectoral-conventions/import
     * Importe une convention complète depuis un fichier JSON généré par IA.
     *
     * Format attendu :
     * {
     *   "sectorCode": "BTP",
     *   "year": 2026,
     *   "label": "Convention collective BTP 2026",
     *   "effectiveFrom": "2026-01-01",   // optionnel
     *   "rules": [
     *     { "ruleType": "HOLIDAY",     "label": "Fête sectorielle", "value": "2026-04-15" },
     *     { "ruleType": "OVERTIME_25", "label": "HS ordinaires",    "value": "1.30" },
     *     { "ruleType": "PREMIUM",     "label": "Prime panier",     "value": "200" }
     *   ]
     * }
     */
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importConvention(@RequestBody Map<String, Object> body) {
        String sectorCode = body.get("sectorCode").toString().toUpperCase();
        int year = Integer.parseInt(body.get("year").toString());
        String label = body.get("label").toString();

        ActivitySector sector = sectorRepo
            .findByActiveTrueOrderByLabelAsc()
            .stream()
            .filter(s -> s.getCode().equalsIgnoreCase(sectorCode))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Secteur inconnu : " + sectorCode));

        SectoralConvention conv = new SectoralConvention();
        conv.setSector(sector);
        conv.setYear(year);
        conv.setLabel(label);
        conv.setActive(true);
        if (body.get("effectiveFrom") != null && !body.get("effectiveFrom").toString().isBlank()) conv.setEffectiveFrom(
            LocalDate.parse(body.get("effectiveFrom").toString())
        );
        SectoralConvention saved = repo.save(conv);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rawRules = (List<Map<String, Object>>) body.getOrDefault("rules", List.of());

        List<String> errors = new ArrayList<>();
        int created = 0;

        for (Map<String, Object> r : rawRules) {
            try {
                ConventionRule rule = new ConventionRule();
                rule.setConvention(saved);
                rule.setRuleType(ConventionRuleType.valueOf(r.get("ruleType").toString()));
                rule.setLabel(r.get("label").toString());
                rule.setValue(r.get("value").toString());
                rule.setActive(true);
                ruleRepo.save(rule);
                created++;
            } catch (Exception e) {
                errors.add("Règle ignorée : " + r + " → " + e.getMessage());
                log.warn("Import convention rule error: {}", e.getMessage());
            }
        }

        log.info("✅ Convention importée | secteur={} année={} règles={}", sectorCode, year, created);

        return ResponseEntity.ok(
            Map.of("conventionId", saved.getId(), "sectorCode", sectorCode, "year", year, "rulesCreated", created, "errors", errors)
        );
    }

    // ── Helper ─────────────────────────────────────────────────────
    private SectoralConvention buildConvention(Map<String, Object> body) {
        SectoralConvention conv = new SectoralConvention();
        Long sectorId = Long.valueOf(body.get("sectorId").toString());
        conv.setSector(sectorRepo.findById(sectorId).orElseThrow());
        conv.setYear(Integer.valueOf(body.get("year").toString()));
        conv.setLabel(body.get("label").toString());
        conv.setActive(true);
        if (body.get("effectiveFrom") != null) conv.setEffectiveFrom(LocalDate.parse(body.get("effectiveFrom").toString()));
        if (body.get("effectiveTo") != null) conv.setEffectiveTo(LocalDate.parse(body.get("effectiveTo").toString()));
        return conv;
    }
}
