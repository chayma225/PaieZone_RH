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
import tn.paiezone.rh.aop.logging.audit.Auditable;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.UserProfileService;
import tn.paiezone.rh.service.dto.UserProfileDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/user-profiles")
public class UserProfileResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserProfileResource.class);
    private static final String ENTITY_NAME = "userProfile";

    @Value("${jhipster.clientApp.name:paieZoneRH}")
    private String applicationName;

    private final UserProfileService userProfileService;
    private final UserProfileRepository userProfileRepository;

    public UserProfileResource(UserProfileService userProfileService, UserProfileRepository userProfileRepository) {
        this.userProfileService = userProfileService;
        this.userProfileRepository = userProfileRepository;
    }

    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "CREATE", entityType = "UserProfile")
    public ResponseEntity<UserProfileDTO> createUserProfile(@Valid @RequestBody UserProfileDTO userProfileDTO) throws URISyntaxException {
        LOG.debug("REST request to save UserProfile : {}", userProfileDTO);
        if (userProfileDTO.getId() != null) {
            throw new BadRequestAlertException("Un nouveau profil ne peut pas déjà avoir un ID.", ENTITY_NAME, "idexists");
        }
        if (userProfileDTO.getJhiUserId() != null && userProfileRepository.existsByJhiUserId(userProfileDTO.getJhiUserId())) {
            throw new BadRequestAlertException(
                "Un profil existe déjà pour l'utilisateur '" + userProfileDTO.getJhiUserId() + "'.",
                ENTITY_NAME,
                "jhiUserIdExists"
            );
        }
        userProfileDTO = userProfileService.save(userProfileDTO);
        return ResponseEntity.created(new URI("/api/user-profiles/" + userProfileDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, userProfileDTO.getId().toString()))
            .body(userProfileDTO);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "UPDATE", entityType = "UserProfile")
    public ResponseEntity<UserProfileDTO> updateUserProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody UserProfileDTO userProfileDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update UserProfile : {}, {}", id, userProfileDTO);
        if (userProfileDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userProfileDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!userProfileRepository.existsById(id)) {
            throw new BadRequestAlertException("Profil utilisateur introuvable.", ENTITY_NAME, "idnotfound");
        }
        userProfileDTO = userProfileService.update(userProfileDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userProfileDTO.getId().toString()))
            .body(userProfileDTO);
    }

    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "PATCH", entityType = "UserProfile")
    public ResponseEntity<UserProfileDTO> partialUpdateUserProfile(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody UserProfileDTO userProfileDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UserProfile : {}, {}", id, userProfileDTO);
        if (userProfileDTO.getId() == null) {
            throw new BadRequestAlertException("ID invalide.", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userProfileDTO.getId())) {
            throw new BadRequestAlertException("ID non correspondant.", ENTITY_NAME, "idinvalid");
        }
        if (!userProfileRepository.existsById(id)) {
            throw new BadRequestAlertException("Profil utilisateur introuvable.", ENTITY_NAME, "idnotfound");
        }
        Optional<UserProfileDTO> result = userProfileService.partialUpdate(userProfileDTO);
        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, userProfileDTO.getId().toString())
        );
    }

    @GetMapping("")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    public List<UserProfileDTO> getAllUserProfiles() {
        LOG.debug("REST request to get all UserProfiles");
        return userProfileService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UserProfile : {}", id);
        Optional<UserProfileDTO> userProfileDTO = userProfileService.findOne(id);
        return ResponseUtil.wrapOrNotFound(userProfileDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + AuthoritiesConstants.ADMIN + "', '" + AuthoritiesConstants.SUPER_ADMIN + "')")
    @Auditable(action = "DELETE", entityType = "UserProfile")
    public ResponseEntity<Void> deleteUserProfile(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UserProfile : {}", id);
        userProfileService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
