package tn.paiezone.rh.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import tn.paiezone.rh.repository.HrDocumentRepository;
import tn.paiezone.rh.service.HrDocumentService;
import tn.paiezone.rh.service.dto.HrDocumentDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link tn.paiezone.rh.domain.HrDocument}.
 */
@RestController
@RequestMapping("/api/hr-documents")
public class HrDocumentResource {

    private static final Logger LOG = LoggerFactory.getLogger(HrDocumentResource.class);

    private static final String ENTITY_NAME = "hrDocument";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final HrDocumentService hrDocumentService;

    private final HrDocumentRepository hrDocumentRepository;

    public HrDocumentResource(HrDocumentService hrDocumentService, HrDocumentRepository hrDocumentRepository) {
        this.hrDocumentService = hrDocumentService;
        this.hrDocumentRepository = hrDocumentRepository;
    }

    /**
     * {@code POST  /hr-documents} : Create a new hrDocument.
     *
     * @param hrDocumentDTO the hrDocumentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new hrDocumentDTO, or with status {@code 400 (Bad Request)} if the hrDocument has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<HrDocumentDTO> createHrDocument(@Valid @RequestBody HrDocumentDTO hrDocumentDTO) throws URISyntaxException {
        LOG.debug("REST request to save HrDocument : {}", hrDocumentDTO);
        if (hrDocumentDTO.getId() != null) {
            throw new BadRequestAlertException("A new hrDocument cannot already have an ID", ENTITY_NAME, "idexists");
        }
        hrDocumentDTO = hrDocumentService.save(hrDocumentDTO);
        return ResponseEntity.created(new URI("/api/hr-documents/" + hrDocumentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, hrDocumentDTO.getId().toString()))
            .body(hrDocumentDTO);
    }

    /**
     * {@code PUT  /hr-documents/:id} : Updates an existing hrDocument.
     *
     * @param id the id of the hrDocumentDTO to save.
     * @param hrDocumentDTO the hrDocumentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated hrDocumentDTO,
     * or with status {@code 400 (Bad Request)} if the hrDocumentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the hrDocumentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<HrDocumentDTO> updateHrDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody HrDocumentDTO hrDocumentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update HrDocument : {}, {}", id, hrDocumentDTO);
        if (hrDocumentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, hrDocumentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!hrDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        hrDocumentDTO = hrDocumentService.update(hrDocumentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, hrDocumentDTO.getId().toString()))
            .body(hrDocumentDTO);
    }

    /**
     * {@code PATCH  /hr-documents/:id} : Partial updates given fields of an existing hrDocument, field will ignore if it is null
     *
     * @param id the id of the hrDocumentDTO to save.
     * @param hrDocumentDTO the hrDocumentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated hrDocumentDTO,
     * or with status {@code 400 (Bad Request)} if the hrDocumentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the hrDocumentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the hrDocumentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<HrDocumentDTO> partialUpdateHrDocument(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody HrDocumentDTO hrDocumentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update HrDocument partially : {}, {}", id, hrDocumentDTO);
        if (hrDocumentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, hrDocumentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!hrDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<HrDocumentDTO> result = hrDocumentService.partialUpdate(hrDocumentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, hrDocumentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /hr-documents} : get all the Hr Documents, optionally filtered by employeeId.
     */
    @GetMapping("")
    public ResponseEntity<List<HrDocumentDTO>> getAllHrDocuments(
        @RequestParam(name = "employeeId.equals", required = false) Long employeeId,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get a page of HrDocuments, employeeId={}", employeeId);
        if (employeeId != null) {
            return ResponseEntity.ok(hrDocumentService.findByEmployee(employeeId));
        }
        Page<HrDocumentDTO> page = hrDocumentService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /hr-documents/:id} : get the "id" hrDocument.
     *
     * @param id the id of the hrDocumentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the hrDocumentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<HrDocumentDTO> getHrDocument(@PathVariable("id") Long id) {
        LOG.debug("REST request to get HrDocument : {}", id);
        Optional<HrDocumentDTO> hrDocumentDTO = hrDocumentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(hrDocumentDTO);
    }

    /**
     * {@code POST  /hr-documents/{id}/upload} : Upload un fichier pour un document existant.
     */
    @PostMapping(value = "/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<HrDocumentDTO> uploadFile(@PathVariable("id") Long id, @RequestParam("file") MultipartFile file)
        throws IOException {
        LOG.debug("REST request to upload file for HrDocument : {}", id);
        if (!hrDocumentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }
        HrDocumentDTO dto = hrDocumentService
            .findOne(id)
            .orElseThrow(() -> new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));

        dto.setFileData(file.getBytes());
        dto.setFileDataContentType(file.getContentType());
        dto.setFileSize(file.getSize());
        if (dto.getMimeType() == null) dto.setMimeType(file.getContentType());

        HrDocumentDTO result = hrDocumentService.update(dto);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .body(result);
    }

    /**
     * {@code GET  /hr-documents/{id}/file} : Télécharge le fichier binaire du document.
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> downloadFile(@PathVariable("id") Long id) {
        LOG.debug("REST request to download file for HrDocument : {}", id);
        return hrDocumentService
            .findOne(id)
            .filter(dto -> dto.getFileData() != null)
            .map(dto -> {
                String contentType =
                    dto.getFileDataContentType() != null ? dto.getFileDataContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"document-" + id + "\"")
                    .body(dto.getFileData());
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * {@code DELETE  /hr-documents/:id} : delete the "id" hrDocument.
     *
     * @param id the id of the hrDocumentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHrDocument(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete HrDocument : {}", id);
        hrDocumentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
