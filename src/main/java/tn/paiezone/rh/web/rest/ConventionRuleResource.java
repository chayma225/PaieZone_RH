package tn.paiezone.rh.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.domain.ConventionRule;
import tn.paiezone.rh.domain.enumeration.ConventionRuleType;
import tn.paiezone.rh.repository.ConventionRuleRepository;
import tn.paiezone.rh.repository.SectoralConventionRepository;

@RestController
@RequestMapping("/api/convention-rules")
public class ConventionRuleResource {

    private final ConventionRuleRepository repo;
    private final SectoralConventionRepository convRepo;

    public ConventionRuleResource(ConventionRuleRepository repo, SectoralConventionRepository convRepo) {
        this.repo = repo;
        this.convRepo = convRepo;
    }

    @GetMapping("/by-convention/{conventionId}")
    public List<ConventionRule> byConvention(@PathVariable Long conventionId) {
        return repo.findByConvention_IdAndActiveTrueOrderByRuleTypeAsc(conventionId);
    }

    @PostMapping("")
    public ResponseEntity<ConventionRule> create(@RequestBody Map<String, Object> body) throws URISyntaxException {
        ConventionRule rule = new ConventionRule();
        Long convId = Long.valueOf(body.get("conventionId").toString());
        rule.setConvention(convRepo.findById(convId).orElseThrow());
        rule.setRuleType(ConventionRuleType.valueOf(body.get("ruleType").toString()));
        rule.setLabel(body.get("label").toString());
        rule.setValue(body.get("value").toString());
        rule.setActive(true);
        ConventionRule saved = repo.save(rule);
        return ResponseEntity.created(new URI("/api/convention-rules/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConventionRule> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        ConventionRule rule = repo.findById(id).orElseThrow();
        if (body.containsKey("label")) rule.setLabel(body.get("label").toString());
        if (body.containsKey("value")) rule.setValue(body.get("value").toString());
        if (body.containsKey("active")) rule.setActive(Boolean.valueOf(body.get("active").toString()));
        return ResponseEntity.ok(repo.save(rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo
            .findById(id)
            .ifPresent(r -> {
                r.setActive(false);
                repo.save(r);
            });
        return ResponseEntity.noContent().build();
    }
}
