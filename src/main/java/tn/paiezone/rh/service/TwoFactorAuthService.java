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

                String stored = userProfile.getTwoFactorSecret();
                if (stored != null && stored.contains("|")) {
                    long expiry = Long.parseLong(stored.split("\\|")[1]);
                    long now = Instant.now().toEpochMilli();
                    // Code encore valide → ne pas renvoyer un nouveau mail
                    if (expiry > now) {
                        return true;
                    }
                }

                String code = String.format("%06d", new java.util.Random().nextInt(1000000));
                userProfile.setTwoFactorSecret(code + "|" + Instant.now().plus(5, java.time.temporal.ChronoUnit.MINUTES).toEpochMilli());

                userProfileRepository.saveAndFlush(userProfile); // On force l'enregistrement immédiat

                userRepository
                    .findOneByLogin(login)
                    .ifPresent(user -> {
                        mailService.send2FACode(user, code);
                    });

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
                if (stored == null || !stored.contains("|")) {
                    LOG.error("ERREUR : Aucun code trouvé en base pour {}", login);
                    return false;
                }

                String[] parts = stored.split("\\|", 2);
                String storedCode = parts[0].trim();
                long expiry = Long.parseLong(parts[1]);
                long now = Instant.now().toEpochMilli();

                if (now > expiry) {
                    LOG.error("CODE EXPIRÉ pour {}", login);
                    userProfile.setTwoFactorSecret(null);
                    userProfileRepository.save(userProfile);
                    return false;
                }

                LOG.info("COMPARAISON -> Saisi: [{}] | En base: [{}]", code, storedCode);
                boolean valid = storedCode.equals(code.trim());

                if (valid) {
                    userProfile.setTwoFactorSecret(null);
                    userProfileRepository.save(userProfile);
                    LOG.info("CODE VALIDE !");
                } else {
                    LOG.error("CODE INVALIDE !");
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
