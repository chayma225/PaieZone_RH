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
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.CompanySubscriptionRepository;
import tn.paiezone.rh.service.CompanySubscriptionService;
import tn.paiezone.rh.service.dto.CompanySubscriptionDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.CompanySubscription}.
 */
@RestController
@RequestMapping("/api/company-subscriptions")
public class CompanySubscriptionResource {

    private static final Logger LOG = LoggerFactory.getLogger(CompanySubscriptionResource.class);

    private static final String ENTITY_NAME = "companySubscription";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final CompanySubscriptionService companySubscriptionService;

    private final CompanySubscriptionRepository companySubscriptionRepository;

    public CompanySubscriptionResource(
        CompanySubscriptionService companySubscriptionService,
        CompanySubscriptionRepository companySubscriptionRepository
    ) {
        this.companySubscriptionService = companySubscriptionService;
        this.companySubscriptionRepository = companySubscriptionRepository;
    }

    /**
     * {@code POST  /company-subscriptions} : Create a new companySubscription.
     *
     * @param companySubscriptionDTO the companySubscriptionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new companySubscriptionDTO, or with status {@code 400 (Bad Request)} if the companySubscription has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CompanySubscriptionDTO> createCompanySubscription(
        @Valid @RequestBody CompanySubscriptionDTO companySubscriptionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save CompanySubscription : {}", companySubscriptionDTO);
        if (companySubscriptionDTO.getId() != null) {
            throw new BadRequestAlertException("A new companySubscription cannot already have an ID", ENTITY_NAME, "idexists");
        }
        companySubscriptionDTO = companySubscriptionService.save(companySubscriptionDTO);
        return ResponseEntity.created(new URI("/api/company-subscriptions/" + companySubscriptionDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, companySubscriptionDTO.getId().toString()))
            .body(companySubscriptionDTO);
    }

    /**
     * {@code PUT  /company-subscriptions/:id} : Updates an existing companySubscription.
     *
     * @param id the id of the companySubscriptionDTO to save.
     * @param companySubscriptionDTO the companySubscriptionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated companySubscriptionDTO,
     * or with status {@code 400 (Bad Request)} if the companySubscriptionDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the companySubscriptionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CompanySubscriptionDTO> updateCompanySubscription(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CompanySubscriptionDTO companySubscriptionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CompanySubscription : {}, {}", id, companySubscriptionDTO);
        if (companySubscriptionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, companySubscriptionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!companySubscriptionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        companySubscriptionDTO = companySubscriptionService.update(companySubscriptionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, companySubscriptionDTO.getId().toString()))
            .body(companySubscriptionDTO);
    }

    /**
     * {@code PATCH  /company-subscriptions/:id} : Partial updates given fields of an existing companySubscription, field will ignore if it is null
     *
     * @param id the id of the companySubscriptionDTO to save.
     * @param companySubscriptionDTO the companySubscriptionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated companySubscriptionDTO,
     * or with status {@code 400 (Bad Request)} if the companySubscriptionDTO is not valid,
     * or with status {@code 404 (Not Found)} if the companySubscriptionDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the companySubscriptionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CompanySubscriptionDTO> partialUpdateCompanySubscription(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CompanySubscriptionDTO companySubscriptionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CompanySubscription partially : {}, {}", id, companySubscriptionDTO);
        if (companySubscriptionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, companySubscriptionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!companySubscriptionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CompanySubscriptionDTO> result = companySubscriptionService.partialUpdate(companySubscriptionDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, companySubscriptionDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /company-subscriptions} : get all the Company Subscriptions.
     *
     * @param filter the filter of the request.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Company Subscriptions in body.
     */
    @GetMapping("")
    public List<CompanySubscriptionDTO> getAllCompanySubscriptions(@RequestParam(name = "filter", required = false) String filter) {
        if ("company-is-null".equals(filter)) {
            LOG.debug("REST request to get all CompanySubscriptions where company is null");
            return companySubscriptionService.findAllWhereCompanyIsNull();
        }
        LOG.debug("REST request to get all CompanySubscriptions");
        return companySubscriptionService.findAll();
    }

    /**
     * {@code GET  /company-subscriptions/:id} : get the "id" companySubscription.
     *
     * @param id the id of the companySubscriptionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the companySubscriptionDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CompanySubscriptionDTO> getCompanySubscription(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CompanySubscription : {}", id);
        Optional<CompanySubscriptionDTO> companySubscriptionDTO = companySubscriptionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(companySubscriptionDTO);
    }

    /**
     * {@code DELETE  /company-subscriptions/:id} : delete the "id" companySubscription.
     *
     * @param id the id of the companySubscriptionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompanySubscription(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CompanySubscription : {}", id);
        companySubscriptionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
