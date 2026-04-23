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

                    // Si le code expire dans plus de 4min 50s, c'est qu'on vient d'en envoyer un.
                    // On bloque le deuxième envoi.
                    if (expiry - now > 290000) {
                        return true;
                    }
                }

                String code = String.format("%06d", new java.util.Random().nextInt(999999));
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

                String[] parts = stored.split("\\|");
                String storedCode = parts[0];

                // On affiche exactement ce qu'on compare avec des crochets
                LOG.info("COMPARAISON -> Saisi: [{}] | En base: [{}]", code, storedCode);

                boolean valid = storedCode.trim().equals(code.trim());

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
