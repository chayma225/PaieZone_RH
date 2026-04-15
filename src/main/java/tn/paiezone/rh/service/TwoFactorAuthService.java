package tn.paiezone.rh.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.repository.UserRepository;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@Service
@Transactional
public class TwoFactorAuthService {

    private static final Logger LOG = LoggerFactory.getLogger(TwoFactorAuthService.class);
    private static final String ENTITY_NAME = "twoFactorAuth";

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    public TwoFactorAuthService(UserProfileRepository userProfileRepository, UserRepository userRepository, MailService mailService) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    // ── Vérifier si 2FA est activé + envoyer le code par email ──────────────
    public boolean checkAndSendCode(String login) {
        return userProfileRepository
            .findByJhiUserId(login)
            .map(userProfile -> {
                if (!Boolean.TRUE.equals(userProfile.getTwoFactorEnabled())) {
                    return false;
                }
                // Générer code 6 chiffres
                String code = String.format("%06d", new SecureRandom().nextInt(999999));
                // Stocker le code temporairement avec expiration 5 min
                userProfile.setTwoFactorSecret(code + "|" + Instant.now().plus(5, ChronoUnit.MINUTES).toEpochMilli());
                userProfileRepository.save(userProfile);

                // Envoyer par email
                userRepository
                    .findOneByLogin(login)
                    .ifPresent(user -> {
                        mailService.send2FACode(user, code);
                    });

                LOG.debug("Code 2FA envoyé à : {}", login);
                return true;
            })
            .orElse(false);
    }

    // ── Vérifier le code saisi ────────────────────────────────────────────────
    public boolean verifyCode(String login, String code) {
        return userProfileRepository
            .findByJhiUserId(login)
            .map(userProfile -> {
                String stored = userProfile.getTwoFactorSecret();
                if (stored == null || !stored.contains("|")) return false;

                String[] parts = stored.split("\\|");
                String storedCode = parts[0];
                long expiry = Long.parseLong(parts[1]);

                // Vérifier expiration
                if (Instant.now().toEpochMilli() > expiry) {
                    LOG.debug("Code 2FA expiré pour : {}", login);
                    return false;
                }

                boolean valid = storedCode.equals(code.trim());
                if (valid) {
                    // Nettoyer le code après utilisation
                    userProfile.setTwoFactorSecret(null);
                    userProfileRepository.save(userProfile);
                }
                return valid;
            })
            .orElse(false);
    }

    // ── Activer/Désactiver 2FA ────────────────────────────────────────────────
    public void enable(String login) {
        userProfileRepository
            .findByJhiUserId(login)
            .ifPresent(userProfile -> {
                userProfile.setTwoFactorEnabled(true);
                userProfileRepository.save(userProfile);
            });
    }

    public void disable(String login) {
        userProfileRepository
            .findByJhiUserId(login)
            .ifPresent(userProfile -> {
                userProfile.setTwoFactorEnabled(false);
                userProfile.setTwoFactorSecret(null);
                userProfileRepository.save(userProfile);
            });
    }

    public boolean getStatusByLogin(String login) {
        return userProfileRepository
            .findByJhiUserId(login)
            .map(up -> Boolean.TRUE.equals(up.getTwoFactorEnabled()))
            .orElse(false);
    }
}
