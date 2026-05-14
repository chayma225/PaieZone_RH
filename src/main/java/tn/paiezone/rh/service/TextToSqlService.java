package tn.paiezone.rh.service;

import java.math.BigDecimal;
import java.sql.*;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import tn.paiezone.rh.domain.enumeration.IntentType;

@Service
public class TextToSqlService {

    private static final Logger log = LoggerFactory.getLogger(TextToSqlService.class);

    // ─────────────────────────────────────────────────────────────
    //  Schéma réel de la base (mis à jour : job_position + salaires)
    // ─────────────────────────────────────────────────────────────
    //
    //  employee     : id, matricule, first_name, last_name, hire_date, active,
    //                 salary_brut, salary_net, balance_conge,
    //                 company_id, department_id, user_profile_id, position_id
    //  department   : id, name, company_id
    //  job_position : id, title, department_id, company_id
    //
    // ─────────────────────────────────────────────────────────────

    private static final String SQL_PROMPT_ADMIN = """
        Tu es un expert SQL PostgreSQL. Génère UNIQUEMENT une requête SQL SELECT pure.
        AUCUNE explication. AUCUN ```. AUCUN point-virgule à la fin.
        Si impossible, réponds exactement : CANNOT_GENERATE

        SCHÉMA :
        employee(id, matricule, first_name, last_name, hire_date, active,
                 salary_brut, salary_net, balance_conge,
                 company_id, department_id, user_profile_id, position_id)
        department(id, name, company_id)
        job_position(id, title, department_id, company_id)

        RÈGLES :
        - Ne JAMAIS filtrer sur company_id (ajouté automatiquement)
        - Jointures disponibles :
            département  : JOIN department d ON e.department_id = d.id
            poste        : JOIN job_position jp ON e.position_id = jp.id
        - ILIKE pour les textes insensibles à la casse
        - ROUND(val,2) pour les montants
        - Alias lisibles en français : AS "Prénom", AS "Poste", etc.

        EXEMPLES :
        Q: Nombre d'employés actifs
        R: SELECT COUNT(*) AS "Employés actifs" FROM employee WHERE active = true

        Q: Liste des employés avec leur poste
        R: SELECT e.first_name AS "Prénom", e.last_name AS "Nom", jp.title AS "Poste" FROM employee e JOIN job_position jp ON e.position_id = jp.id WHERE e.active = true ORDER BY e.last_name

        Q: Employés du département RH
        R: SELECT e.first_name AS "Prénom", e.last_name AS "Nom", jp.title AS "Poste" FROM employee e JOIN department d ON e.department_id = d.id LEFT JOIN job_position jp ON e.position_id = jp.id WHERE d.name ILIKE '%rh%' AND e.active = true

        Q: Effectif par département
        R: SELECT d.name AS "Département", COUNT(*) AS "Effectif" FROM employee e JOIN department d ON e.department_id = d.id WHERE e.active = true GROUP BY d.name ORDER BY "Effectif" DESC

        Q: Masse salariale totale
        R: SELECT ROUND(SUM(salary_brut),2) AS "Masse brute (DT)", ROUND(SUM(salary_net),2) AS "Masse nette (DT)" FROM employee WHERE active = true

        Q: Salaire moyen par poste
        R: SELECT jp.title AS "Poste", COUNT(*) AS "Effectif", ROUND(AVG(e.salary_brut),2) AS "Salaire moyen (DT)" FROM employee e JOIN job_position jp ON e.position_id = jp.id WHERE e.active = true GROUP BY jp.title ORDER BY "Salaire moyen (DT)" DESC

        Q: Employés embauchés cette année
        R: SELECT first_name AS "Prénom", last_name AS "Nom", hire_date AS "Date d'embauche" FROM employee WHERE EXTRACT(YEAR FROM hire_date) = EXTRACT(YEAR FROM CURRENT_DATE) ORDER BY hire_date DESC

        Q: Liste des postes disponibles
        R: SELECT title AS "Poste", COUNT(e.id) AS "Employés" FROM job_position jp LEFT JOIN employee e ON e.position_id = jp.id GROUP BY jp.title ORDER BY jp.title

        QUESTION :""";

    private static final String SQL_PROMPT_EMPLOYEE = """
        Tu es un expert SQL PostgreSQL. Génère UNIQUEMENT une requête SQL SELECT pure.
        AUCUNE explication. AUCUN ```. AUCUN point-virgule à la fin.
        Si impossible, réponds exactement : CANNOT_GENERATE

        SCHÉMA :
        employee(id, matricule, first_name, last_name, hire_date, active,
                 salary_brut, salary_net, balance_conge,
                 company_id, department_id, user_profile_id, position_id)
        department(id, name, company_id)
        job_position(id, title, department_id, company_id)

        RÈGLES :
        - Ne JAMAIS filtrer sur user_profile_id ou company_id (ajoutés automatiquement)
        - Retourne UNE seule ligne (l'employé connecté)
        - Alias lisibles en français

        EXEMPLES :
        Q: Mon salaire net
        R: SELECT salary_net AS "Salaire net (DT)", salary_brut AS "Salaire brut (DT)" FROM employee

        Q: Mon solde de congés
        R: SELECT balance_conge AS "Solde de congés (jours)" FROM employee

        Q: Ma date d'embauche
        R: SELECT first_name AS "Prénom", last_name AS "Nom", hire_date AS "Date d'embauche" FROM employee

        Q: Mon poste
        R: SELECT jp.title AS "Poste", d.name AS "Département" FROM employee e JOIN job_position jp ON e.position_id = jp.id JOIN department d ON e.department_id = d.id

        Q: Mon matricule
        R: SELECT matricule AS "Matricule", first_name AS "Prénom", last_name AS "Nom" FROM employee

        Q: Mon ancienneté
        R: SELECT first_name AS "Prénom", last_name AS "Nom", hire_date AS "Embauché le", (CURRENT_DATE - hire_date) / 365 AS "Années d'ancienneté" FROM employee

        QUESTION :""";

    // ─────────────────────────────────────────────────────────────
    //  Sécurité — patterns précompilés (performance)
    // ─────────────────────────────────────────────────────────────

    private static final Set<String> DANGEROUS_KEYWORDS = Set.of(
        "drop",
        "delete",
        "update",
        "insert",
        "alter",
        "create",
        "truncate",
        "grant",
        "revoke",
        "execute",
        "exec",
        "call",
        "pg_sleep",
        "pg_read_file",
        "pg_write_file",
        "information_schema",
        "pg_catalog",
        "pg_stat",
        "copy",
        "dblink",
        "lo_import",
        "lo_export"
    );

    // Précompilé une seule fois au démarrage → ~10× plus rapide que recompiler à chaque appel
    private static final List<Pattern> DANGEROUS_PATTERNS = DANGEROUS_KEYWORDS.stream()
        .map(kw -> Pattern.compile("\\b" + Pattern.quote(kw) + "\\b", Pattern.CASE_INSENSITIVE))
        .collect(Collectors.toUnmodifiableList());

    private final OllamaService ollamaService;
    private final DataSource dataSource;

    public TextToSqlService(OllamaService ollamaService, DataSource dataSource) {
        this.ollamaService = ollamaService;
        this.dataSource = dataSource;
    }

    // ─────────────────────────────────────────────────────────────
    //  Point d'entrée principal
    // ─────────────────────────────────────────────────────────────

    public String processQuery(String question, IntentType intentType, UserSecurityContext ctx) {
        // Guard : contexte incomplet → message clair
        if (ctx.tenantSchema() == null) {
            return "⚠️ Contexte entreprise indisponible. Contactez votre administrateur.";
        }

        boolean isEmployee = intentType == IntentType.PERSONAL_SQL;
        String promptPrefix = isEmployee ? SQL_PROMPT_EMPLOYEE : SQL_PROMPT_ADMIN;

        log.info("[TextToSQL] intent={} user={} schema={}", intentType, ctx.login(), ctx.tenantSchema());

        // 1. Générer SQL (phi3, température 0.05 → déterministe)
        String rawSql = ollamaService.generateSql(promptPrefix, question);
        log.debug("[TextToSQL] brut : {}", rawSql);

        // 2. phi3 a refusé
        if (rawSql == null || rawSql.isBlank() || rawSql.contains("CANNOT_GENERATE")) {
            return (
                "🤔 Je n'arrive pas à formuler une requête pour cette question.\n" +
                "Exemples : *\"Combien d'employés actifs ?\"*, *\"Masse salariale totale ?\"*, *\"Quel est mon poste ?\"*"
            );
        }

        // 3. Nettoyer le SQL généré
        String cleanSql = extractAndCleanSql(rawSql);
        log.debug("[TextToSQL] nettoyé : {}", cleanSql);

        // 4. Validation sécurité
        String secErr = validateSql(cleanSql);
        if (secErr != null) {
            log.warn("[TextToSQL] SQL rejeté ({}) : {}", secErr, cleanSql);
            return "⚠️ Requête rejetée pour raisons de sécurité. Reformulez votre question.";
        }

        // 5. Injecter CTE sécurisée
        String secureSql = injectSecurityCte(cleanSql, ctx.userProfileId(), isEmployee);
        log.info("[TextToSQL] final : {}", secureSql);

        // 6. Exécuter
        try {
            List<Map<String, Object>> results = executeInTenantSchema(secureSql, ctx.tenantSchema());
            return formatResults(results);
        } catch (Exception e) {
            log.error("[TextToSQL] erreur : {}", e.getMessage());
            return "❌ " + simplifyError(e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────
    //  Détection d'intention
    // ─────────────────────────────────────────────────────────────

    public IntentType detectIntent(String message, boolean isAdmin) {
        String n = normalize(message);
        log.debug("[Intent] normalisé : '{}'", n);

        // Hors périmètre SQL (données globales SaaS)
        if (containsAny(n, "combien d entreprise", "nombre d entreprise", "liste des entreprise")) {
            return intent(IntentType.LEGAL_RAG, "hors périmètre");
        }

        // ── PERSONAL_SQL ─────────────────────────────────────────
        if (
            containsAny(
                n,
                "mon salaire",
                "ma paie",
                "mon net",
                "mon brut",
                "mes conges",
                "mon solde",
                "ma date d embauche",
                "mon contrat",
                "mon poste",
                "mon departement",
                "mon matricule",
                "mon anciennete",
                "mes jours",
                "suis-je",
                "suis je",
                "mon profil"
            )
        ) return intent(IntentType.PERSONAL_SQL, "possessif");

        // ── ADMIN_SQL ─────────────────────────────────────────────
        if (
            containsAny(
                n,
                "combien",
                "nombre de",
                "nombre d",
                "liste",
                "lister",
                "affiche",
                "montre",
                "donne moi",
                "tous les employes",
                "les noms",
                "les employes",
                "qui sont",
                "masse salarial",
                "salaire moyen",
                "salaire total",
                "effectif",
                "repartition",
                "statistique",
                "par departement",
                "par poste",
                "actifs",
                "inactifs",
                "embauche cette",
                "embauche en",
                "recap",
                "bilan rh"
            )
        ) return intent(isAdmin ? IntentType.ADMIN_SQL : IntentType.PERSONAL_SQL, "données/stats admin=" + isAdmin);

        // ── GENERAL ───────────────────────────────────────────────
        if (n.length() < 50 && containsAny(n, "bonjour", "bonsoir", "salut", "hello", "merci", "au revoir", "ca va")) return intent(
            IntentType.GENERAL,
            "salutation"
        );

        // ── LEGAL_RAG ─────────────────────────────────────────────
        if (
            containsAny(
                n,
                "loi ",
                "legislation",
                "code du travail",
                "lf 2026",
                "irpp",
                "cnss",
                "cavis",
                "cotisation",
                "civp",
                "karama",
                "bareme",
                "licenciement",
                "preavis",
                "convention collective",
                "smig",
                "heures supplementaires",
                "conge legal",
                "conge annuel",
                "maternite",
                "indemnite"
            )
        ) return intent(IntentType.LEGAL_RAG, "législation");

        // Fallback admin : mots liés aux données RH
        if (isAdmin && containsAny(n, "employe", "departement", "poste", "salarial", "matricule")) {
            return intent(IntentType.ADMIN_SQL, "fallback admin");
        }

        return intent(IntentType.LEGAL_RAG, "défaut");
    }

    // ─────────────────────────────────────────────────────────────
    //  Extraction / Nettoyage du SQL
    // ─────────────────────────────────────────────────────────────

    public String extractAndCleanSql(String raw) {
        if (raw == null || raw.isBlank()) return "";
        String s = raw.trim();

        // Extraire depuis bloc ```sql ... ```
        Matcher m = Pattern.compile("```(?:sql)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE).matcher(s);
        if (m.find()) s = m.group(1).trim();

        // Couper au premier SELECT
        int idx = s.toUpperCase().indexOf("SELECT");
        if (idx > 0) s = s.substring(idx);

        // Stopper si phi3 continue avec plusieurs exemples
        StringBuilder sb = new StringBuilder();
        for (String line : s.split("\\n")) {
            String up = line.trim().toUpperCase();
            if (up.startsWith("Q:") || up.startsWith("R:") || up.startsWith("QUESTION")) break;
            sb.append(line).append(" ");
        }

        return sb
            .toString()
            .replaceAll("--[^\n]*", " ")
            .replaceAll("/\\*[\\s\\S]*?\\*/", " ")
            .replaceAll(";\\s*$", "")
            .replaceAll("\\s+", " ")
            .trim();
    }

    // ─────────────────────────────────────────────────────────────
    //  Validation sécurité
    // ─────────────────────────────────────────────────────────────

    public String validateSql(String sql) {
        if (sql == null || sql.isBlank()) return "SQL vide";
        if (!sql.trim().toUpperCase().startsWith("SELECT")) return "Doit commencer par SELECT";
        if (sql.length() > 1500) return "SQL trop long";

        // Utilise les patterns précompilés
        for (Pattern p : DANGEROUS_PATTERNS) {
            if (p.matcher(sql).find()) return "Mot-clé dangereux détecté";
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────
    //  Injection CTE sécurisée (schema-per-tenant)
    // ─────────────────────────────────────────────────────────────

    public String injectSecurityCte(String sql, Long userProfileId, boolean isEmployee) {
        // ADMIN : le SET search_path isole déjà par tenant → pas de filtre de ligne
        // EMPLOYÉ : filtre par user_profile_id pour les données personnelles uniquement
        String empFilter = isEmployee ? "WHERE user_profile_id = " + userProfileId : "";

        return (
            "WITH employee AS (SELECT * FROM employee " +
            empFilter +
            "), " +
            "department AS (SELECT * FROM department), " +
            "job_position AS (SELECT * FROM job_position) " +
            sql
        );
    }

    // ─────────────────────────────────────────────────────────────
    //  Exécution dans le schéma tenant
    // ─────────────────────────────────────────────────────────────

    public List<Map<String, Object>> executeInTenantSchema(String sql, String schema) {
        if (!schema.matches("^[a-z][a-z0-9_]{1,62}$")) throw new IllegalArgumentException("Schéma invalide : " + schema);

        List<Map<String, Object>> results = new ArrayList<>();
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            stmt.execute("SET search_path TO " + schema + ", public");
            stmt.execute("SET statement_timeout = '5s'");

            try (ResultSet rs = stmt.executeQuery(sql)) {
                ResultSetMetaData meta = rs.getMetaData();
                int cols = meta.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>(cols);
                    for (int i = 1; i <= cols; i++) row.put(meta.getColumnLabel(i), rs.getObject(i));
                    results.add(row);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erreur SQL : " + e.getMessage(), e);
        }
        return results;
    }

    // ─────────────────────────────────────────────────────────────
    //  Formatage des résultats
    // ─────────────────────────────────────────────────────────────

    public String formatResults(List<Map<String, Object>> results) {
        if (results == null || results.isEmpty()) return "📋 Aucun résultat trouvé. Les données existent-elles en base ?";

        Map<String, Object> first = results.get(0);

        // Valeur scalaire unique (COUNT, SUM, AVG...)
        if (results.size() == 1 && first.size() == 1) {
            Map.Entry<String, Object> e = first.entrySet().iterator().next();
            return "📊 **" + e.getKey() + "** : **" + fmt(e.getValue()) + "**";
        }

        // Ligne unique, plusieurs colonnes (données personnelles)
        if (results.size() == 1) {
            StringBuilder sb = new StringBuilder("📋 **Résultat :**\n\n");
            first.forEach((k, v) -> sb.append("• **").append(k).append("** : ").append(fmt(v)).append("\n"));
            return sb.toString();
        }

        // Tableau Markdown (max 25 lignes)
        List<String> cols = new ArrayList<>(first.keySet());
        StringBuilder sb = new StringBuilder("📊 **").append(results.size()).append(" résultat(s) :**\n\n");
        sb.append("| ").append(String.join(" | ", cols)).append(" |\n");
        sb
            .append(
                cols
                    .stream()
                    .map(c -> "| ---")
                    .collect(Collectors.joining())
            )
            .append(" |\n");

        int limit = Math.min(results.size(), 25);
        for (int i = 0; i < limit; i++) {
            Map<String, Object> row = results.get(i);
            sb
                .append("| ")
                .append(
                    cols
                        .stream()
                        .map(c -> fmt(row.get(c)))
                        .collect(Collectors.joining(" | "))
                )
                .append(" |\n");
        }
        if (results.size() > 25) sb.append("\n_… et **").append(results.size() - 25).append("** autres._");

        return sb.toString();
    }

    // ─────────────────────────────────────────────────────────────
    //  Utilitaires privés
    // ─────────────────────────────────────────────────────────────

    private String normalize(String s) {
        return s
            .toLowerCase()
            .replace("'", " ")
            .replace("'", " ")
            .replace("`", " ")
            .replace("é", "e")
            .replace("è", "e")
            .replace("ê", "e")
            .replace("ë", "e")
            .replace("à", "a")
            .replace("â", "a")
            .replace("ä", "a")
            .replace("ô", "o")
            .replace("ö", "o")
            .replace("ù", "u")
            .replace("û", "u")
            .replace("ü", "u")
            .replace("î", "i")
            .replace("ï", "i")
            .replace("ç", "c")
            .replaceAll("\\s+", " ")
            .trim();
    }

    private boolean containsAny(String n, String... keywords) {
        for (String kw : keywords) if (n.contains(kw)) return true;
        return false;
    }

    private IntentType intent(IntentType type, String reason) {
        log.debug("[Intent] → {} ({})", type, reason);
        return type;
    }

    private String fmt(Object v) {
        if (v == null) return "—";
        if (v instanceof BigDecimal bd) return String.format("%,.2f DT", bd);
        if (v instanceof java.sql.Date d) return new SimpleDateFormat("dd/MM/yyyy").format(d);
        if (v instanceof Boolean b) return b ? "✅ Actif" : "❌ Inactif";
        return String.valueOf(v);
    }

    private String simplifyError(String msg) {
        if (msg == null) return "Erreur inconnue.";
        if (msg.contains("does not exist")) return "Une colonne ou table demandée n'existe pas. Essayez une question plus simple.";
        if (msg.contains("timeout")) return "Requête trop lente. Simplifiez la question.";
        return "Erreur de base de données. Reformulez la question.";
    }
}
