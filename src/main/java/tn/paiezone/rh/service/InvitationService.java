package tn.paiezone.rh.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.jhipster.security.RandomUtil;
import tn.paiezone.rh.domain.Authority;
import tn.paiezone.rh.domain.User;
import tn.paiezone.rh.repository.AuthorityRepository;
import tn.paiezone.rh.repository.UserRepository;
import tn.paiezone.rh.security.AuthoritiesConstants;
import tn.paiezone.rh.service.dto.AdminUserDTO;

/**
 * Flux d'invitation par email :
 * 1. L'Admin/RH appelle inviteUser() → crée le compte (activated=false) + envoie email
 * 2. L'invité reçoit un lien avec son invitationKey (valable 7 jours)
 * 3. L'invité appelle acceptInvitation() → définit son mot de passe et active le compte
 */
@Service
@Transactional
public class InvitationService {

    private static final Logger log = LoggerFactory.getLogger(InvitationService.class);

    private final UserRepository userRepository;
    private final AuthorityRepository authorityRepository;
    private final MailService mailService;

    public InvitationService(UserRepository userRepository, AuthorityRepository authorityRepository, MailService mailService) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.mailService = mailService;
    }

    /**
     * Crée un compte non-activé et envoie l'email d'invitation.
     *
     * @param userDTO   données du futur utilisateur (login, email, firstName, lastName, authorities)
     * @param baseUrl   URL de base de l'application (pour le lien email)
     * @return          l'utilisateur créé
     */
    public User inviteUser(AdminUserDTO userDTO, String baseUrl) {
        // Vérifier si le login ou l'email existent déjà
        userRepository
            .findOneByLogin(userDTO.getLogin().toLowerCase())
            .ifPresent(existing -> {
                throw new RuntimeException("Login déjà utilisé : " + userDTO.getLogin());
            });
        userRepository
            .findOneByEmailIgnoreCase(userDTO.getEmail())
            .ifPresent(existing -> {
                throw new RuntimeException("Email déjà utilisé : " + userDTO.getEmail());
            });

        User user = new User();
        user.setLogin(userDTO.getLogin().toLowerCase());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail().toLowerCase());
        user.setLangKey(userDTO.getLangKey() != null ? userDTO.getLangKey() : "fr");
        user.setActivated(false);

        // Mot de passe temporaire aléatoire (inutilisable car not activated)
        user.setPassword("$2a$10$" + RandomUtil.generatePassword());

        // Token d'invitation via resetKey (valable 7 jours)
        user.setResetKey(RandomUtil.generateResetKey());
        user.setResetDate(Instant.now().plus(7, ChronoUnit.DAYS));

        // Rôles
        if (userDTO.getAuthorities() != null && !userDTO.getAuthorities().isEmpty()) {
            Set<Authority> authorities = userDTO
                .getAuthorities()
                .stream()
                .map(authorityRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toSet());
            user.setAuthorities(authorities);
        } else {
            Set<Authority> defaultAuth = new HashSet<>();
            authorityRepository.findById(AuthoritiesConstants.EMPLOYE).ifPresent(defaultAuth::add);
            user.setAuthorities(defaultAuth);
        }

        userRepository.save(user);
        log.info("[Invitation] Utilisateur créé (non-activé) : {}", user.getLogin());

        // Envoi email asynchrone
        sendInvitationEmail(user, baseUrl);

        return user;
    }

    /**
     * Accepte l'invitation : l'utilisateur définit son mot de passe et active son compte.
     *
     * @param invitationKey  token reçu par email (resetKey)
     * @param newPassword    nouveau mot de passe choisi par l'utilisateur
     * @return               l'utilisateur activé
     */
    public Optional<User> acceptInvitation(String invitationKey, String newPassword) {
        log.info("[Invitation] Acceptation avec clé {}", invitationKey);
        return userRepository
            .findOneByResetKey(invitationKey)
            // La clé d'invitation est stockée dans resetDate avec une date dans le futur (7 jours)
            .filter(user -> !user.isActivated())
            .filter(user -> user.getResetDate() != null && user.getResetDate().isAfter(Instant.now()))
            .map(user -> {
                // Encoder et sauvegarder le nouveau mot de passe
                String encoded = org.springframework.security.crypto.bcrypt.BCrypt.hashpw(
                    newPassword,
                    org.springframework.security.crypto.bcrypt.BCrypt.gensalt()
                );
                user.setPassword(encoded);
                user.setActivated(true);
                user.setResetKey(null);
                user.setResetDate(null);
                log.info("[Invitation] Compte activé : {}", user.getLogin());
                return user;
            });
    }

    private void sendInvitationEmail(User user, String baseUrl) {
        try {
            String invitationLink = baseUrl + "/account/invitation/finish?key=" + user.getResetKey();
            String subject = "Bienvenue sur PaieZone RH — Activez votre compte";
            String content = buildEmailContent(user, invitationLink);
            mailService.sendEmail(user.getEmail(), subject, content, false, true);
            log.info("[Invitation] Email envoyé à {}", user.getEmail());
        } catch (Exception e) {
            log.error("[Invitation] Erreur envoi email à {} : {}", user.getEmail(), e.getMessage());
        }
    }

    private String buildEmailContent(User user, String invitationLink) {
        return (
            "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='font-family:Arial,sans-serif;max-width:600px;margin:auto'>" +
            "<div style='background:#1a73e8;padding:20px;text-align:center'>" +
            "<h1 style='color:white;margin:0'>PaieZone RH</h1></div>" +
            "<div style='padding:30px;background:#f9f9f9'>" +
            "<h2>Bonjour " +
            user.getFirstName() +
            " " +
            user.getLastName() +
            " !</h2>" +
            "<p>Vous avez été invité(e) à rejoindre <strong>PaieZone RH</strong>.</p>" +
            "<p>Cliquez sur le bouton ci-dessous pour activer votre compte et définir votre mot de passe :</p>" +
            "<div style='text-align:center;margin:30px 0'>" +
            "<a href='" +
            invitationLink +
            "' style='background:#1a73e8;color:white;padding:14px 28px;" +
            "border-radius:6px;text-decoration:none;font-size:16px;font-weight:bold'>Activer mon compte</a></div>" +
            "<p style='color:#666;font-size:12px'>Ce lien expire dans 7 jours. " +
            "Si vous n'avez pas demandé ce compte, ignorez cet email.</p>" +
            "<p>Votre identifiant de connexion : <strong>" +
            user.getLogin() +
            "</strong></p>" +
            "</div>" +
            "<div style='padding:15px;text-align:center;color:#999;font-size:12px'>" +
            "<p>L'équipe PaieZone RH</p></div></body></html>"
        );
    }
}
