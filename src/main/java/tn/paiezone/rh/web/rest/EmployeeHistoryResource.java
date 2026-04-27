package tn.paiezone.rh.web.rest;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tn.paiezone.rh.service.EmployeeHistoryService;
import tn.paiezone.rh.service.dto.EmployeeHistoryDTO;

@RestController
@RequestMapping("/api/employee-histories")
public class EmployeeHistoryResource {

    private static final Logger LOG = LoggerFactory.getLogger(EmployeeHistoryResource.class);

    private final EmployeeHistoryService employeeHistoryService;

    public EmployeeHistoryResource(EmployeeHistoryService employeeHistoryService) {
        this.employeeHistoryService = employeeHistoryService;
    }

    // ── US-13 : Historique avec filtres ──────────────────────────────────────
    @GetMapping("")
    public ResponseEntity<List<EmployeeHistoryDTO>> getAllHistories(
        @RequestParam(required = false) String firstName,
        @RequestParam(required = false) String lastName,
        @RequestParam(required = false) Long departmentId,
        @RequestParam(required = false) Long positionId,
        @RequestParam(required = false) String fieldName,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get EmployeeHistories with filters");

        boolean hasFilters =
            (firstName != null && !firstName.isBlank()) ||
            (lastName != null && !lastName.isBlank()) ||
            departmentId != null ||
            positionId != null ||
            (fieldName != null && !fieldName.isBlank());

        Page<EmployeeHistoryDTO> page;

        if (hasFilters) {
            page = employeeHistoryService.findWithFilters(firstName, lastName, departmentId, positionId, fieldName, pageable);
        } else {
            page = employeeHistoryService.findAll(pageable);
        }

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    // ── Historique d'un employé spécifique ────────────────────────────────────
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<EmployeeHistoryDTO>> getHistoryByEmployee(
        @PathVariable Long employeeId,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get history for Employee : {}", employeeId);
        Page<EmployeeHistoryDTO> page = employeeHistoryService.findByEmployee(employeeId, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
