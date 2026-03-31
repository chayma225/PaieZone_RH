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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.AccountingEntryRepository;
import tn.paiezone.rh.service.AccountingEntryService;
import tn.paiezone.rh.service.dto.AccountingEntryDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.AccountingEntry}.
 */
@RestController
@RequestMapping("/api/accounting-entries")
public class AccountingEntryResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountingEntryResource.class);

    private static final String ENTITY_NAME = "accountingEntry";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final AccountingEntryService accountingEntryService;

    private final AccountingEntryRepository accountingEntryRepository;

    public AccountingEntryResource(AccountingEntryService accountingEntryService, AccountingEntryRepository accountingEntryRepository) {
        this.accountingEntryService = accountingEntryService;
        this.accountingEntryRepository = accountingEntryRepository;
    }

    /**
     * {@code POST  /accounting-entries} : Create a new accountingEntry.
     *
     * @param accountingEntryDTO the accountingEntryDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new accountingEntryDTO, or with status {@code 400 (Bad Request)} if the accountingEntry has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<AccountingEntryDTO> createAccountingEntry(@Valid @RequestBody AccountingEntryDTO accountingEntryDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save AccountingEntry : {}", accountingEntryDTO);
        if (accountingEntryDTO.getId() != null) {
            throw new BadRequestAlertException("A new accountingEntry cannot already have an ID", ENTITY_NAME, "idexists");
        }
        accountingEntryDTO = accountingEntryService.save(accountingEntryDTO);
        return ResponseEntity.created(new URI("/api/accounting-entries/" + accountingEntryDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, accountingEntryDTO.getId().toString()))
            .body(accountingEntryDTO);
    }

    /**
     * {@code PUT  /accounting-entries/:id} : Updates an existing accountingEntry.
     *
     * @param id the id of the accountingEntryDTO to save.
     * @param accountingEntryDTO the accountingEntryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated accountingEntryDTO,
     * or with status {@code 400 (Bad Request)} if the accountingEntryDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the accountingEntryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<AccountingEntryDTO> updateAccountingEntry(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AccountingEntryDTO accountingEntryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update AccountingEntry : {}, {}", id, accountingEntryDTO);
        if (accountingEntryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, accountingEntryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!accountingEntryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        accountingEntryDTO = accountingEntryService.update(accountingEntryDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, accountingEntryDTO.getId().toString()))
            .body(accountingEntryDTO);
    }

    /**
     * {@code PATCH  /accounting-entries/:id} : Partial updates given fields of an existing accountingEntry, field will ignore if it is null
     *
     * @param id the id of the accountingEntryDTO to save.
     * @param accountingEntryDTO the accountingEntryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated accountingEntryDTO,
     * or with status {@code 400 (Bad Request)} if the accountingEntryDTO is not valid,
     * or with status {@code 404 (Not Found)} if the accountingEntryDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the accountingEntryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<AccountingEntryDTO> partialUpdateAccountingEntry(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AccountingEntryDTO accountingEntryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update AccountingEntry partially : {}, {}", id, accountingEntryDTO);
        if (accountingEntryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, accountingEntryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!accountingEntryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AccountingEntryDTO> result = accountingEntryService.partialUpdate(accountingEntryDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, accountingEntryDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /accounting-entries} : get all the accountingEntries.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of accountingEntries in body.
     */
    @GetMapping("")
    public ResponseEntity<List<AccountingEntryDTO>> getAllAccountingEntries(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of AccountingEntries");
        Page<AccountingEntryDTO> page = accountingEntryService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /accounting-entries/:id} : get the "id" accountingEntry.
     *
     * @param id the id of the accountingEntryDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the accountingEntryDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AccountingEntryDTO> getAccountingEntry(@PathVariable("id") Long id) {
        LOG.debug("REST request to get AccountingEntry : {}", id);
        Optional<AccountingEntryDTO> accountingEntryDTO = accountingEntryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(accountingEntryDTO);
    }

    /**
     * {@code DELETE  /accounting-entries/:id} : delete the "id" accountingEntry.
     *
     * @param id the id of the accountingEntryDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccountingEntry(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete AccountingEntry : {}", id);
        accountingEntryService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
