package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.domain.ActivitySector;
import tn.paiezone.rh.repository.ActivitySectorRepository;

@RestController
@RequestMapping("/api/activity-sectors")
public class ActivitySectorResource {

    private final ActivitySectorRepository repo;

    public ActivitySectorResource(ActivitySectorRepository repo) {
        this.repo = repo;
    }

    @GetMapping("")
    public List<ActivitySector> getAll() {
        return repo.findByActiveTrueOrderByLabelAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivitySector> get(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("")
    public ResponseEntity<ActivitySector> create(@Valid @RequestBody ActivitySector sector) throws URISyntaxException {
        sector.setId(null);
        ActivitySector saved = repo.save(sector);
        return ResponseEntity.created(new URI("/api/activity-sectors/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActivitySector> update(@PathVariable Long id, @Valid @RequestBody ActivitySector sector) {
        sector.setId(id);
        return ResponseEntity.ok(repo.save(sector));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo
            .findById(id)
            .ifPresent(s -> {
                s.setActive(false);
                repo.save(s);
            });
        return ResponseEntity.noContent().build();
    }
}
