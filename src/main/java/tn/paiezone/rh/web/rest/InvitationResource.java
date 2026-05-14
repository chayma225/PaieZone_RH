package tn.paiezone.rh.web.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.paiezone.rh.domain.User;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.InvitationService;
import tn.paiezone.rh.service.dto.AdminUserDTO;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

/**
 * REST controller pour le flux d'invitation utilisateur.
 *
 * POST /api/invitations           → Admin/RH envoie une invitation
 * POST /api/account/invitation/finish → L'invité active son compte
 */
@RestController
@RequestMapping("/api")
public class InvitationResource {

    private static final Logger log = LoggerFactory.getLogger(InvitationResource.class);

    private final InvitationService invitationService;

    public InvitationResource(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    /**
     * Envoyer une invitation à un nouvel utilisateur.
     * Réservé aux Admin et RH.
     */
    @PostMapping("/invitations")
    @PreAuthorize(
        "hasAnyAuthority('" +
            AuthoritiesConstants.ADMIN +
            "', '" +
            AuthoritiesConstants.RH_COMPTABLE +
            "', '" +
            AuthoritiesConstants.SUPER_ADMIN +
            "')"
    )
    public ResponseEntity<Void> sendInvitation(@Valid @RequestBody InvitationRequest request, HttpServletRequest httpRequest) {
        log.info("[Invitation] Envoi d'invitation à : {}", request.email());

        AdminUserDTO userDTO = new AdminUserDTO();
        userDTO.setLogin(request.login());
        userDTO.setFirstName(request.firstName());
        userDTO.setLastName(request.lastName());
        userDTO.setEmail(request.email());
        userDTO.setLangKey("fr");
        userDTO.setActivated(false);
        userDTO.setAuthorities(request.authorities() != null ? request.authorities() : Set.of(AuthoritiesConstants.EMPLOYE));

        String baseUrl = extractBaseUrl(httpRequest);

        try {
            invitationService.inviteUser(userDTO, baseUrl);
        } catch (RuntimeException e) {
            throw new BadRequestAlertException(e.getMessage(), "invitation", "invitationError");
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Accepter l'invitation : définir le mot de passe et activer le compte.
     * Endpoint public (accessible sans authentification).
     */
    @PostMapping("/account/invitation/finish")
    public ResponseEntity<Void> acceptInvitation(@Valid @RequestBody InvitationFinishRequest request) {
        log.info("[Invitation] Acceptation de l'invitation avec clé : {}", request.key());

        invitationService
            .acceptInvitation(request.key(), request.password())
            .orElseThrow(() ->
                new BadRequestAlertException(
                    "Lien d'invitation invalide ou expiré. Demandez une nouvelle invitation.",
                    "invitation",
                    "invalidKey"
                )
            );

        return ResponseEntity.ok().build();
    }

    private String extractBaseUrl(HttpServletRequest request) {
        String scheme = request.getScheme();
        String serverName = request.getServerName();
        int port = request.getServerPort();
        if ((scheme.equals("http") && port == 80) || (scheme.equals("https") && port == 443)) {
            return scheme + "://" + serverName;
        }
        return scheme + "://" + serverName + ":" + port;
    }

    // ── DTOs inline ────────────────────────────────────────────────

    public record InvitationRequest(
        @NotBlank @Size(min = 1, max = 50) String login,
        @NotBlank @Size(max = 50) String firstName,
        @NotBlank @Size(max = 50) String lastName,
        @NotBlank @Email @Size(max = 254) String email,
        Set<String> authorities
    ) {}

    public record InvitationFinishRequest(@NotBlank String key, @NotBlank @Size(min = 8, max = 100) String password) {}
}
