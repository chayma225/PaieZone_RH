package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.RegulatoryParamRepository;
import tn.paiezone.rh.service.RegulatoryParamService;
import tn.paiezone.rh.service.dto.RegulatoryParamDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.RegulatoryParam}.
 */
@RestController
@RequestMapping("/api/regulatory-params")
public class RegulatoryParamResource {

    private static final Logger LOG = LoggerFactory.getLogger(RegulatoryParamResource.class);
    private static final String ENTITY_NAME = "regulatoryParam";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final RegulatoryParamService regulatoryParamService;
    private final RegulatoryParamRepository regulatoryParamRepository;

    public RegulatoryParamResource(RegulatoryParamService regulatoryParamService, RegulatoryParamRepository regulatoryParamRepository) {
        this.regulatoryParamService = regulatoryParamService;
        this.regulatoryParamRepository = regulatoryParamRepository;
    }

    /**
     * GET /categories : Récupère la liste des catégories uniques (SOCIAL_CHARGES, TAXES, etc.)
     * Utile pour générer les onglets dans Angular.
     */
    @GetMapping("/categories")
    public List<String> getAllCategories() {
        LOG.debug("REST request to get all RegulatoryParam categories");
        return regulatoryParamRepository.findAllCategories();
    }

    /**
     * GET /category/{category} : Récupère les paramètres d'une catégorie précise.
     */
    @GetMapping("/category/{category}")
    public List<RegulatoryParamDTO> getByCategory(@PathVariable String category) {
        LOG.debug("REST request to get RegulatoryParams by category : {}", category);
        // On utilise ici le repository pour le filtrage mais on pourrait passer par le service
        return regulatoryParamRepository.findByCategoryAndActiveTrueOrderByParamLabelAsc(category)
            .stream()
            .map(param -> {
                RegulatoryParamDTO dto = new RegulatoryParamDTO();
                dto.setId(param.getId());
                dto.setParamKey(param.getParamKey());
                dto.setParamLabel(param.getParamLabel());
                dto.setNumericValue(param.getNumericValue());
                dto.setCategory(param.getCategory());
                dto.setEffectiveFrom(param.getEffectiveFrom());
                dto.setActive(param.getActive());
                return dto;
            }).toList();
    }

    /**
     * PUT /regulatory-params/:id : Updates an existing regulatoryParam.
     * SÉCURITÉ : Seul l'ADMIN peut modifier un taux de paie.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RegulatoryParamDTO> updateRegulatoryParam(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody RegulatoryParamDTO regulatoryParamDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update RegulatoryParam : {}, {}", id, regulatoryParamDTO);
        if (regulatoryParamDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, regulatoryParamDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }
        if (!regulatoryParamRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        regulatoryParamDTO = regulatoryParamService.update(regulatoryParamDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, regulatoryParamDTO.getId().toString()))
            .body(regulatoryParamDTO);
    }

    @PostMapping("")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<RegulatoryParamDTO> createRegulatoryParam(@Valid @RequestBody RegulatoryParamDTO regulatoryParamDTO)
        throws URISyntaxException {
        // ... (code identique à votre version mais avec @PreAuthorize)
        if (regulatoryParamDTO.getId() != null) {
            throw new BadRequestAlertException("A new regulatoryParam cannot already have an ID", ENTITY_NAME, "idexists");
        }
        regulatoryParamDTO = regulatoryParamService.save(regulatoryParamDTO);
        return ResponseEntity.created(new URI("/api/regulatory-params/" + regulatoryParamDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, regulatoryParamDTO.getId().toString()))
            .body(regulatoryParamDTO);
    }

    @GetMapping("")
    public List<RegulatoryParamDTO> getAllRegulatoryParams() {
        LOG.debug("REST request to get all RegulatoryParams");
        return regulatoryParamService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RegulatoryParamDTO> getRegulatoryParam(@PathVariable("id") Long id) {
        LOG.debug("REST request to get RegulatoryParam : {}", id);
        Optional<RegulatoryParamDTO> regulatoryParamDTO = regulatoryParamService.findOne(id);
        return ResponseUtil.wrapOrNotFound(regulatoryParamDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteRegulatoryParam(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete RegulatoryParam : {}", id);
        regulatoryParamService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
