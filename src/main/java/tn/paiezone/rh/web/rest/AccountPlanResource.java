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
import tn.paiezone.rh.repository.AccountPlanRepository;
import tn.paiezone.rh.service.AccountPlanService;
import tn.paiezone.rh.service.dto.AccountPlanDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.AccountPlan}.
 */
@RestController
@RequestMapping("/api/account-plans")
public class AccountPlanResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountPlanResource.class);

    private static final String ENTITY_NAME = "accountPlan";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AccountPlanService accountPlanService;

    private final AccountPlanRepository accountPlanRepository;

    public AccountPlanResource(AccountPlanService accountPlanService, AccountPlanRepository accountPlanRepository) {
        this.accountPlanService = accountPlanService;
        this.accountPlanRepository = accountPlanRepository;
    }

    /**
     * {@code POST  /account-plans} : Create a new accountPlan.
     *
     * @param accountPlanDTO the accountPlanDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new accountPlanDTO, or with status {@code 400 (Bad Request)} if the accountPlan has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<AccountPlanDTO> createAccountPlan(@Valid @RequestBody AccountPlanDTO accountPlanDTO) throws URISyntaxException {
        LOG.debug("REST request to save AccountPlan : {}", accountPlanDTO);
        if (accountPlanDTO.getId() != null) {
            throw new BadRequestAlertException("A new accountPlan cannot already have an ID", ENTITY_NAME, "idexists");
        }
        accountPlanDTO = accountPlanService.save(accountPlanDTO);
        return ResponseEntity.created(new URI("/api/account-plans/" + accountPlanDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, accountPlanDTO.getId().toString()))
            .body(accountPlanDTO);
    }

    /**
     * {@code PUT  /account-plans/:id} : Updates an existing accountPlan.
     *
     * @param id the id of the accountPlanDTO to save.
     * @param accountPlanDTO the accountPlanDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated accountPlanDTO,
     * or with status {@code 400 (Bad Request)} if the accountPlanDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the accountPlanDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AccountPlanDTO> updateAccountPlan(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AccountPlanDTO accountPlanDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update AccountPlan : {}, {}", id, accountPlanDTO);
        if (accountPlanDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, accountPlanDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!accountPlanRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        accountPlanDTO = accountPlanService.update(accountPlanDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, accountPlanDTO.getId().toString()))
            .body(accountPlanDTO);
    }

    /**
     * {@code PATCH  /account-plans/:id} : Partial updates given fields of an existing accountPlan, field will ignore if it is null
     *
     * @param id the id of the accountPlanDTO to save.
     * @param accountPlanDTO the accountPlanDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated accountPlanDTO,
     * or with status {@code 400 (Bad Request)} if the accountPlanDTO is not valid,
     * or with status {@code 404 (Not Found)} if the accountPlanDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the accountPlanDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AccountPlanDTO> partialUpdateAccountPlan(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AccountPlanDTO accountPlanDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update AccountPlan partially : {}, {}", id, accountPlanDTO);
        if (accountPlanDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, accountPlanDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!accountPlanRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AccountPlanDTO> result = accountPlanService.partialUpdate(accountPlanDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, accountPlanDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /account-plans} : get all the accountPlans.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of accountPlans in body.
     */
    @GetMapping("")
    public List<AccountPlanDTO> getAllAccountPlans() {
        LOG.debug("REST request to get all AccountPlans");
        return accountPlanService.findAll();
    }

    /**
     * {@code GET  /account-plans/:id} : get the "id" accountPlan.
     *
     * @param id the id of the accountPlanDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the accountPlanDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AccountPlanDTO> getAccountPlan(@PathVariable("id") Long id) {
        LOG.debug("REST request to get AccountPlan : {}", id);
        Optional<AccountPlanDTO> accountPlanDTO = accountPlanService.findOne(id);
        return ResponseUtil.wrapOrNotFound(accountPlanDTO);
    }

    /**
     * {@code DELETE  /account-plans/:id} : delete the "id" accountPlan.
     *
     * @param id the id of the accountPlanDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccountPlan(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete AccountPlan : {}", id);
        accountPlanService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
