package tn.paiezone.rh.service;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import dev.samstevens.totp.util.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.repository.UserProfileRepository;
import tn.paiezone.rh.web.rest.errors.BadRequestAlertException;

@Service
@Transactional
public class TwoFactorAuthService {

    private static final Logger LOG = LoggerFactory.getLogger(TwoFactorAuthService.class);
    private static final String ENTITY_NAME = "twoFactorAuth";
    private static final String ISSUER = "PaieZoneRH";

    private final UserProfileRepository userProfileRepository;
    private final SecretGenerator secretGenerator;
    private final CodeVerifier codeVerifier;

    public TwoFactorAuthService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
        this.secretGenerator = new DefaultSecretGenerator();
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator();
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);
    }

    public String generateSecret(String jhiUserId) {
        LOG.debug("Generating 2FA secret for user : {}", jhiUserId);
        String secret = secretGenerator.generate();
        userProfileRepository
            .findByJhiUserId(jhiUserId)
            .ifPresentOrElse(
                userProfile -> {
                    userProfile.setTwoFactorSecret(secret);
                    userProfile.setTwoFactorEnabled(false);
                    userProfileRepository.save(userProfile);
                },
                () -> {
                    throw new BadRequestAlertException("Profil utilisateur introuvable pour : " + jhiUserId, ENTITY_NAME, "userNotFound");
                }
            );
        return secret;
    }

    public String generateQRUrl(String jhiUserId, String secret) {
        LOG.debug("Generating QR URL for user : {}", jhiUserId);
        QrData data = new QrData.Builder()
            .label(jhiUserId)
            .secret(secret)
            .issuer(ISSUER)
            .algorithm(HashingAlgorithm.SHA1)
            .digits(6)
            .period(30)
            .build();
        try {
            QrGenerator generator = new ZxingPngQrGenerator();
            byte[] imageData = generator.generate(data);
            String mimeType = generator.getImageMimeType();
            return Utils.getDataUriForImage(imageData, mimeType);
        } catch (Exception e) {
            LOG.error("Erreur génération QR Code : {}", e.getMessage());
            return data.getUri();
        }
    }

    public boolean verifyAndEnable(String jhiUserId, int code) {
        LOG.debug("Verifying 2FA code for user : {}", jhiUserId);
        return userProfileRepository
            .findByJhiUserId(jhiUserId)
            .map(userProfile -> {
                String secret = userProfile.getTwoFactorSecret();
                if (secret == null) {
                    throw new BadRequestAlertException("Le 2FA n'a pas été initialisé.", ENTITY_NAME, "secretNotFound");
                }
                boolean valid = codeVerifier.isValidCode(secret, String.valueOf(code));
                if (valid) {
                    userProfile.setTwoFactorEnabled(true);
                    userProfileRepository.save(userProfile);
                }
                return valid;
            })
            .orElseThrow(() -> new BadRequestAlertException("Profil utilisateur introuvable.", ENTITY_NAME, "userNotFound"));
    }

    public boolean verifyCode(String jhiUserId, String code) {
        LOG.debug("Verifying 2FA code at login for user : {}", jhiUserId);
        return userProfileRepository
            .findByJhiUserId(jhiUserId)
            .map(userProfile -> {
                if (!Boolean.TRUE.equals(userProfile.getTwoFactorEnabled())) {
                    return true;
                }
                return codeVerifier.isValidCode(userProfile.getTwoFactorSecret(), code);
            })
            .orElse(true);
    }

    public void disable(String jhiUserId) {
        LOG.debug("Disabling 2FA for user : {}", jhiUserId);
        userProfileRepository
            .findByJhiUserId(jhiUserId)
            .ifPresent(userProfile -> {
                userProfile.setTwoFactorEnabled(false);
                userProfile.setTwoFactorSecret(null);
                userProfileRepository.save(userProfile);
            });
    }
}
