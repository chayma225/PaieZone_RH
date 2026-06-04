package tn.paiezone.rh.web.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.paiezone.rh.service.OllamaService;

@RestController
@RequestMapping("/api/conventions")
public class ConventionParseResource {

    private static final Logger log = LoggerFactory.getLogger(ConventionParseResource.class);

    // ── Patterns stricts : colon OBLIGATOIRE, aucun chiffre dans le label ──

    // "Label : 83.968 DT / mois"  (label sans chiffres ni deux-points)
    private static final Pattern P_LABEL_DT = Pattern.compile(
        "([\\p{L}\\s''()\\-]{4,70}):\\s*([0-9][0-9,. ]{0,10})\\s*(?:DT|TND)\\s*/\\s*(?:mois|MOIS|Mois)",
        Pattern.UNICODE_CHARACTER_CLASS
    );
    // "Label : 5,500 DT / repas"
    private static final Pattern P_LABEL_DT_UNIT = Pattern.compile(
        "([\\p{L}\\s''()\\-]{4,70}):\\s*([0-9][0-9,. ]{0,10})\\s*(?:DT|TND)\\s*/\\s*(repas|jour|Repas|Jour)",
        Pattern.UNICODE_CHARACTER_CLASS
    );
    // "Label : 15 %" — pourcentage
    private static final Pattern P_LABEL_PCT = Pattern.compile(
        "([\\p{L}\\s''()\\-]{4,70}):\\s*([0-9][0-9,.]{0,6})\\s*%",
        Pattern.UNICODE_CHARACTER_CLASS
    );
    // Coefficient HS : "coefficient 1.35" ou "× 1,65"
    private static final Pattern P_COEFF = Pattern.compile(
        "(?:coefficient|coeff\\.?|×|taux|majoration)\\D{0,25}([1-9][.,]\\d{1,3})",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS
    );
    // Cellule DT dans un tableau : "| 83,968 DT / mois |"
    private static final Pattern P_CELL_DT = Pattern.compile("([0-9][0-9,.]{1,8})\\s*(?:DT|TND)\\s*/\\s*mois");
    // Date dans cellule tableau : "01/01/2026" ou "2026"
    private static final Pattern P_DATE_CELL = Pattern.compile("(\\d{4})");
    // "À partir du 01/01/2026 : [majoration de] X DT / mois" dans un contexte de section
    private static final Pattern P_CONTEXT_DATE_DT = Pattern.compile(
        "(?:(?:à partir du?|depuis|au|dès)\\s+)?\\d{2}/\\d{2}/(\\d{4})\\s*[:\\-]?\\s*(?:(?:majoration|augmentation)\\s+de\\s+)?([0-9][0-9,.]+)\\s*(?:DT|TND)\\s*/\\s*mois",
        Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CHARACTER_CLASS
    );

    // JSON phi3
    private static final Pattern P_JSON_MD = Pattern.compile("```(?:json)?\\s*(\\{[\\s\\S]*?\\})\\s*```");
    private static final Pattern P_JSON_RAW = Pattern.compile("(\\{[\\s\\S]*\\})");

    // Mots qui qualifient un label comme "règle de paie"
    private static final Set<String> RULE_WORDS = Set.of(
        "prime",
        "primes",
        "indemnit",
        "indemnité",
        "allocation",
        "majoration",
        "transport",
        "présence",
        "presence",
        "panier",
        "rendement",
        "risque",
        "scolaire",
        "repas",
        "retraite",
        "décès",
        "deces",
        "bienveillance",
        "anciennet",
        "nuit",
        "astreinte",
        "tenue",
        "vêtement",
        "logement",
        "علاوة",
        "منحة",
        "تعويض",
        "معامل"
    );

    private final OllamaService ollamaService;
    private final ObjectMapper objectMapper;

    public ConventionParseResource(OllamaService ollamaService, ObjectMapper objectMapper) {
        this.ollamaService = ollamaService;
        this.objectMapper = objectMapper;
    }

    // =========================================================================
    //  Endpoint principal
    // =========================================================================

    @PostMapping(value = "/parse-ia", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> parseConvention(
        @RequestPart(name = "file", required = false) MultipartFile file,
        @RequestParam(name = "text", required = false) String rawText
    ) {
        String text;
        try {
            text = extractText(file, rawText);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(error("Impossible de lire le fichier. Utilisez PDF, DOCX ou TXT."));
        }
        if (text == null || text.isBlank()) return ResponseEntity.badRequest().body(error("Aucun contenu détecté."));

        log.info("[ParseIA] Texte reçu : {} caractères", text.length());

        // Nettoyer le markdown une fois pour toutes
        String clean = cleanMarkdown(text);

        // 1. Extraction directe par regex (rapide + fiable)
        List<Map<String, String>> rules = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        extractBulletRules(clean, rules, seen);
        extractTableRules(text, rules, seen); // tableaux sur le texte brut
        extractCoeffRules(clean, rules, seen);
        extractContextValueRules(text, rules, seen); // "À partir du date : X DT/mois" par section
        log.info("[ParseIA] {} règles par regex", rules.size());

        // 2. Métadonnées via phi3
        String header = clean.length() > 1200 ? clean.substring(0, 1200) : clean;
        Map<String, Object> meta = extractMetaOllama(header);

        meta.put("rules", rules);
        log.info("[ParseIA] Total : {} règles", rules.size());
        return ResponseEntity.ok(meta);
    }

    // =========================================================================
    //  Nettoyage markdown (une passe propre)
    // =========================================================================

    private String cleanMarkdown(String text) {
        return text
            .replaceAll("\\*{2}([^*\n]+)\\*{2}", "$1") // **bold** → bold
            .replaceAll("\\*([^*\n]+)\\*", "$1") // *italic* → italic
            .replaceAll("(?m)^[*•]\\s+", "") // - bullet au début de ligne
            .replaceAll("(?m)^\\s*#+\\s*(\\d+\\.?\\s*)?([A-ZÀ-ÿa-z])", "$2") // ## titre → titre
            .replaceAll("(?m)^[A-Z]\\.\\s+", "") // "A. " → ""
            .replaceAll("\\$[^$]+\\$", "") // formules LaTeX
            .replaceAll("\\[([^]]+)\\]\\([^)]+\\)", "$1"); // [texte](lien) → texte
    }

    // =========================================================================
    //  Extraction des règles depuis les lignes de type "Label : valeur DT"
    // =========================================================================

    private void extractBulletRules(String clean, List<Map<String, String>> rules, Set<String> seen) {
        for (String line : clean.split("\\n")) {
            String l = line.trim();
            if (l.isBlank() || l.startsWith("|") || l.startsWith("#")) continue;

            // DT/mois
            Matcher m1 = P_LABEL_DT.matcher(l);
            while (m1.find()) {
                String label = sanitizeLabel(m1.group(1));
                String value = toNumber(m1.group(2));
                if (label != null && value != null && isRuleLabel(label)) addRule(rules, seen, "PREMIUM", label, value);
            }

            // DT/repas ou DT/jour
            Matcher m2 = P_LABEL_DT_UNIT.matcher(l);
            while (m2.find()) {
                String label = sanitizeLabel(m2.group(1));
                String value = toNumber(m2.group(2));
                if (label != null && value != null && isRuleLabel(label)) addRule(
                    rules,
                    seen,
                    "PREMIUM",
                    label + " (/" + m2.group(3).toLowerCase() + ")",
                    value
                );
            }

            // Pourcentage
            Matcher m3 = P_LABEL_PCT.matcher(l);
            while (m3.find()) {
                String label = sanitizeLabel(m3.group(1));
                String value = toNumber(m3.group(2));
                if (label == null || value == null || !isRuleLabel(label)) continue;
                try {
                    double v = Double.parseDouble(value);
                    if (v <= 0 || v > 100) continue;
                } catch (Exception e) {
                    continue;
                }
                addRule(rules, seen, "PREMIUM_PCT", label, value);
            }
        }
    }

    // =========================================================================
    //  Extraction depuis les tableaux markdown
    //  Stratégie : pour chaque table, prendre la ligne dont l'année est la plus
    //  proche (mais ≤) de l'année courante.
    // =========================================================================

    private void extractTableRules(String rawText, List<Map<String, String>> rules, Set<String> seen) {
        int currentYear = LocalDate.now().getYear();
        String[] lines = rawText.split("\\r?\\n");

        String sectionLabel = ""; // Libellé ### courant
        List<String[]> tableRows = new ArrayList<>(); // lignes de données du tableau en cours
        boolean inTable = false;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();

            // Titre de section (### ou ##)
            if (line.startsWith("#")) {
                // Flush table précédente
                if (inTable && !tableRows.isEmpty()) flushTable(sectionLabel, tableRows, currentYear, rules, seen);
                tableRows.clear();
                inTable = false;
                sectionLabel = line.replaceAll("^#+\\s*\\d*[.)]?\\s*", "").replaceAll("\\*", "").replaceAll("\\s+", " ").trim();
                continue;
            }

            // Séparateur de tableau "|---|"
            if (line.matches("\\|[\\s|\\-:]+\\|")) {
                inTable = true;
                continue;
            }

            // Ligne de données tableau "|...|...|"
            if (inTable && line.startsWith("|") && line.endsWith("|")) {
                String[] cells = Arrays.stream(line.split("\\|"))
                    .map(c -> c.replaceAll("\\*", "").trim())
                    .filter(c -> !c.isBlank())
                    .toArray(String[]::new);
                if (cells.length >= 2) tableRows.add(cells);
                continue;
            }

            // Fin de tableau
            if (inTable && !line.startsWith("|")) {
                flushTable(sectionLabel, tableRows, currentYear, rules, seen);
                tableRows.clear();
                inTable = false;
            }
        }
        // Flush final
        if (inTable && !tableRows.isEmpty()) flushTable(sectionLabel, tableRows, currentYear, rules, seen);
    }

    /**
     * Pour un tableau donné, trouver la ligne avec la date la plus récente ≤ année courante,
     * puis extraire la première valeur en DT.
     */
    private void flushTable(String section, List<String[]> rows, int currentYear, List<Map<String, String>> rules, Set<String> seen) {
        if (rows.isEmpty() || section.isBlank()) return;

        // Ignorer les tableaux d'en-têtes (lignes sans chiffres DT)
        boolean hasValue = rows.stream().anyMatch(r -> Arrays.stream(r).anyMatch(c -> P_CELL_DT.matcher(c).find()));
        if (!hasValue) return;

        // Trouver la "meilleure" ligne : année la plus récente ≤ année courante
        String[] bestRow = null;
        int bestYear = -1;

        for (String[] row : rows) {
            // La première cellule contient souvent la date
            String firstCell = row[0];
            Matcher dm = P_DATE_CELL.matcher(firstCell);
            if (dm.find()) {
                int year = Integer.parseInt(dm.group(1));
                if (year <= currentYear && year > bestYear) {
                    bestYear = year;
                    bestRow = row;
                }
            }
        }

        // Si aucune ligne ≤ currentYear, prendre la première
        if (bestRow == null) bestRow = rows.get(0);

        // Extraire la première valeur DT dans la ligne sélectionnée (skip col 0 = date)
        for (int c = 1; c < bestRow.length; c++) {
            Matcher vm = P_CELL_DT.matcher(bestRow[c]);
            if (vm.find()) {
                String value = vm.group(1).replaceAll("\\s", "").replace(",", ".");
                String label = sanitizeLabel(section);
                if (label != null && isRuleLabel(label)) {
                    addRule(rules, seen, "PREMIUM", label, value);
                }
                return; // une seule valeur par tableau
            }
        }
    }

    // =========================================================================
    //  Extraction règles "À partir du date : X DT/mois" dans contexte de section
    //  Capte : Prime de Présence, HS forfaitaires par période, etc.
    // =========================================================================

    private void extractContextValueRules(String rawText, List<Map<String, String>> rules, Set<String> seen) {
        int currentYear = LocalDate.now().getYear();
        String currentSection = "";
        String currentPeriod = "";
        Map<String, int[]> bestYear = new LinkedHashMap<>();
        Map<String, String> bestValue = new LinkedHashMap<>();
        Map<String, String> keyLabel = new LinkedHashMap<>();

        for (String line : rawText.split("\\r?\\n")) {
            String stripped = line.trim().replaceAll("\\*+", "").trim();
            if (stripped.isBlank()) continue;

            // En-tête de section markdown
            if (line.trim().startsWith("#")) {
                String title = stripped.replaceAll("^#+\\s*", "").replaceAll("^[A-Z]\\.\\s+", "").replaceAll("\\(.*?\\)", "").trim();
                String sec = sanitizeLabel(title);
                if (sec != null) {
                    currentSection = sec;
                    currentPeriod = "";
                }
                continue;
            }

            // Marqueur de période : "Période d'Octobre à Mai"
            if (stripped.toLowerCase().startsWith("période")) {
                currentPeriod = stripped
                    .replaceAll("(?i)^période\\s+(?:de?|d['’‘])\\s*", "")
                    .replaceAll("\\s*:.*", "")
                    .replaceAll("^[^\\p{L}]+", "") // retire tout caractère non-lettre en tête (apostrophe résiduelle)
                    .trim();
                continue;
            }

            if (currentSection.isBlank() || !isRuleLabel(currentSection)) continue;

            Matcher m = P_CONTEXT_DATE_DT.matcher(stripped);
            if (!m.find()) continue;

            int year;
            try {
                year = Integer.parseInt(m.group(1));
            } catch (Exception e) {
                continue;
            }
            if (year > currentYear) continue;

            String value = toNumber(m.group(2));
            if (value == null) continue;

            String label = currentSection + (currentPeriod.isBlank() ? "" : " - " + currentPeriod);
            String key = label.toLowerCase().replaceAll("[^\\p{L}0-9]", "");

            int[] best = bestYear.get(key);
            if (best == null || year > best[0]) {
                bestYear.put(key, new int[] { year });
                bestValue.put(key, value);
                keyLabel.put(key, label);
            }
        }

        bestYear
            .keySet()
            .forEach(k -> {
                String lbl = keyLabel.get(k);
                String val = bestValue.get(k);
                if (lbl != null && val != null) addRule(rules, seen, "PREMIUM", lbl, val);
            });
    }

    // =========================================================================
    //  Extraction coefficients heures supplémentaires
    // =========================================================================

    private void extractCoeffRules(String clean, List<Map<String, String>> rules, Set<String> seen) {
        Matcher m = P_COEFF.matcher(clean);
        while (m.find()) {
            String value = m.group(1).replace(",", ".");
            double v;
            try {
                v = Double.parseDouble(value);
            } catch (Exception e) {
                continue;
            }
            if (v < 1.1 || v > 3.0) continue;
            int ctxStart = Math.max(0, m.start() - 100);
            String ctx = clean.substring(ctxStart, m.start()).toLowerCase();
            boolean nuit = ctx.contains("nuit") || ctx.contains("feri") || ctx.contains("férié");
            String type = nuit ? "OVERTIME_50" : "OVERTIME_25";
            String label = nuit ? "Heures supplémentaires nuit / jours fériés" : "Heures supplémentaires de jour";
            addRule(rules, seen, type, label, value);
        }
    }

    // =========================================================================
    //  Métadonnées via phi3
    // =========================================================================

    private Map<String, Object> extractMetaOllama(String header) {
        int year = LocalDate.now().getYear();
        Map<String, Object> def = new LinkedHashMap<>();
        def.put("sectorCode", "GENERAL");
        def.put("sectorLabel", "Secteur général");
        def.put("conventionYear", year);
        def.put("conventionLabel", "Convention importée");
        def.put("effectiveFrom", null);

        String prompt =
            "Lis ce texte de convention et complète ce JSON :\n" +
            "{\"sectorCode\":\"TRANSPORT\",\"sectorLabel\":\"Transport routier\"," +
            "\"conventionYear\":2025,\"conventionLabel\":\"Convention collective du transport 2025\"," +
            "\"effectiveFrom\":\"2025-01-01\"}\n\n" +
            "- sectorCode en majuscules (TRANSPORT, BANQUE, BTP, TEXTILE, HOTELLERIE, IT, COMMERCE…)\n" +
            "- effectiveFrom : date YYYY-MM-DD de la convention, ou null\n" +
            "Réponds UNIQUEMENT avec le JSON.\n\nTEXTE:\n" +
            header;

        String raw = ollamaService.chatJson(
            List.of(
                new OllamaService.OllamaMessage("system", "Réponds uniquement en JSON valide, sans texte avant ni après."),
                new OllamaService.OllamaMessage("user", prompt)
            )
        );
        log.info("[ParseIA-meta] {}", raw);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> p = tryParseJson(raw);
            if (p != null) {
                String code = String.valueOf(p.getOrDefault("sectorCode", "GENERAL")).toUpperCase().replaceAll("[^A-Z0-9_]", "");
                if (!code.isBlank()) def.put("sectorCode", code.length() > 20 ? code.substring(0, 20) : code);
                def.put("sectorLabel", nonBlank(p, "sectorLabel", "Secteur général"));
                def.put("conventionYear", intVal(p, "conventionYear", year));
                def.put("conventionLabel", nonBlank(p, "conventionLabel", "Convention importée"));
                Object eff = p.get("effectiveFrom");
                if (eff != null && !"null".equals(eff.toString()) && !eff.toString().isBlank()) def.put("effectiveFrom", eff.toString());
            }
        } catch (Exception e) {
            log.warn("[ParseIA-meta] {}", e.getMessage());
        }
        return def;
    }

    // =========================================================================
    //  Règles supplémentaires via phi3
    // =========================================================================

    private String buildRuleContext(String clean) {
        String[] lines = clean.split("\\n");
        boolean[] include = new boolean[lines.length];
        for (int i = 0; i < lines.length; i++) {
            if (RULE_WORDS.stream().anyMatch(lines[i].toLowerCase()::contains)) {
                include[i] = true;
                // Inclure les 5 lignes suivantes pour capturer les valeurs qui suivent le label
                for (int j = i + 1; j < Math.min(i + 6, lines.length); j++) {
                    if (!lines[j].trim().isBlank()) include[j] = true;
                }
            }
        }
        StringBuilder sb = new StringBuilder();
        int chars = 0;
        for (int i = 0; i < lines.length && chars < 2500; i++) {
            if (include[i] && !lines[i].trim().isBlank()) {
                sb.append(lines[i]).append('\n');
                chars += lines[i].length();
            }
        }
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, String>> extractRulesOllama(String ctx) {
        String prompt =
            "Extrait les primes et indemnités de ce texte de convention tunisienne.\n" +
            "Retourne UNIQUEMENT:\n" +
            "{\"rules\":[" +
            "{\"ruleType\":\"PREMIUM\",\"label\":\"Prime de transport\",\"value\":\"83.968\"}," +
            "{\"ruleType\":\"PREMIUM_PCT\",\"label\":\"Prime de rendement\",\"value\":\"15\"}," +
            "{\"ruleType\":\"OVERTIME_25\",\"label\":\"HS jour\",\"value\":\"1.35\"}]}\n\n" +
            "Types autorisés: PREMIUM(TND/mois), PREMIUM_PCT(%), OVERTIME_25(coeff jour), OVERTIME_50(coeff nuit), HOLIDAY(YYYY-MM-DD)\n" +
            "- Prendre la valeur la plus récente si plusieurs dates\n" +
            "- Traduire en français si arabe\n" +
            "TEXTE:\n" +
            ctx;

        String raw = ollamaService.chatJson(
            List.of(
                new OllamaService.OllamaMessage("system", "Réponds uniquement en JSON valide."),
                new OllamaService.OllamaMessage("user", prompt)
            )
        );
        log.info("[ParseIA-rules] {}", raw);

        try {
            Map<String, Object> p = tryParseJson(raw);
            if (p == null) return List.of();
            Object ro = p.get("rules");
            if (!(ro instanceof List)) return List.of();
            List<Map<String, String>> res = new ArrayList<>();
            Set<String> valid = Set.of("HOLIDAY", "OVERTIME_25", "OVERTIME_50", "PREMIUM", "PREMIUM_PCT");
            for (Object r : (List<?>) ro) {
                if (!(r instanceof Map)) continue;
                Map<String, Object> rm = (Map<String, Object>) r;
                String rt = String.valueOf(rm.getOrDefault("ruleType", "")).toUpperCase().trim();
                String lbl = String.valueOf(rm.getOrDefault("label", "")).trim();
                String val = String.valueOf(rm.getOrDefault("value", "")).trim();
                if (valid.contains(rt) && !lbl.isBlank() && !val.isBlank() && !"null".equals(val)) res.add(
                    Map.of("ruleType", rt, "label", lbl, "value", val)
                );
            }
            return res;
        } catch (Exception e) {
            return List.of();
        }
    }

    // =========================================================================
    //  Helpers
    // =========================================================================

    /** Nettoie un label extrait : enlève ponctuation parasite, points, numéros de section... */
    private String sanitizeLabel(String raw) {
        if (raw == null) return null;
        String s = raw
            .replaceAll("^[\\d.A-Z]\\s*\\.\\s*", "") // "A. " ou "1. "
            .replaceAll("^[IVX]+\\.?\\s+", "") // numérotation romaine
            .replaceAll("\\(.*?\\)\\s*$", "") // parenthèse finale contextuelle
            .replaceAll("\\s+", " ")
            .trim();
        // Doit commencer par une lettre
        if (s.isEmpty() || !Character.isLetter(s.charAt(0))) return null;
        // Trop long ou trop court
        if (s.length() < 4 || s.length() > 70) return null;
        // Capitaliser la première lettre
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    private boolean isRuleLabel(String label) {
        String lower = label.toLowerCase();
        return RULE_WORDS.stream().anyMatch(lower::contains);
    }

    private String toNumber(String raw) {
        if (raw == null) return null;
        String v = raw.replaceAll("\\s", "").replace(",", ".");
        try {
            Double.parseDouble(v);
            return v;
        } catch (Exception e) {
            return null;
        }
    }

    private void addRule(List<Map<String, String>> rules, Set<String> seen, String type, String label, String value) {
        String key = label.toLowerCase().replaceAll("[^\\p{L}0-9]", "");
        if (key.length() >= 3 && seen.add(key)) rules.add(Map.of("ruleType", type, "label", label, "value", value));
    }

    private void mergeInto(List<Map<String, String>> base, Set<String> seen, List<Map<String, String>> extra) {
        for (Map<String, String> r : extra) {
            String key = r.get("label").toLowerCase().replaceAll("[^\\p{L}0-9]", "");
            if (seen.add(key) && !r.get("value").isBlank()) base.add(r);
        }
    }

    // ── Lecture fichiers ────────────────────────────────────────────────────

    private String extractText(MultipartFile file, String rawText) throws IOException {
        if (file != null && !file.isEmpty()) {
            String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
            if (name.endsWith(".pdf")) return extractPdf(file);
            if (name.endsWith(".docx")) return extractDocx(file);
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        }
        return rawText != null ? rawText : "";
    }

    private String extractPdf(MultipartFile file) throws IOException {
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(doc);
        }
    }

    private String extractDocx(MultipartFile file) throws IOException {
        try (XWPFDocument doc = new XWPFDocument(file.getInputStream())) {
            StringBuilder sb = new StringBuilder();
            for (XWPFParagraph p : doc.getParagraphs()) {
                String t = p.getText();
                if (t != null && !t.isBlank()) sb.append(t).append('\n');
            }
            return sb.toString();
        }
    }

    // ── Parsing JSON phi3 ───────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> tryParseJson(String r) {
        if (r == null || r.isBlank()) return null;
        Matcher m1 = P_JSON_MD.matcher(r);
        if (m1.find()) {
            try {
                return objectMapper.readValue(m1.group(1).trim(), Map.class);
            } catch (Exception ignored) {}
        }
        Matcher m2 = P_JSON_RAW.matcher(r);
        String last = null;
        while (m2.find()) last = m2.group(1);
        if (last != null) {
            try {
                return objectMapper.readValue(last.trim(), Map.class);
            } catch (Exception ignored) {}
        }
        try {
            return objectMapper.readValue(r.replace("'", "\"").trim(), Map.class);
        } catch (Exception ignored) {}
        return null;
    }

    private String nonBlank(Map<String, Object> m, String k, String d) {
        Object v = m.get(k);
        return (v != null && !v.toString().isBlank()) ? v.toString() : d;
    }

    private int intVal(Map<String, Object> m, String k, int d) {
        Object v = m.get(k);
        if (v instanceof Number) return ((Number) v).intValue();
        try {
            return Integer.parseInt(v.toString());
        } catch (Exception e) {
            return d;
        }
    }

    private Map<String, Object> error(String msg) {
        return Map.of("detail", msg);
    }
}
