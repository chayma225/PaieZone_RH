# PaieZone RH — État du Projet

> Mis à jour le : 2026-05-14 | Build : ✅ SUCCESS (main + test-compile)

---

## 1. Build & Compilation

| Item                | Statut           | Détail                                                                       |
| ------------------- | ---------------- | ---------------------------------------------------------------------------- |
| `mvn clean compile` | ✅ BUILD SUCCESS | 349 fichiers Java compilés en ~36s                                           |
| `mvn test-compile`  | ✅ BUILD SUCCESS | 232 fichiers de test compilés — zéro erreur                                  |
| Warnings MapStruct  | ✅ Éliminés      | `unmappedTargetPolicy = ReportingPolicy.IGNORE` appliqué sur les 30 mappers  |
| `Contract.jobTitle` | ✅ OK            | Champ + getter/setter présents — `PaySlipPdfServiceImpl` compile sans erreur |
| Warnings Sass       | ⚠️ Non bloquant  | `@import` deprecated dans Angular (cosmétique, hors périmètre Java)          |

---

## 2. Architecture & Stack

- **Backend** : Spring Boot 3.x + JHipster, JPA/Hibernate 7, Spring Security OAuth2/JWT
- **Base de données** : PostgreSQL (schéma multi-tenant par `search_path`)
- **IA** : Ollama (phi3) — RAG juridique + Text-to-SQL
- **Email** : JavaMailSender + Thymeleaf templates
- **PDF** : JasperReports

---

## 3. Sécurité Multi-Tenant ✅

### RBAC (Role-Based Access Control)

| Rôle                | Périmètre                                                       |
| ------------------- | --------------------------------------------------------------- |
| `ROLE_SUPER_ADMIN`  | Voit toutes les entreprises, gère les paramètres réglementaires |
| `ROLE_ADMIN`        | Gère sa propre entreprise (employés, contrats, paie, congés)    |
| `ROLE_RH_COMPTABLE` | Gère les RH et la paie de l'entreprise                          |
| `ROLE_MANAGER`      | Approuve les congés, consulte les équipes                       |
| `ROLE_EMPLOYE`      | Accès uniquement à ses propres données                          |

### Isolation des données

- **`TenantContextService`** (nouveau) : service Spring centralisé qui résout le `companyId` du tenant courant
- **`EmployeeQueryService`** : méthode `tenantSpec()` injecte automatiquement le filtre `company_id` sur toutes les requêtes JPA
- **`ContractQueryService`** : même mécanique via JOIN sur `employee.company.id`
- **Text-to-SQL** : CTE `WITH employee AS (SELECT * FROM employee WHERE user_profile_id = X)` isole les données employé
- **Schema-per-tenant** : `SET search_path TO <tenant_schema>` exécuté avant chaque requête SQL dynamique

---

## 4. Intelligence Artificielle ✅

### Chatbot RAG (Legal)

- Ingestion du Code du Travail tunisien via `KnowledgeDocumentSeeder`
- Recherche par mots-clés dans `knowledge_document` → contexte injecté dans le prompt Ollama
- Prompt système strict : LF 2026, CDI/CDD/CIVP/KARAMA, CNSS/CAVIS/IRPP

### Text-to-Data (SQL)

- Détection d'intention : `PERSONAL_SQL`, `ADMIN_SQL`, `LEGAL_RAG`, `GENERAL`
- Génération SQL via Ollama (phi3, température 0.05)
- Validation sécurité : blacklist de mots-clés dangereux (DROP, DELETE, etc.)
- Exécution isolée par tenant (`search_path`)

### Protections IA (nouvelles)

- **Anti-hallucination** : patterns de détection + remplacement de la réponse
- **Anti cross-tenant** (nouveau) : un `ROLE_EMPLOYE` ne peut pas interroger les données d'un collègue ou d'une autre société → réponse de refus immédiate

---

## 5. Flux d'Invitation ✅ (nouveau)

### Architecture

```
Admin/RH → POST /api/invitations
         → InvitationService.inviteUser()
         → User créé (activated=false, resetKey=<token 7j>)
         → Email HTML envoyé (lien /account/invitation/finish?key=<token>)

Invité   → POST /api/account/invitation/finish  [PUBLIC]
         → InvitationService.acceptInvitation(key, newPassword)
         → User activé + mot de passe défini
```

### Fichiers créés

- `InvitationService.java` — logique métier (création user + email inline HTML)
- `InvitationResource.java` — endpoints REST avec `@PreAuthorize`
- `SecurityConfiguration.java` — `/api/account/invitation/finish` exposé en public

### Rôles autorisés à inviter

`ROLE_ADMIN`, `ROLE_RH_COMPTABLE`, `ROLE_SUPER_ADMIN`

---

## 6. Calculs de Paie (IMMUABLES — NE PAS MODIFIER)

| Paramètre     | Valeur                             | Statut    |
| ------------- | ---------------------------------- | --------- |
| CNSS salarié  | 9,18% (base) / 9,68% (avec CAVIS)  | ✅ Validé |
| CAVIS         | 1%                                 | ✅ Validé |
| CSS           | 0,5%                               | ✅ Validé |
| TFP patronal  | 1%                                 | ✅ Validé |
| IRPP          | Barème progressif tunisien LF 2026 | ✅ Validé |
| Employer CNSS | 16,57%                             | ✅ Validé |

> ⚠️ **RÈGLE D'OR** : Ces formules ne doivent JAMAIS être modifiées sans validation comptable.

---

## 7. Fichiers Modifiés — Sprint Courant

### Nouveaux fichiers

- `service/TenantContextService.java`
- `service/InvitationService.java`
- `web/rest/InvitationResource.java`
- `config/liquibase/changelog/20260501_chatbot_tables.xml` — séquences + colonnes chatbot manquantes + FK
- `config/liquibase/changelog/20260512000003_add_bank_rib_to_employee.xml` — correction nom fichier (espaces → underscores)

### Fichiers mis à jour

- `service/mapper/*.java` (×30) — `unmappedTargetPolicy = ReportingPolicy.IGNORE`
- `service/EmployeeQueryService.java` — filtrage tenant automatique
- `service/ContractQueryService.java` — filtrage tenant automatique
- `service/ChatbotService.java` — protection cross-tenant IA
- `config/SecurityConfiguration.java` — route invitation publique
- `domain/ChatMessage.java` — +3 champs JDL (actionTaken, tokenUsed, errorOccurred) + overload `intent(MessageIntent)`
- `domain/ChatSession.java` — +9 champs JDL (channel, status, startedAt, employee, etc.)
- `domain/KnowledgeDocument.java` — +4 champs JDL (fileUrl, vectorIndexed, indexedAt, company) + dual Boolean/boolean active
- `service/dto/ChatSessionDTO.java` — champs JDL complets + @NotNull (channel, status, startedAt)
- `service/dto/ChatMessageDTO.java` — champs JDL complets (actionTaken, tokenUsed, errorOccurred) + @NotNull (role, content, sentAt)
- `service/mapper/ChatSessionMapper.java` — mapping employeeId ↔ employee.id
- `service/mapper/ChatMessageMapper.java` — mapping sessionId ↔ session.id

---

## 8. Prochaines Priorités (Backlog)

| Priorité | Feature                                                             | Sprint Estimé |
| -------- | ------------------------------------------------------------------- | ------------- |
| 🔴 P1    | Tableau de bord RH temps réel (KPIs)                                | Sprint 5      |
| 🔴 P1    | Génération PDF bulletin (JasperReports template)                    | Sprint 5      |
| 🟡 P2    | Page Angular "Accepter l'invitation" (`/account/invitation/finish`) | Sprint 5      |
| 🟡 P2    | Historique des invitations envoyées                                 | Sprint 5      |
| 🟢 P3    | Tests d'intégration multi-tenant                                    | Sprint 6      |
| 🟢 P3    | Export CNSS/CNAM déclarations                                       | Sprint 6      |
