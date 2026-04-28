package tn.paiezone.rh.service;

import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.paiezone.rh.domain.Contract;
import tn.paiezone.rh.domain.enumeration.ContractStatus;
import tn.paiezone.rh.repository.ContractRepository;
import tn.paiezone.rh.repository.UserRepository;

@Service
public class ContractExpirationScheduler {

    private static final Logger LOG = LoggerFactory.getLogger(ContractExpirationScheduler.class);

    private final ContractRepository contractRepository;
    private final MailService mailService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ContractExpirationScheduler(
        ContractRepository contractRepository,
        MailService mailService,
        UserRepository userRepository,
        NotificationService notificationService
    ) {
        this.contractRepository = contractRepository;
        this.mailService = mailService;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ── CONFIGURATION TEST : Exécution toutes les minutes ────────────────────
    // Cron original pour la production : "0 0 8 * * *"
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkExpiringContracts() {
        LOG.info("Début du scan quotidien des contrats arrivant à expiration...");
        LocalDate today = LocalDate.now();

        // Alertes J-30, J-15, J-7
        checkAndNotify(today, today.plusDays(30), "30 jours");
        checkAndNotify(today, today.plusDays(15), "15 jours");
        checkAndNotify(today, today.plusDays(7), "7 jours");

        // Expirer les contrats dépassés
        expireContracts(today);

        LOG.info("🧪 [TEST MODE] Scan terminé.");
    }

    private void checkAndNotify(LocalDate from, LocalDate to, String delayLabel) {
        List<Contract> contracts = contractRepository.findByStatusAndEndDateBetween(ContractStatus.ACTIVE, from, to);

        if (!contracts.isEmpty()) {
            LOG.info("🔔 TEST : {} contrat(s) détecté(s) pour le palier : {}", contracts.size(), delayLabel);
        }

        for (Contract contract : contracts) {
            try {
                sendExpirationEmail(contract, delayLabel);
                notificationService.createContractExpirationNotification(contract, delayLabel);
                LOG.info("✅ Notification et Email générés pour le contrat : {}", contract.getReference());
            } catch (Exception e) {
                LOG.error("❌ Erreur traitement contrat {} : {}", contract.getReference(), e.getMessage());
            }
        }
    }

    @Transactional
    public void expireContracts(LocalDate today) {
        List<Contract> expired = contractRepository.findByStatusAndEndDateBetween(ContractStatus.ACTIVE, today.minusDays(1), today);

        for (Contract contract : expired) {
            contract.setStatus(ContractStatus.EXPIRED);
            contractRepository.save(contract);
            LOG.info("📅 [TEST] Contrat {} marqué comme EXPIRÉ", contract.getReference());
        }
    }

    private void sendExpirationEmail(Contract contract, String delayLabel) {
        if (contract.getEmployee() == null) return;

        String subject = "⚠️ TEST PaieZone RH — Expiration dans " + delayLabel;
        String content = String.format(
            """
            Bonjour,

            ⚠️ ALERTE EXPIRATION DE CONTRAT (MODE TEST)

            Le contrat suivant arrive à expiration dans %s :

            📋 Référence     : %s
            👤 Employé       : %s %s (Matricule : %s)
            📅 Date de fin   : %s
            📝 Type          : %s
            💰 Salaire       : %s TND

            Conformément à la Loi de Finances 2026 Tunisie,
            un CDD avec 2 renouvellements devient automatiquement un CDI.

            — Système PaieZone RH (Automated Test)
            """,
            delayLabel,
            contract.getReference(),
            contract.getEmployee().getFirstName(),
            contract.getEmployee().getLastName(),
            contract.getEmployee().getMatricule(),
            contract.getEndDate(),
            contract.getContractType(),
            contract.getBaseSalary()
        );

        userRepository
            .findAll()
            .stream()
            .filter(u -> u.isActivated() && u.getEmail() != null)
            .filter(u ->
                u
                    .getAuthorities()
                    .stream()
                    .anyMatch(
                        a ->
                            a.getName().equals("ROLE_ADMIN") ||
                            a.getName().equals("ROLE_RH_COMPTABLE") ||
                            a.getName().equals("ROLE_SUPER_ADMIN")
                    )
            )
            .forEach(u -> {
                try {
                    mailService.sendEmail(u.getEmail(), subject, content, false, false);
                    LOG.info("📧 Email de test envoyé avec succès à : {}", u.getEmail());
                } catch (Exception e) {
                    LOG.warn("❌ Échec envoi email à {} : {}", u.getEmail(), e.getMessage());
                }
            });
    }
}
