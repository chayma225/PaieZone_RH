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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.ContractQueryService;
import tn.paiezone.rh.service.criteria.ContractCriteria;
import tn.paiezone.rh.service.dto.ContractDTO;
import tn.paiezone.rh.service.impl.ContractServiceImpl;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/contracts")
public class ContractResource {

    private static final Logger LOG = LoggerFactory.getLogger(ContractResource.class);
    private static final String ENTITY_NAME = "contract";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final ContractServiceImpl contractService;
    private final ContractRepository contractRepository;
    private final ContractQueryService contractQueryService;

    public ContractResource(
        ContractServiceImpl contractService,
        ContractRepository contractRepository,
        ContractQueryService contractQueryService
    ) {
        this.contractService = contractService;
        this.contractRepository = contractRepository;
        this.contractQueryService = contractQueryService;
    }

    @PostMapping("")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "CREATE", entityType = "Contract")
    public ResponseEntity<ContractDTO> createContract(@Valid @RequestBody ContractDTO contractDTO) throws URISyntaxException {
        LOG.debug("REST request to save Contract : {}", contractDTO);
        if (contractDTO.getId() != null) {
            throw new BadRequestAlertException("Un nouveau contrat ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        contractDTO = contractService.save(contractDTO);
        return ResponseEntity.created(new URI("/api/contracts/" + contractDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, contractDTO.getId().toString()))
            .body(contractDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "UPDATE", entityType = "Contract")
    public ResponseEntity<ContractDTO> updateContract(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ContractDTO contractDTO
    ) throws URISyntaxException {
        if (contractDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, contractDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!contractRepository.existsById(id)) {
            throw new BadRequestAlertException("Contrat introuvable.", ENTITY_NAME, "idnotfound");
        }
        contractDTO = contractService.update(contractDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, contractDTO.getId().toString()))
            .body(contractDTO);
    }

    // ── Activer un contrat ────────────────────────────────────────────────────
    @PutMapping("/{id}/activate")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "ACTIVATE", entityType = "Contract")
    public ResponseEntity<ContractDTO> activateContract(@PathVariable Long id) {
        LOG.debug("REST request to activate Contract : {}", id);
        ContractDTO result = contractService.activate(id);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    // ── Terminer un contrat ───────────────────────────────────────────────────
    @PutMapping("/{id}/terminate")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "')"
    )
    @Auditable(action = "TERMINATE", entityType = "Contract")
    public ResponseEntity<ContractDTO> terminateContract(@PathVariable Long id) {
        LOG.debug("REST request to terminate Contract : {}", id);
        ContractDTO result = contractService.terminate(id);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    @GetMapping("")
    public ResponseEntity<List<ContractDTO>> getAllContracts(
        ContractCriteria criteria,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        Page<ContractDTO> page = contractQueryService.findByCriteria(criteria, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractDTO> getContract(@PathVariable("id") Long id) {
        Optional<ContractDTO> contractDTO = contractService.findOne(id);
        return ResponseUtil.wrapOrNotFound(contractDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "DELETE", entityType = "Contract")
    public ResponseEntity<Void> deleteContract(@PathVariable("id") Long id) {
        contractService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
