package tn.paiezone.rh.service;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Seeder automatique — s'exécute une seule fois au démarrage de l'application.
 *
 * Pour CHAQUE entreprise active (tenant), il vérifie si knowledge_document
 * est vide et insère les documents de référence si nécessaire.
 *
 * Résultat : aucun admin n'a besoin de toucher pgAdmin ou curl.
 */
@Component
public class KnowledgeDocumentSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeDocumentSeeder.class);

    private final DataSource dataSource;

    public KnowledgeDocumentSeeder(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("=== KnowledgeDocumentSeeder : démarrage ===");
        try {
            seedPublicSchema();
        } catch (Exception e) {
            log.warn("Impossible de seeder knowledge_document : {}", e.getMessage());
        }
        log.info("=== KnowledgeDocumentSeeder : terminé ===");
    }

    // knowledge_document est une table globale dans le schéma public (non per-tenant)
    private void seedPublicSchema() throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            ResultSet rs = conn.createStatement().executeQuery("SELECT COUNT(*) FROM knowledge_document WHERE active = true");
            rs.next();
            long count = rs.getLong(1);

            if (count > 0) {
                log.debug("Knowledge documents déjà présents ({} documents) — seeder ignoré", count);
                return;
            }

            insertDocuments(conn, "public");
            log.info("✓ Knowledge documents insérés dans le schéma public");
        }
    }

    private void insertDocuments(Connection conn, String schema) throws SQLException {
        String sql =
            "INSERT INTO knowledge_document (title, content, category, keywords, active, created_at) VALUES (?, ?, ?, ?, true, NOW())";

        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            // ── Document 1 : Congés ──────────────────────────────────────
            addDoc(
                ps,
                "Types de congés légaux en Tunisie",
                "Congé annuel payé : 1 jour ouvrable par mois travaillé (minimum 12 jours/an, 18 jours après 10 ans d'ancienneté).\n" +
                    "Congé maladie : sur certificat médical. CNSS indemnise à partir du 4ème jour (66,67% du salaire journalier moyen).\n" +
                    "Congé maternité : 30 jours + 15 jours si complications, pris en charge par la CNSS.\n" +
                    "Congé paternité : 1 jour (secteur privé).\n" +
                    "Congé sans solde : accordé à la discrétion de l'employeur, non rémunéré.\n" +
                    "Procédure dans PaieZone RH : Menu Congés > Nouvelle demande > choisir le type > saisir les dates > envoyer pour validation Manager puis RH.",
                "CONGE",
                "congé,conge,vacances,maladie,maternité,paternité,absence,repos,arrêt,solde,annuel"
            );

            // ── Document 2 : CNSS / IRPP ─────────────────────────────────
            addDoc(
                ps,
                "Cotisations CNSS, CAVIS et barème IRPP 2026",
                "COTISATIONS SALARIALES 2026 :\n" +
                    "- CNSS (part salariale) : 9,18% à 9,68% du salaire brut\n" +
                    "- CAVIS : 1% du salaire brut\n" +
                    "- Total retenues : environ 10,18% à 10,68%\n\n" +
                    "BAREME IRPP 2026 (revenus annuels nets imposables) :\n" +
                    "  0%  → de 0 à 5 000 DT\n" +
                    "  15% → de 5 001 à 20 000 DT\n" +
                    "  20% → de 20 001 à 30 000 DT\n" +
                    "  26% → de 30 001 à 50 000 DT\n" +
                    "  28% → de 50 001 à 100 000 DT\n" +
                    "  35% → au-delà de 100 000 DT\n\n" +
                    "DEDUCTIONS :\n" +
                    "- Frais professionnels : 10% du brut (plafond 2 000 DT/an)\n" +
                    "- CNSS et CAVIS déductibles de l'assiette imposable\n\n" +
                    "HEURES SUPPLEMENTAIRES :\n" +
                    "- +25% jours ouvrables, +50% nuit/vendredi/fériés",
                "PAIE",
                "cnss,irpp,cavis,cotisation,salaire,brut,net,retenue,impôt,heures supplémentaires,bulletin,paie,calcul,taux"
            );

            // ── Document 3 : Contrats ────────────────────────────────────
            addDoc(
                ps,
                "Types de contrats de travail — LF 2026 Tunisie",
                "CDI (Contrat à Durée Indéterminée) : contrat permanent. Rupture par démission ou licenciement avec préavis.\n\n" +
                    "CDD (Contrat à Durée Déterminée) : durée cumulée max 4 ans, renouvelable 2 fois maximum. Après la 2ème reconduction, transformation automatique en CDI obligatoire.\n\n" +
                    "CIVP (Contrat d'Insertion à la Vie Professionnelle) : jeunes diplômés moins de 30 ans, premier emploi, durée max 1 an, salaire subventionné par l'État.\n\n" +
                    "KARAMA : programme national emploi jeunes et chômeurs, l'État prend en charge une partie du salaire et des cotisations.\n\n" +
                    "Intérim : via agence de travail temporaire, max 3 mois renouvelable.\n\n" +
                    "Stage : période apprentissage pratique, rémunération selon accord (SMIG proratisé conseillé).",
                "CONTRAT",
                "contrat,cdi,cdd,civp,karama,intérim,stage,emploi,durée,renouvellement,reconduction,rupture,préavis"
            );

            // ── Document 4 : Licenciement ────────────────────────────────
            addDoc(
                ps,
                "Procédure de licenciement et indemnités en Tunisie",
                "MOTIFS VALABLES DE LICENCIEMENT :\n" +
                    "- Faute grave (absence injustifiée > 3 jours, violence, vol)\n" +
                    "- Faute simple répétée malgré avertissements écrits\n" +
                    "- Raisons économiques (restructuration, difficultés financières)\n\n" +
                    "PROCEDURE :\n" +
                    "1. Avertissement écrit préalable (sauf faute grave)\n" +
                    "2. Convocation à entretien préalable (lettre recommandée, 3 jours délai)\n" +
                    "3. Entretien avec PV signé\n" +
                    "4. Notification de licenciement par écrit\n\n" +
                    "INDEMNITES LEGALES :\n" +
                    "- Indemnité de licenciement : 1 jour de salaire/mois travaillé (max 3 mois) si ancienneté > 1 an\n" +
                    "- Préavis : 8 jours (< 1 an), 1 mois (1-5 ans), 2 mois (> 5 ans)\n" +
                    "- En cas de faute grave : aucune indemnité ni préavis",
                "CONTRAT",
                "licenciement,licencier,renvoyer,rupture,préavis,indemnité,faute,motif,tribunal,démission"
            );

            // ── Document 5 : Lire un bulletin ───────────────────────────
            addDoc(
                ps,
                "Comment lire un bulletin de paie tunisien",
                "STRUCTURE D'UN BULLETIN DE PAIE :\n\n" +
                    "SECTION BRUT :\n" +
                    "- Salaire de base (selon contrat)\n" +
                    "- Primes et indemnités (transport, logement, panier...)\n" +
                    "- Heures supplémentaires\n" +
                    "= SALAIRE BRUT\n\n" +
                    "DEDUCTIONS SALARIALES :\n" +
                    "- CNSS : 9,18% à 9,68% du brut\n" +
                    "- CAVIS : 1% du brut\n" +
                    "= SALAIRE NET IMPOSABLE\n\n" +
                    "CALCUL IRPP :\n" +
                    "- Abattement frais professionnels 10% (plafond 2 000 DT/an)\n" +
                    "- Barème progressif 2026\n" +
                    "= IRPP mensuel\n\n" +
                    "SALAIRE NET À PAYER = Brut - CNSS - CAVIS - IRPP mensuel\n\n" +
                    "Pour consulter votre bulletin dans PaieZone RH : Menu Bulletins > sélectionner la période.",
                "PAIE",
                "bulletin,fiche de paie,salaire net,salaire brut,déductions,primes,indemnités,lire,comprendre,net à payer"
            );

            ps.executeBatch();
        }
    }

    private void addDoc(PreparedStatement ps, String title, String content, String category, String keywords) throws SQLException {
        ps.setString(1, title);
        ps.setString(2, content);
        ps.setString(3, category);
        ps.setString(4, keywords);
        ps.addBatch();
    }
}
