# PRÉSENTATION SOUTENANCE — PaieZone RH
## Diplôme National de Licence — Technologies de l'Informatique
## ISET Mahdia | Année Universitaire 2025-2026

---
---

# ╔══════════════════════════════════════════════╗
# ║           SLIDE 1 — PAGE DE GARDE           ║
# ╚══════════════════════════════════════════════╝

**[Logo ISET Mahdia — à gauche]   [Logo entreprise d'accueil — à droite]**

---

## PaieZone RH
### Plateforme SaaS Multi-Tenant de Gestion RH et de Paie
### avec Assistant IA Intégré — PaieBot

---

Projet de Fin d'Études
Diplôme National de Licence en Technologies de l'Informatique
Parcours : Développement des Systèmes d'Information

**Réalisé par :**
Chayma Bouguerra   &   Takwa Boughmadi

**Encadrante académique :** Mme Amina HECHKEL — ISET Mahdia
**Encadrant entreprise :**   M. Salim HMIDI

Soutenu le : .............. 2026

---
---

# ╔══════════════════════════════════════════════╗
# ║              SLIDE 2 — SOMMAIRE             ║
# ╚══════════════════════════════════════════════╝

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  PARTIE 1 — INTRODUCTION & CONTEXTE                    │
│    01. Organisme d'accueil                              │
│    02. Problématique & Analyse de l'existant            │
│    03. Solution proposée — PaieZone RH                  │
│                                                         │
│  PARTIE 2 — CADRE DU PROJET                            │
│    04. Méthodologie Scrum                               │
│    05. Environnement de travail                         │
│    06. Architecture du système                          │
│    07. Identification des acteurs                       │
│    08. Besoins fonctionnels                             │
│    09. Besoins non fonctionnels                         │
│    10. Diagramme de cas d'utilisation global            │
│    11. Backlog & Planification des sprints              │
│                                                         │
│  PARTIE 3 — RÉALISATION                                │
│    12. Sprint 1 — Socle technique & Authentification   │
│    13. Sprint 2 — Gestion RH des Employés              │
│    14. Sprint 3 — Moteur de Paie Tunisien              │
│    15. Sprint 4 — IA & Conformité Réglementaire        │
│                                                         │
│  PARTIE 4 — BILAN & CONCLUSION                         │
│    16. Bilan quantitatif                                │
│    17. Conclusion & Perspectives                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---
---

# ╔══════════════════════════════════════════════════╗
# ║   PARTIE 1 — INTRODUCTION & CONTEXTE            ║
# ╚══════════════════════════════════════════════════╝

---

# ╔══════════════════════════════════════════════╗
# ║      SLIDE 3 — ORGANISME D'ACCUEIL          ║
# ╚══════════════════════════════════════════════╝

### Présentation de l'organisme d'accueil

**[Logo de l'entreprise — centré]**

**Fiche signalétique :**

| Champ | Valeur |
|---|---|
| **Raison sociale** | *(à compléter)* |
| **Secteur d'activité** | Édition de logiciels — Services numériques |
| **Domaine** | Solutions SaaS pour PME tunisiennes |
| **Localisation** | Tunisie |
| **Produit principal** | ComptaZone — Suite SaaS de comptabilité |

**Contexte du stage :**
- Intégration au sein de l'équipe de développement produit
- Durée : 4 mois
- Mission : concevoir et développer un module RH/Paie intégré à la suite existante

**Notre mission :**
> Étendre la suite SaaS existante avec un module RH/Paie → **PaieZone RH**

---

# ╔══════════════════════════════════════════════╗
# ║       SLIDE 4 — PROBLÉMATIQUE               ║
# ╚══════════════════════════════════════════════╝

### Le défi de la paie en Tunisie

**Contexte réglementaire dense et évolutif :**

| Cotisation | Taux | Périodicité de révision |
|---|---|---|
| CNSS salarié | 9,18 % | Stable |
| CNSS patronal | 16,57 % | Stable |
| CAVIS | 1,00 % | Stable |
| CSS | 0,50 % | Annuelle |
| TFP patronal | 1,00 % | Stable |
| IRPP | Barème progressif | **Chaque Loi de Finances** |

**Lacunes des solutions actuelles :**

| Problème constaté | Risque concret |
|---|---|
| Feuilles Excel manuelles | Erreurs de calcul — pénalités fiscales |
| Logiciels desktop isolés | Pas de mobilité, pas de multi-tenant |
| Aucune IA intégrée | Surcharge RH, expérience utilisateur médiocre |
| Mises à jour réglementaires manuelles | Bulletins non conformes |
| Pas de workflow de validation | Processus congés/avances chronophages |

**Problématique centrale :**
> Comment concevoir une plateforme SaaS multi-tenant qui automatise la paie tunisienne,
> garantit la conformité LF 2026, et intègre un assistant IA local ?

---

# ╔══════════════════════════════════════════════╗
# ║   SLIDE 5 — ANALYSE COMPARATIVE             ║
# ╚══════════════════════════════════════════════╝

### État de l'art — 3 catégories du marché tunisien

**Catégorie 1 — Excel (approche manuelle)**
> Très répandu dans les PME. Le comptable crée manuellement les formules
> CNSS/IRPP, maintient des tableaux de congés, génère des bulletins formatés à la main.
> **Risque majeur :** une seule erreur de formule = bulletins non conformes pour tous.

**Catégorie 2 — Logiciels Desktop (PGPRO, DSPAYE, Megasoft ERP…)**
> Installés sur un seul poste, base de données locale. Fonctionnalités de paie
> et déclarations CNSS. Pas de mobilité, pas de multi-tenant, mise à jour manuelle.

**Catégorie 3 — SaaS (paie-tunisie.com)**
> Premier site tunisien dédié à la paie en ligne. Simulateur intégrant
> le barème LF 2026, base documentaire réglementaire. Mais : pas de multi-tenant,
> pas d'IA, pas d'intégration comptable, pas de GED.

**Tableau comparatif :**

| Critère | Excel | Desktop | paie-tunisie.com | **PaieZone RH** |
|---|:---:|:---:|:---:|:---:|
| Architecture SaaS | ❌ | ❌ | ✅ | ✅ |
| Multi-tenant (cabinet) | ❌ | ❌ | ❌ | ✅ |
| Conformité LF 2026 | Manuel | ✅ | Partiel | ✅ |
| Chatbot IA / RAG | ❌ | ❌ | ❌ | ✅ |
| GED / Documents RH | ❌ | ❌ | ❌ | ✅ |
| Workflow congés multi-niveaux | ❌ | Basique | ❌ | ✅ |
| Déclarations (CNSS+CAVIS+IRPP) | ❌ | CNSS seul | CNSS seul | ✅ |
| Authentification 2FA | ❌ | ❌ | ❌ | ✅ |
| Journal d'audit | ❌ | ❌ | ❌ | ✅ |
| Intégration comptable SAGE | ❌ | Partielle | ❌ | ✅ |
| API REST documentée (Swagger) | ❌ | ❌ | ❌ | ✅ |

---

# ╔══════════════════════════════════════════════╗
# ║      SLIDE 6 — SOLUTION PROPOSÉE           ║
# ╚══════════════════════════════════════════════╝

### PaieZone RH — Les 4 piliers fondamentaux

```
  ┌──────────────────────────────────────────────────────────────┐
  │  PILIER 1 — CYCLE RH COMPLET                                 │
  │  Inscription → Employés → Contrats → Documents               │
  │  → Congés → Bulletins → Attestations                         │
  ├──────────────────────────────────────────────────────────────┤
  │  PILIER 2 — MOTEUR DE PAIE CONFORME LF 2026                 │
  │  CNSS 9,18% | CAVIS 1% | CSS 0,5% | IRPP progressif         │
  │  Rubriques | Primes | Avances | Bulletins PDF JasperReports  │
  ├──────────────────────────────────────────────────────────────┤
  │  PILIER 3 — MULTI-TENANT SÉCURISÉ                           │
  │  Isolation PostgreSQL par schéma dédié par entreprise        │
  │  JWT + 2FA TOTP | RBAC 5 rôles | AuditLog immuable          │
  ├──────────────────────────────────────────────────────────────┤
  │  PILIER 4 — PAIEBOT — ASSISTANT IA LOCAL                    │
  │  Ollama / phi3 — 100% local, zéro cloud externe             │
  │  RAG (Code du Travail TN) + Text-to-SQL sécurisé            │
  └──────────────────────────────────────────────────────────────┘
```

**Valeur ajoutée SaaS + IA :**
- Accessibilité universelle sur tout terminal
- Un cabinet gère plusieurs entreprises clientes isolées
- Mise à jour LF centralisée — sans réinstallation
- PaieBot : self-service employé 24h/24, confidentialité totale

---
---

# ╔══════════════════════════════════════════════════╗
# ║   PARTIE 2 — CADRE DU PROJET                    ║
# ╚══════════════════════════════════════════════════╝

---

# ╔══════════════════════════════════════════════╗
# ║      SLIDE 7 — MÉTHODOLOGIE SCRUM           ║
# ╚══════════════════════════════════════════════╝

### Pourquoi Scrum ?

> Scrum est un framework agile itératif et incrémental permettant de livrer de la
> valeur à chaque sprint, de s'adapter aux évolutions réglementaires en cours de projet
> et d'impliquer régulièrement les parties prenantes dans la validation.

**5 raisons du choix de Scrum pour ce projet :**

| Raison | Bénéfice concret |
|---|---|
| Livraison incrémentale | Chaque sprint produit un incrément fonctionnel testable |
| Flexibilité | Adaptation aux changements annuels de la LF tunisienne |
| Transparence | Revue + rétrospective à la fin de chaque sprint |
| Satisfaction client | Validation Product Owner à chaque itération |
| Auto-organisation | Amélioration continue des pratiques de l'équipe |

**Équipe Scrum :**

| Rôle | Membre |
|---|---|
| Product Owner | Hadj Amor Ramzi |
| Scrum Master | M. Salim HMIDI |
| Développeuses | Chayma Bouguerra & Takwa Boughmadi |
| Encadrante académique | Mme Amina HECHKEL (ISET Mahdia) |

**[Image : Diagramme du cycle Scrum — Sprint Planning → Daily → Review → Retrospective]**

---

# ╔══════════════════════════════════════════════╗
# ║  SLIDE 8 — ENVIRONNEMENT DE TRAVAIL         ║
# ╚══════════════════════════════════════════════╝

### 8.1 — Environnement Matériel

| | Poste 1 | Poste 2 |
|---|---|---|
| **Marque** | ASUS TUF Gaming F15 | ASUS VivoBook X515EP |
| **Processeur** | Intel Core i7-13620H | Intel Core i5-1135G7 |
| **RAM** | 16 Go DDR4 | 16 Go |
| **Stockage** | SSD NVMe 512 Go | SSD NVMe 512 Go |
| **OS** | Windows 11 Famille | Windows 11 Famille |

### 8.2 — Environnement Logiciel — Partie 1

| Outil & Version | Rôle |
|---|---|
| **JHipster 9.x** | Générateur full-stack — squelette applicatif, JWT, Liquibase |
| **Spring Boot 4.0** | Backend REST — sécurité, audit, emails |
| **Angular 18.x** | Frontend SPA — Signals, i18n FR/AR-ly |
| **PostgreSQL 15.x** | BDD relationnelle — multi-tenant par schéma |
| **IntelliJ IDEA** | IDE principal backend Java/Spring |
| **GitHub** | Gestion de versions, branches, Pull Requests |
| **Draw.io / Lucidchart** | Diagrammes UML et wireframes |

### 8.3 — Environnement Logiciel — Partie 2

| Outil & Version | Rôle |
|---|---|
| **Ollama (phi3)** | Moteur IA local — RAG + Text-to-SQL |
| **JasperReports** | Génération bulletins PDF et attestations |
| **Docker 24.x** | Conteneurisation de tous les services |
| **Redis** | Cache distribué — sessions et données fréquentes |
| **Apache Kafka** | Événements asynchrones — alertes, notifications |
| **Cypress** | Tests End-to-End automatisés Angular |
| **LaTeX** | Rédaction du rapport PFE |
| **Google Meet / Chat** | Réunions d'équipe, Sprint Reviews à distance |

---

# ╔══════════════════════════════════════════════╗
# ║    SLIDE 9 — ARCHITECTURE DU SYSTÈME        ║
# ╚══════════════════════════════════════════════╝

### 9.1 — Architecture physique (déploiement 3-tiers)

**[Image : Architecture physique de PaieZone]**

```
  ┌───────────────────────────────────────────────────────────────┐
  │  TIER 1 — CLIENT                                              │
  │  Navigateur web (Chrome / Firefox / Edge)                     │
  │  Angular SPA — HTTPS — Appels REST asynchrones               │
  └─────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS / JWT
  ┌─────────────────────────▼─────────────────────────────────────┐
  │  TIER 2 — SERVEUR APPLICATIF                                  │
  │  Spring Boot 4.0 (JAR Docker)  |  Swagger/OpenAPI 3          │
  │  Spring Security JWT  |  Redis (cache)  |  Kafka (async)      │
  │  Ollama phi3 (IA locale — aucune donnée vers cloud)          │
  └─────────────────────────┬─────────────────────────────────────┘
                            │ JDBC / SET search_path
  ┌─────────────────────────▼─────────────────────────────────────┐
  │  TIER 3 — PERSISTANCE                                         │
  │  PostgreSQL 15  ┌──────────────┬──────────────┬────────────┐  │
  │                 │ schema_public│ schema_acme  │ schema_xyz │  │
  │                 │ (Super Admin)│ (Entreprise A)│(Entreprise B│ │
  │                 └──────────────┴──────────────┴────────────┘  │
  │  Liquibase — migrations versionnées automatiques              │
  └───────────────────────────────────────────────────────────────┘
```

### 9.2 — Architecture logique N-tiers (Spring Boot / Angular)

**[Image : Architecture logique N-tiers de PaieZone]**

| Couche | Rôle | Annotations Spring |
|---|---|---|
| **Présentation** | Expose les endpoints `/api/pz/` | `@RestController`, `@Valid` |
| **Service** | Logique métier, règles LF 2026, workflows | `@Service`, `@Transactional` |
| **Repository** | Accès BDD + filtre multi-tenant | Spring Data JPA, Hibernate |
| **Domaine** | Entités JPA et DTOs | `@Entity`, MapStruct |
| **Sécurité (transversal)** | JWT + RBAC | Spring Security, `@PreAuthorize` |
| **Audit (transversal)** | Journal immuable automatique | Spring AOP |

---

# ╔══════════════════════════════════════════════╗
# ║   SLIDE 10 — IDENTIFICATION DES ACTEURS     ║
# ╚══════════════════════════════════════════════╝

### 5 acteurs — Rôles & Responsabilités

| Acteur | Responsabilités principales |
|---|---|
| **Super Admin** | Supervise tous les tenants — gère abonnements SaaS — configure les paramètres réglementaires globaux (taux LF) |
| **Admin Entreprise** | Gère sa société — utilisateurs internes — journal d'audit — informations légales |
| **RH / Comptable** | Gère employés, contrats, paie, congés, déclarations, documents officiels — utilise PaieBot |
| **Manager** | Approuve les demandes de congés de son équipe |
| **Employé** | Consulte son espace personnel — soumet congés & avances — interagit avec PaieBot |

> **NB :** L'Admin hérite de la **totalité** des fonctionnalités du RH,
> en plus de ses propres prérogatives d'administration.

---

# ╔══════════════════════════════════════════════╗
# ║    SLIDE 11 — BESOINS FONCTIONNELS          ║
# ╚══════════════════════════════════════════════╝

### Fonctionnalités par acteur

| Acteur | Fonctionnalités |
|---|---|
| **Tout utilisateur** | S'authentifier (2FA pour comptes sensibles) |
| **Super Admin** | Visualiser/superviser les tenants — Gérer abonnements — Gérer paramètres réglementaires — Gérer conventions sectorielles (IA) |
| **Admin** | Créer/modifier/désactiver entreprise — Gérer utilisateurs — Journal d'audit — Structure organisationnelle (départements/postes) — Gérer employés et contrats — Paie — Congés — Déclarations — Documents officiels |
| **RH / Comptable** | Structure organisationnelle — Gestion des dossiers salariés — Contrats — Documents — Paie (bulletins, rubriques, primes) — Avances — Congés & absences — Déclarations (CNSS/CAVIS/IRPP) — Attestations — Export SAGE — PaieBot |
| **Employé** | Consulter son espace personnel — Télécharger ses bulletins — Demander congé/avance — Consulter solde congés — PaieBot |

---

# ╔══════════════════════════════════════════════╗
# ║   SLIDE 12 — BESOINS NON FONCTIONNELS       ║
# ╚══════════════════════════════════════════════╝

### Contraintes qualité de la plateforme

| Exigence | Mécanisme technique |
|---|---|
| **Confidentialité** | Schéma PostgreSQL dédié par tenant — `SET search_path` — aucune donnée croisée |
| **Sécurité** | JWT à durée limitée — RBAC `@PreAuthorize` — 2FA TOTP (Super Admin, Admin) — AuditLog append-only |
| **Performance** | HikariCP connection pooling — Kafka async — **500 employés calculés en < 30 secondes** |
| **Responsivité** | SPA Angular responsive — temps de réponse API **< 2 secondes** |
| **Extensibilité** | Taux légaux en BDD — modifiables sans redéploiement — adaptation annuelle LF sans code |
| **Traçabilité** | Chaque action enregistrée : `User + Action + Date + IP + valeurs avant/après` |
| **Disponibilité** | Architecture stateless Spring Boot — scalabilité horizontale via Docker |

---

# ╔══════════════════════════════════════════════════════╗
# ║  SLIDE 13 — DIAGRAMME DE CAS D'UTILISATION GLOBAL  ║
# ╚══════════════════════════════════════════════════════╝

### Vue d'ensemble fonctionnelle de PaieZone RH

**[Image : Diagramme de cas d'utilisation global de PaieZone RH]**

**16 épics fonctionnels regroupés en 4 domaines :**

```
  ┌─────────────────┬──────────────────┬──────────────────┬────────────────┐
  │   SÉCURITÉ &    │   GESTION RH     │   PAIE &         │  IA &          │
  │   ACCÈS         │   DES EMPLOYÉS   │   CONFORMITÉ     │  COMPTABILITÉ  │
  ├─────────────────┼──────────────────┼──────────────────┼────────────────┤
  │ Authentification│ Capital humain   │ Paramètres règl. │ Chatbot IA     │
  │ Inscription     │ Contrats travail │ Gestion de paie  │ Plan comptable │
  │ Utilisateurs    │ Documents admins │ Congés/Absences  │ Export SAGE    │
  │ Journal d'audit │ Historisation    │                  │ Déclarations   │
  │ Structure org.  │                  │                  │ Documents RH   │
  │ Abonnements SaaS│                  │                  │                │
  └─────────────────┴──────────────────┴──────────────────┴────────────────┘
        Sprint 1           Sprint 2          Sprint 3          Sprint 4
```

---

# ╔══════════════════════════════════════════════════════╗
# ║  SLIDE 14 — BACKLOG & PLANIFICATION DES SPRINTS     ║
# ╚══════════════════════════════════════════════════════╝

### 61 User Stories — 16 Épics — 4 Sprints × 3 semaines

| Sprint | Épics couverts | # US | Durée |
|---|---|---|---|
| **Sprint 1** — Socle & Sécurité | Authentification, Entreprises, Utilisateurs, Audit, Structure org. | 18 | 3 semaines |
| **Sprint 2** — Gestion RH | Capital humain, Contrats, Documents, Historisation | 10 | 3 semaines |
| **Sprint 3** — Paie & Congés | Paramètres réglementaires, Paie, Congés/Absences | 18 | 3 semaines |
| **Sprint 4** — IA & Conformité | Comptabilité, Déclarations, Documents RH, Chatbot IA | 15 | 3 semaines |

**Niveaux de priorité du backlog :**

| Priorité | Signification | Exemple |
|---|---|---|
| 🔴 Critique | Bloquant pour le sprint suivant | Authentification, Calcul bulletins |
| 🟠 Haute | Valeur métier élevée | Gestion employés, Déclarations CNSS |
| 🟡 Moyenne | Important mais non bloquant | Filtres, Historique |
| 🟢 Faible | Amélioration confort | Export formats secondaires |

---
---

# ╔══════════════════════════════════════════════════╗
# ║   PARTIE 3 — RÉALISATION                        ║
# ╚══════════════════════════════════════════════════╝

---
---

# ╔══════════════════════════════════════════════════════════════════╗
# ║    SPRINT 1 — SOCLE TECHNIQUE & AUTHENTIFICATION                ║
# ╚══════════════════════════════════════════════════════════════════╝

---

# ╔════════════════════════════════════════════════════╗
# ║  SLIDE 15 — SPRINT 1 : USER STORIES & BACKLOG    ║
# ╚════════════════════════════════════════════════════╝

**Objectif du Sprint 1 :**
> *"Établir les fondations sécurisées de la plateforme : permettre à une société
> de s'inscrire, à ses utilisateurs de s'authentifier et à l'Admin de structurer
> son organisation."*

**18 User Stories — Backlog détaillé :**

| ID | User Story | Tâches principales | Est.(j) | Priorité |
|---|---|---|---|---|
| 1.1 | S'authentifier afin d'accéder au système | Interface login, logique JWT/Spring Security, tests rôles | 2 | 🔴 Critique |
| 1.2 | S'inscrire + enregistrer la société | Formulaire multi-étapes, Tenant Provisioning, email confirmation | 3 | 🔴 Critique |
| 2.1 | Modifier les informations de l'entreprise | Interface mise à jour, API backend, tests persistance | 1.5 | 🟠 Haute |
| 2.2 | Désactiver une entreprise | Logique blocage accès backend, tests impact utilisateurs | 1.5 | 🟠 Haute |
| 2.3 | Affecter un abonnement SaaS (Super Admin) | Interface plans, logique d'affectation | 1.5 | 🔴 Critique |
| 2.4 | Modifier un abonnement | Interface modification plan | 1 | 🟡 Moyenne |
| 2.5 | Résilier un abonnement | Logique résiliation + tests | 1 | 🟡 Moyenne |
| 3.1 | Créer un utilisateur | Formulaire, API, attribution rôle | 2 | 🔴 Critique |
| 3.2 | Modifier un utilisateur | Interface mise à jour profil + droits | 1 | 🟠 Haute |
| 3.3 | Désactiver un utilisateur | Révocation accès immédiate | 1 | 🟠 Haute |
| 4.1 | Consulter le journal d'audit | Interface liste actions enregistrées | 1.5 | 🟠 Haute |
| 4.2 | Filtrer le journal d'audit | Filtres : date, utilisateur, action | 1.5 | 🟡 Moyenne |
| 5.1 | Créer un département | Interface + service backend | 1 | 🟠 Haute |
| 5.2 | Modifier un département | Interface + mise à jour BDD | 1 | 🟠 Haute |
| 5.3 | Désactiver un département | Désactivation logique + tests contraintes | 1 | 🟡 Moyenne |
| 5.4 | Créer un poste | Interface rattachement à département | 1 | 🟠 Haute |
| 5.5 | Modifier un poste | Mise à jour données poste | 1 | 🟡 Moyenne |
| 5.6 | Désactiver un poste | Logique retrait + cohérence organigramme | 1 | 🟡 Moyenne |

---

# ╔══════════════════════════════════════════════════════════════╗
# ║  SLIDE 16 — SPRINT 1 : DIAGRAMME DE CAS D'UTILISATION      ║
# ╚══════════════════════════════════════════════════════════════╝

**[Image : Diagramme de cas d'utilisation raffiné du Sprint 1]**

### Responsabilités par acteur

**VISITEUR :**
- S'inscrire et enregistrer la société (provisionnement schéma PG automatique)

**ADMIN :**
- Mettre à jour les informations de l'entreprise
- Administrer les comptes utilisateurs (création, modification, suspension)
- Configurer la structure interne (départements et postes)
- Consulter & filtrer le journal d'audit
- *Relations :* `<<include>>` Authentification — `<<include>>` Système d'audit

**SUPER ADMIN :**
- Affecter, modifier et résilier les plans d'abonnement SaaS des entreprises
- Consulter la liste globale des entreprises

**RH :**
- Créer et gérer les départements et les postes

**<<system>> Système d'audit :**
- Déclenché automatiquement par AOP sur toute action de création/modification/suppression

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 17 — SPRINT 1 : SCÉNARIOS                ║
# ╚══════════════════════════════════════════════════╝

### Cas d'utilisation 1 — S'authentifier

| Élément | Description |
|---|---|
| **Acteur principal** | Utilisateur (Admin / RH / Super Admin / Employé) |
| **Préconditions** | Compte actif — identifiants de connexion connus |
| **Postconditions** | Utilisateur connecté — redirigé vers son tableau de bord personnalisé |
| **Scénario principal** | 1. Accès à la page de connexion |
| | 2. Saisie e-mail + mot de passe |
| | 3. Vérification des identifiants |
| | 4. Identification du rôle et du tenant (companyId) |
| | 5. Génération du token JWT |
| | 6. Redirection vers le dashboard adapté au rôle |
| **Alt. A1** | Identifiants incorrects → message d'erreur, nouvelle saisie |
| **Alt. A2** | Compte suspendu → message informatif, accès refusé |

### Cas d'utilisation 2 — S'inscrire et enregistrer la société

| Élément | Description |
|---|---|
| **Acteur principal** | Visiteur |
| **Préconditions** | Aucun compte PaieZone — e-mail non encore utilisé |
| **Postconditions** | Espace isolé créé (schéma PG provisionné) — Visiteur devient Admin — e-mail envoyé |
| **Scénario principal** | 1. Accès au formulaire d'inscription |
| | 2. Saisie informations personnelles + informations société (raison sociale, matricule fiscal…) |
| | 3. Validation des données |
| | 4. Provisionnement automatique d'un schéma PostgreSQL dédié |
| | 5. Création du compte Admin lié à la société |
| | 6. Envoi d'un e-mail de confirmation |
| | 7. Redirection vers la page de connexion |
| **Alt. A1** | E-mail déjà utilisé → message d'erreur doublon |
| **Alt. A2** | Données invalides → erreurs de validation champ par champ |

### Cas d'utilisation 3 — Gérer les utilisateurs

| Élément | Description |
|---|---|
| **Acteur principal** | Admin |
| **Préconditions** | Authentifié avec droits Admin |
| **Postconditions** | Utilisateur créé / modifié / désactivé — action enregistrée dans le journal d'audit |
| **Scénario principal** | 1. Accès à l'interface de gestion des utilisateurs |
| | 2. Consultation de la liste des utilisateurs de la société |
| | 3. Sélection de l'action (créer / modifier / désactiver) |
| | 4. Saisie ou mise à jour des informations dans le formulaire |
| | 5. Validation et persistance en base |
| | 6. Enregistrement automatique dans le journal d'audit |
| | 7. Affichage du message de confirmation |
| **Alt. A1** | Droits insuffisants → exception Spring Security levée |
| **Alt. A2** | E-mail déjà utilisé (création) → blocage + validation affichée |

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 18 — SPRINT 1 : DIAGRAMME DE CLASSES    ║
# ╚══════════════════════════════════════════════════╝

**[Image : Diagramme de classes du Sprint 1]**

### Structure des entités — Sprint 1

```
Company (name, taxId, cnssId, tenantSchema, active)
  │
  ├──── CompanySubscription (plan: STARTER|PME|BUSINESS, status, maxEmployees)
  │
  ├──── UserProfile (jhiUserId, role: AppRole, twoFactorEnabled, active)
  │         │
  │         └──── AuditLog (action, entityType, oldValue, newValue, ip, timestamp)
  │
  ├──── Department (name, active)
  │         └──── JobPosition (title, active)
  │
  └──── tenantSchema → SET search_path TO <schema>

AppRole : SUPER_ADMIN | ADMIN | RH_COMPTABLE | MANAGER | EMPLOYE
PlanType : STARTER | PME | BUSINESS | ENTERPRISE | CUSTOM
```

---

# ╔══════════════════════════════════════════════════════╗
# ║  SLIDE 19 — SPRINT 1 : DIAGRAMMES DE SÉQUENCE      ║
# ╚══════════════════════════════════════════════════════╝

### Séquence 1 — Authentification JWT

**[Image : Diagramme de séquence — Authentification]**

```
Utilisateur   Angular SPA   AuthResource   UserService   JWT Util   DB
    │              │              │              │            │        │
    │── POST /login ─────────────►│              │            │        │
    │              │              │── findUser ──►│            │        │
    │              │              │              │── query ────────────►│
    │              │              │              │◄── User ────────────│
    │              │              │── verify pwd ►│            │        │
    │              │              │── genToken(role, tenant) ──►│       │
    │              │◄── JWT token ─│              │            │        │
    │◄── redirect dashboard[role] ─│              │            │        │
```

### Séquence 2 — Création utilisateur + enregistrement audit

**[Image : Diagramme de séquence — Création utilisateur avec audit]**

```
Admin   Angular   UserResource   UserService   AuditAspect   DB
  │        │            │             │              │          │
  │─create►│            │             │              │          │
  │        │── POST ───►│             │              │          │
  │        │            │── createUser►             │          │
  │        │            │             │── save ──────────────── ►│
  │        │            │             │◄── OK ──────────────────│
  │        │            │             │── logAction ─►│          │
  │        │            │             │              │── INSERT audit ──►│
  │        │◄── 201 ────│             │              │          │
```

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 20 — SPRINT 1 : RÉALISATION              ║
# ╚══════════════════════════════════════════════════╝

### Interfaces réalisées — Sprint 1

**[Grille d'images 2×3]**

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│  Formulaire          │  Page de connexion    │  Dashboard SuperAdmin │
│  d'inscription       │  PaieZone RH          │  (liste tous tenants) │
│  (infos perso + sté) │  (JWT + 2FA)          │                       │
├──────────────────────┼──────────────────────┼──────────────────────┤
│  Dashboard Admin     │  Gestion utilisateurs │  Journal d'audit      │
│  (modules société)   │  (liste + formulaire) │  (liste + filtres)    │
└──────────────────────┴──────────────────────┴──────────────────────┘
```

> Redirection différenciée par rôle :
> SUPER_ADMIN → vue globale tous tenants | ADMIN → sa société | RH → modules paie | EMPLOYE → espace personnel

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 21 — SPRINT 1 : TESTS & RITUELS AGILES  ║
# ╚══════════════════════════════════════════════════╝

### Plan de tests — Sprint 1

| ID | Description | Résultat attendu | Statut |
|---|---|---|---|
| T-1.1 | Authentification avec identifiants valides | Token JWT généré — accès autorisé | ✅ OK |
| T-1.2 | Authentification avec compte désactivé | Accès refusé — message explicite | ✅ OK |
| T-2.1 | Inscription nouvelle entreprise | Schéma PostgreSQL isolé créé | ✅ OK |
| T-3.1 | Création utilisateur avec attribution de rôle | Utilisateur persisté avec droits | ✅ OK |
| T-3.2 | Désactivation d'un utilisateur actif | Accès révoqué immédiatement | ✅ OK |
| T-4.1 | Enregistrement automatique dans le journal d'audit | Trace : User + Action + Date + IP | ✅ OK |
| T-5.1 | Création département + poste rattaché | Structure mise à jour avec succès | ✅ OK |
| T-5.2 | Suppression département avec postes actifs | Blocage + alerte de sécurité | ✅ OK |

### Rituels Scrum — Sprint 1

**Sprint Review :** 18 User Stories présentées et validées par le Product Owner ✅

**Sprint Retrospective :**
- ✅ Ce qui a bien fonctionné : AOP audit performant, intégration frontend/backend fluide
- ⚠️ À améliorer : configuration Tenant Provisioning plus complexe que prévu
- 🎯 Action Sprint 2 : anticiper les tâches d'infrastructure dès le début du sprint

---
---

# ╔══════════════════════════════════════════════════════════════════╗
# ║    SPRINT 2 — GESTION RH DES EMPLOYÉS                          ║
# ╚══════════════════════════════════════════════════════════════════╝

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 22 — SPRINT 2 : USER STORIES & BACKLOG  ║
# ╚══════════════════════════════════════════════════╝

**Objectif du Sprint 2 :**
> *"Permettre à l'équipe RH de gérer l'intégralité du dossier administratif d'un
> employé — de son recrutement à la formalisation de sa relation contractuelle."*

**10 User Stories — Backlog détaillé :**

| ID | User Story | Tâches principales | Est.(j) | Priorité |
|---|---|---|---|---|
| 6.1 | Consulter la liste des employés | Interface tableau paginé + filtres, API REST | 1 | 🟠 Haute |
| 6.2 | Créer un employé (matricule unique auto) | Formulaire complet, génération matricule, API insertion | 2 | 🔴 Critique |
| 6.3 | Consulter le profil complet d'un employé | Vue détaillée (onglets infos/contrats/docs), API REST | 1 | 🟠 Haute |
| 6.4 | Modifier un employé | Interface modification + mise à jour BDD | 1 | 🟠 Haute |
| 6.5 | Désactiver un employé | Désactivation logique + désactivation compte associé | 1 | 🟠 Haute |
| 7.1 | Associer un contrat à un employé (CDI/CDD/CIVP/KARAMA) | Interface contrat, types, règles, alerte expiration | 2 | 🔴 Critique |
| 7.2 | Modifier un contrat | Formulaire pré-rempli, transitions de statut, cohérence dates | 1.5 | 🟠 Haute |
| 7.3 | Résilier un contrat | Motif obligatoire, date effective, statut RÉSILIÉ, blocage modif. | 1.5 | 🟠 Haute |
| 8.1 | Uploader un document dans le dossier employé | Interface upload, stockage PDF/image, contrôles format | 3 | 🟡 Moyenne |
| 9.x | Consulter l'historique des modifications | Interface historique avec filtres par date/acteur | 1 | 🟠 Haute |

---

# ╔══════════════════════════════════════════════════════════════╗
# ║  SLIDE 23 — SPRINT 2 : DIAGRAMME DE CAS D'UTILISATION      ║
# ╚══════════════════════════════════════════════════════════════╝

**[Image : Diagramme de cas d'utilisation du Sprint 2]**

### 3 packages fonctionnels

**Package Gestion du Capital Humain**

**ADMIN :**
- Consulter la liste complète des employés
- Accéder au profil détaillé d'un employé
- Désactiver un employé (gérer les sorties)

**RH :**
- CRUD complet du dossier employé (créer, consulter, modifier, désactiver)

**Package Gestion des Contrats de Travail**

**RH :**
- Consulter la liste des contrats de travail
- `<<extend>>` Associer un contrat
- `<<extend>>` Modifier un contrat
- `<<extend>>` Résilier un contrat

**<<system>> Système d'alertes :**
- Notification automatique avant l'expiration d'un contrat CDD

**Package Gestion des Documents Administratifs**

**RH :**
- Uploader un document dans le dossier employé
- Consulter et filtrer l'historique des modifications

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 24 — SPRINT 2 : SCÉNARIOS                ║
# ╚══════════════════════════════════════════════════╝

### Cas d'utilisation 1 — Créer un employé

| Élément | Description |
|---|---|
| **Acteur principal** | Admin / RH |
| **Préconditions** | Authentifié (Admin ou RH) — au moins un département et un poste actifs existent |
| **Postconditions** | Profil employé enregistré avec matricule unique généré automatiquement |
| **Scénario principal** | 1. Accès au formulaire de création |
| | 2. Saisie informations personnelles (nom, prénom, naissance, nationalité, genre, coordonnées) |
| | 3. Sélection département et poste de rattachement |
| | 4. Validation des données |
| | 5. Génération automatique du matricule unique |
| | 6. Enregistrement + message de confirmation |
| **Alt. A1** | Données obligatoires manquantes → validation affichée sur les champs concernés |
| **Alt. A2** | Département ou poste inactif → message d'erreur |

### Cas d'utilisation 2 — Gérer les contrats de travail

| Élément | Description |
|---|---|
| **Acteur principal** | RH |
| **Préconditions** | Authentifié RH — profil employé actif existant |
| **Postconditions** | Contrat associé / modifié / résilié — alerte expiration programmée si CDD |
| **Scénario principal** | 1. Accès à l'onglet Contrats du dossier employé |
| | 2. Sélection du type (CDI / CDD / CIVP / KARAMA) |
| | 3. Saisie des conditions (date début, durée, salaire brut) |
| | 4. Validation et enregistrement |
| | 5. Alerte automatique programmée avant l'expiration |
| **Alt. A1** | Résiliation → motif obligatoire + date effective + passage statut RÉSILIÉ |
| **Alt. A2** | Modification post-résiliation → bloquée |

### Cas d'utilisation 3 — Déposer un document administratif

| Élément | Description |
|---|---|
| **Acteur principal** | RH |
| **Préconditions** | Authentifié RH — dossier employé existant |
| **Postconditions** | Document stocké — consultable selon le rôle |
| **Scénario principal** | 1. Accès à l'onglet Documents du dossier |
| | 2. Sélection du type de document (contrat scanné, diplôme, CIN…) |
| | 3. Upload du fichier (PDF / image) |
| | 4. Contrôle de format et de taille |
| | 5. Document enregistré et consultable |
| **Alt. A1** | Format non autorisé → rejet avec message d'erreur |

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 25 — SPRINT 2 : DIAGRAMME DE CLASSES    ║
# ╚══════════════════════════════════════════════════╝

**[Image : Diagramme de classes du Sprint 2]**

```
Employee (matricule, firstName, lastName, birthDate, gender, active)
  │
  ├──── Contract (type: CDI|CDD|CIVP|KARAMA, startDate, endDate,
  │              grossSalary, statut: ACTIF|RÉSILIÉ|EXPIRÉ)
  │
  ├──── HrDocument (type, fileName, fileUrl, uploadedAt)
  │
  ├──── PaySlip (period, grossPay, netPay, pdfUrl)    [historique]
  │
  ├──── BankAccount (rib, bankName, branchCode)
  │
  ├──── UserProfile (→ compte accès JWT)
  │
  └──── JobPosition (→ Department)
```

---

# ╔══════════════════════════════════════════════════════╗
# ║  SLIDE 26 — SPRINT 2 : DIAGRAMMES DE SÉQUENCE      ║
# ╚══════════════════════════════════════════════════════╝

### Séquence 1 — Création d'un employé

**[Image : Diagramme de séquence — Création d'un employé]**

```
RH   Angular  EmployeeResource  EmployeeService  TenantContextSvc   DB
 │      │           │                │                  │             │
 │─crée►│           │                │                  │             │
 │      │─ POST ───►│                │                  │             │
 │      │           │── createEmp ──►│                  │             │
 │      │           │                │── getCompanyId ──►│            │
 │      │           │                │◄── companyId ─────│            │
 │      │           │                │── autoAssign company (ref JPA) │
 │      │           │                │── generateMatricule()          │
 │      │           │                │── save ────────────────────── ►│
 │      │◄── 201 ───│                │                  │             │
```

### Séquence 2 — Association d'un contrat à un employé

**[Image : Diagramme de séquence — Association contrat]**

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 27 — SPRINT 2 : RÉALISATION              ║
# ╚══════════════════════════════════════════════════╝

**[Grille d'images 2×2]**

```
┌───────────────────────────┬───────────────────────────┐
│  Liste des employés        │  Fiche employé détaillée  │
│  (tableau paginé + filtres)│  (onglets infos /         │
│                            │   contrats / documents)   │
├───────────────────────────┼───────────────────────────┤
│  Section Contrats          │  Section Documents         │
│  (CDI / CDD / CIVP /       │  (upload PDF +            │
│   KARAMA — résiliation)    │   consultation / aperçu)  │
└───────────────────────────┴───────────────────────────┘
```

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 28 — SPRINT 2 : TESTS & RITUELS AGILES  ║
# ╚══════════════════════════════════════════════════╝

| ID | Description | Résultat attendu | Statut |
|---|---|---|---|
| T-6.1 | Création employé avec données valides | Profil enregistré + matricule généré | ✅ OK |
| T-6.2 | Désactivation employé avec contrat actif | Désactivation logique + compte bloqué | ✅ OK |
| T-7.1 | Association contrat CDD avec expiration | Alerte automatique programmée | ✅ OK |
| T-7.2 | Modification post-résiliation | Opération bloquée — message d'erreur | ✅ OK |
| T-8.1 | Upload document format PDF | Document stocké — consultable selon rôle | ✅ OK |
| T-8.2 | Upload format non autorisé | Rejet avec message explicite | ✅ OK |

**Sprint Review :** Toutes les User Stories validées ✅
**Retrospective :** Amélioration de la gestion des cas limites de désactivation

---
---

# ╔══════════════════════════════════════════════════════════════════╗
# ║    SPRINT 3 — MOTEUR DE PAIE TUNISIEN                          ║
# ╚══════════════════════════════════════════════════════════════════╝

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 29 — SPRINT 3 : USER STORIES & BACKLOG  ║
# ╚══════════════════════════════════════════════════╝

**Objectif du Sprint 3 :**
> *"Mettre en place le moteur de calcul de paie conforme à la Loi de Finances 2026
> et gérer les temps : congés, absences, primes et avances sur salaire."*

**18 User Stories — Backlog détaillé :**

| ID | User Story | Est.(j) | Priorité |
|---|---|---|---|
| 10.1 | Consulter la liste des paramètres réglementaires | 0.5 | 🟠 Haute |
| 10.2 | Ajouter un paramètre réglementaire | 1 | 🟠 Haute |
| 10.3 | Modifier un paramètre réglementaire | 0.5 | 🟠 Haute |
| 10.4 | Consulter l'historique des modifications | 1 | 🟡 Moyenne |
| 11.1 | Créer une période de paie | 1 | 🔴 Critique |
| 11.2 | Modifier une période de paie | 1 | 🟠 Haute |
| 11.3 | Clôturer une période de paie | 1.5 | 🔴 Critique |
| 11.4 | Lancer le calcul de tous les bulletins d'une période | 3 | 🔴 Critique |
| 11.5 | Créer / modifier une rubrique de paie | 2 | 🟠 Haute |
| 11.6 | Ajouter / modifier une prime | 1.5 | 🟠 Haute |
| 11.7 | Valider / refuser une demande d'avance (RH) | 1 | 🟠 Haute |
| 11.8 | Demander une avance sur salaire (Employé) | 1 | 🟠 Haute |
| 11.9 | Générer un bulletin de paie PDF | 2 | 🔴 Critique |
| 12.1 | Créer un type de congé | 1 | 🟠 Haute |
| 12.2 | Demander un congé (Employé) | 1 | 🟠 Haute |
| 12.3 | Valider un congé (RH) | 1 | 🟠 Haute |
| 12.4 | Consulter son solde de congés (Employé) | 0.5 | 🟠 Haute |
| 12.5 | Gérer les jours fériés | 1 | 🟡 Moyenne |

---

# ╔══════════════════════════════════════════════════════════════╗
# ║  SLIDE 30 — SPRINT 3 : DIAGRAMME DE CAS D'UTILISATION      ║
# ╚══════════════════════════════════════════════════════════════╝

**[Image : Diagramme de cas d'utilisation du Sprint 3]**

### 3 packages fonctionnels

**Package Paramètres Réglementaires (Super Admin) :**
- Consulter la liste des paramètres réglementaires
- `<<extend>>` Ajouter un paramètre réglementaire
- `<<extend>>` Modifier un paramètre réglementaire
- Consulter l'historique des modifications

**Package Gestion de la Paie (RH / Admin) :**
- Gérer les périodes de paie (créer / modifier / clôturer)
- Lancer le calcul en masse des bulletins
- Gérer les rubriques et primes de paie
- Valider / refuser les demandes d'avance
- Générer les bulletins de paie PDF

**Package Gestion des Congés & Absences :**
- RH : créer types de congés, valider demandes, gérer jours fériés
- Employé : demander un congé, consulter son solde, demander une avance

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 31 — SPRINT 3 : FORMULES DE PAIE LF 2026║
# ╚══════════════════════════════════════════════════╝

### Moteur de calcul — Barème Loi de Finances 2026

**Calcul du salaire net :**

```
  Salaire Brut
    – CNSS salarié     =  9,18 %  du brut
    – CAVIS            =  1,00 %  du brut
    – CSS              =  0,50 %  du brut
    ─────────────────────────────────────
    = Salaire Net Imposable (SNI)
    – IRPP             =  Barème progressif LF 2026
    ─────────────────────────────────────
    = Salaire Net à Payer
```

**Barème IRPP progressif 2026 :**

| Tranche annuelle | Taux |
|---|---|
| 0 → 5 000 DT | 0 % |
| 5 001 → 20 000 DT | 26 % |
| 20 001 → 30 000 DT | 28 % |
| 30 001 → 50 000 DT | 32 % |
| > 50 000 DT | 35 % |

**Cotisations patronales :**

```
  + CNSS patronal    = 16,57 %  du brut
  + TFP              =  1,00 %  du brut
  ─────────────────────────────────────
  = Coût total employeur
```

> ⚠️ **RÈGLE D'OR :** Ces formules sont figées dans `PayrollCalculationServiceImpl`
> + `TunisianTaxService` — validées par expert-comptable.

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 32 — SPRINT 3 : SCÉNARIOS                ║
# ╚══════════════════════════════════════════════════╝

### Cas d'utilisation 1 — Lancer le calcul des bulletins

| Élément | Description |
|---|---|
| **Acteur principal** | RH / Admin |
| **Préconditions** | Période de paie en statut OUVERTE — employés actifs avec contrats valides |
| **Postconditions** | Bulletins générés pour tous les employés — disponibles en PDF |
| **Scénario principal** | 1. Accès à l'interface des périodes de paie |
| | 2. Sélection de la période en statut OUVERTE |
| | 3. Lancement du calcul en masse |
| | 4. Le moteur calcule pour chaque employé : CNSS + CAVIS + CSS + IRPP |
| | 5. Les rubriques (primes, avances) sont intégrées |
| | 6. Bulletins générés et stockés |
| | 7. Récapitulatif : masse salariale totale + cotisations |
| **Alt. A1** | Employé sans contrat actif → exclusion + avertissement |

### Cas d'utilisation 2 — Clôturer une période de paie

| Élément | Description |
|---|---|
| **Acteur principal** | RH / Admin |
| **Préconditions** | Bulletins calculés — période OUVERTE |
| **Postconditions** | Période CLÔTURÉE — bulletins verrouillés — archivés en PDF |
| **Scénario principal** | 1. Vérification des bulletins générés |
| | 2. Lancement de la clôture |
| | 3. Passage en statut CLÔTURÉE |
| | 4. Bulletins archivés, téléchargeables, non modifiables |
| **Alt. A1** | Bulletins non calculés → clôture bloquée |

### Cas d'utilisation 3 — Demande et traitement d'une avance sur salaire

| Élément | Description |
|---|---|
| **Acteur principal** | Employé (demande) — RH (traitement) |
| **Préconditions** | Employé actif — contrat valide — période de paie ouverte |
| **Postconditions** | Avance accordée ou refusée — décomptée du bulletin si validée |
| **Scénario principal** | 1. L'employé soumet une demande (montant + motif) |
| | 2. Le RH consulte la demande en attente |
| | 3. Le RH valide ou refuse avec commentaire |
| | 4. Si validée : montant déduit du prochain bulletin |
| | 5. L'employé est notifié de la décision |
| **Alt. A1** | Montant > seuil configuré → alerte au RH |

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 33 — SPRINT 3 : DIAGRAMME DE CLASSES    ║
# ╚══════════════════════════════════════════════════╝

**[Image : Diagramme de classes Sprint 3]**

```
PayPeriod (month, year, statut: OUVERTE|CLÔTURÉE)
  │
  └──── PaySlip (grossPay, netPay, cnss, cavis, irpp, pdfUrl)
           │
           └──── PaySlipRubrique (type: PRIME|RETENUE|AVANCE, amount)

RegulatoryParameter (name: CNSS_RATE|CAVIS_RATE…, value, effectiveFrom)
  └──── RegulatoryParameterHistory (oldValue, changedAt, changedBy)

LeaveType (name, maxDays, isPaid)
LeaveRequest (startDate, endDate, statut: PENDING|APPROVED|REFUSED)
  └──── Employee

LeaveBalance (totalDays, usedDays, remainingDays)
  └──── Employee

SalaryAdvance (amount, requestedAt, statut: PENDING|APPROVED|REFUSED)
  └──── Employee
```

---

# ╔══════════════════════════════════════════════════════╗
# ║  SLIDE 34 — SPRINT 3 : DIAGRAMMES DE SÉQUENCE      ║
# ╚══════════════════════════════════════════════════════╝

### Séquence 1 — Lancer le calcul des bulletins

**[Image : Diagramme de séquence — Calcul des bulletins]**

```
RH   Angular  PayrollResource  PayrollCalcService  TunisianTaxService  DB
 │      │           │                │                    │              │
 │─calc►│           │                │                    │              │
 │      │── POST ──►│                │                    │              │
 │      │           │── calcAll ────►│                    │              │
 │      │           │                │ for each employee  │              │
 │      │           │                │── calcCNSS(brut) ──►│             │
 │      │           │                │── calcIRPP(SNI) ───►│             │
 │      │           │                │◄── net pay ─────────│             │
 │      │           │                │── savePaySlip ──────────────────► │
 │      │◄── résumé─│                │                    │              │
```

### Séquence 2 — Clôturer une période de paie

**[Image : Diagramme de séquence — Clôture période de paie]**

### Séquence 3 — Demande et validation d'un congé

**[Image : Diagramme de séquence — Workflow congé]**

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 35 — SPRINT 3 : RÉALISATION              ║
# ╚══════════════════════════════════════════════════╝

**[Grille d'images 2×3]**

```
┌──────────────────────┬──────────────────────┬──────────────────────┐
│  Paramètres          │  Périodes de paie     │  Bulletin de paie    │
│  réglementaires      │  (OUVERTE/CLÔTURÉE)   │  généré en PDF       │
│  (taux CNSS/IRPP)    │  + calcul en masse    │  (JasperReports)     │
├──────────────────────┼──────────────────────┼──────────────────────┤
│  Rubriques & Primes  │  Demandes de congé    │  Solde de congés     │
│  (type + montant)    │  (workflow validation)│  (par type / employé)│
└──────────────────────┴──────────────────────┴──────────────────────┘
```

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 36 — SPRINT 3 : TESTS & RITUELS AGILES  ║
# ╚══════════════════════════════════════════════════╝

| ID | Description | Résultat attendu | Statut |
|---|---|---|---|
| T-11.1 | Calcul bulletin employé (cas standard) | Net = Brut – CNSS – CAVIS – CSS – IRPP | ✅ OK |
| T-11.2 | Calcul IRPP sur plusieurs tranches | Résultat conforme au barème LF 2026 | ✅ OK |
| T-11.3 | Clôture période sans bulletins calculés | Clôture bloquée | ✅ OK |
| T-11.4 | Avance déduite du bulletin | Montant correctement retranché | ✅ OK |
| T-12.1 | Demande congé — validation workflow | Statut APPROVED — solde décompté | ✅ OK |
| T-12.2 | Refus congé par RH | Statut REFUSED — solde inchangé | ✅ OK |

**Sprint Review :** 18 User Stories validées ✅

---
---

# ╔══════════════════════════════════════════════════════════════════╗
# ║    SPRINT 4 — INTELLIGENCE ARTIFICIELLE & CONFORMITÉ           ║
# ╚══════════════════════════════════════════════════════════════════╝

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 37 — SPRINT 4 : USER STORIES & BACKLOG  ║
# ╚══════════════════════════════════════════════════╝

**Objectif du Sprint 4 :**
> *"Déployer PaieBot (assistant IA local), garantir la conformité réglementaire
> complète et assurer l'intégration comptable avec export SAGE."*

**15 User Stories — Backlog détaillé :**

| ID | User Story | Est.(j) | Priorité |
|---|---|---|---|
| 13.1 | Configurer le plan comptable | 2 | 🟠 Haute |
| 13.2 | Exporter les données comptables (SAGE) | 2 | 🟠 Haute |
| 14.1 | Générer une déclaration CNSS salarié | 2 | 🔴 Critique |
| 14.2 | Générer une déclaration CNSS employeur | 1.5 | 🔴 Critique |
| 14.3 | Générer une déclaration CAVIS | 1.5 | 🟠 Haute |
| 14.4 | Générer une déclaration IRPP | 2 | 🔴 Critique |
| 15.1 | Générer une attestation de salaire (PDF) | 1.5 | 🟠 Haute |
| 15.2 | Générer un certificat de travail (PDF) | 1.5 | 🟠 Haute |
| 16.1 | Utiliser le chatbot RH (questions langage naturel) | 3 | 🟡 Moyenne |
| 16.2 | Demander un congé via le chatbot | 1 | 🟡 Moyenne |
| 16.3 | Consulter son bulletin via le chatbot | 1 | 🟡 Moyenne |

---

# ╔══════════════════════════════════════════════════════════════╗
# ║  SLIDE 38 — SPRINT 4 : DIAGRAMME DE CAS D'UTILISATION      ║
# ╚══════════════════════════════════════════════════════════════╝

**[Image : Diagramme de cas d'utilisation du Sprint 4]**

### 4 packages fonctionnels

**Package Intégration Comptable (RH / Admin) :**
- Configurer le plan comptable
- Exporter les données (format SAGE)

**Package Conformité & Déclarations (RH / Admin) :**
- Générer déclaration CNSS salarié / CNSS employeur
- Générer déclaration CAVIS
- Générer déclaration IRPP

**Package Documents Officiels RH (RH / Admin) :**
- Générer attestation de salaire (PDF JasperReports)
- Générer certificat de travail (PDF JasperReports)

**Package Assistant IA — PaieBot (Employé / RH) :**
- Poser une question RH en langage naturel
- `<<extend>>` Demander un congé via le chatbot
- `<<extend>>` Consulter son bulletin via le chatbot
- `<<include>>` Détection d'intention (PERSONAL_SQL / LEGAL_RAG / GENERAL)

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 39 — SPRINT 4 : ARCHITECTURE PAIEBOT     ║
# ╚══════════════════════════════════════════════════╝

### PaieBot — Architecture RAG + Text-to-SQL

```
  Utilisateur ──► Composant Angular flottant
                        │
               POST /api/pz/chatbot/message
                        │
                  Intent Detector
         ┌──────────────┼──────────────┬────────────┐
         │              │              │            │
   PERSONAL_SQL    ADMIN_SQL      LEGAL_RAG     GENERAL
   (employé,       (RH/Admin)     (Code du      (FAQ RH)
    ses données)                   Travail TN)
         │              │              │
         ▼              ▼              ▼
   Text-to-SQL    Text-to-SQL    RAG Pipeline
   phi3 T=0.05    phi3 T=0.05    KnowledgeDocument
         │              │              │
         ▼              ▼              │
   Validation      Validation         │
   (blacklist      + cross-tenant     │
   DROP/DELETE…)   check              │
         │              │             │
         ▼              ▼             ▼
   search_path → SQL  search_path → SQL   Contexte juridique
   isolé par tenant   isolé par tenant    → Prompt Ollama
         │              │             │
         └──────────────┴─────────────┘
                        │
                  Réponse phi3
                        │
              Angular — Affichage chatbot
```

**3 protections IA :**

| Protection | Mécanisme |
|---|---|
| Anti-hallucination | Patterns regex → remplacement par refus poli |
| Anti cross-tenant | Validation companyId (extrait du JWT signé) |
| Anti-injection SQL | Blacklist (DROP, DELETE, UPDATE, INSERT, TRUNCATE…) |

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 40 — SPRINT 4 : SCÉNARIOS                ║
# ╚══════════════════════════════════════════════════╝

### Cas d'utilisation 1 — Générer les déclarations de conformité

| Élément | Description |
|---|---|
| **Acteur principal** | RH / Admin |
| **Préconditions** | Période de paie clôturée — bulletins validés |
| **Postconditions** | Fichier(s) de déclaration générés et téléchargeables |
| **Scénario principal** | 1. Accès à l'onglet Conformité |
| | 2. Sélection de la période et du type de déclaration |
| | 3. Agrégation des données depuis les bulletins clôturés |
| | 4. Génération du fichier (CNSS salarié, CNSS patronal, CAVIS, IRPP) |
| | 5. Téléchargement disponible |
| **Alt. A1** | Période non clôturée → génération bloquée avec message explicite |

### Cas d'utilisation 2 — Interagir avec PaieBot

| Élément | Description |
|---|---|
| **Acteur principal** | Employé / RH / Admin |
| **Préconditions** | Utilisateur authentifié — session chatbot initialisée |
| **Postconditions** | Réponse en langage naturel fournie OU action déclenchée |
| **Scénario principal** | 1. Ouverture du composant chatbot flottant |
| | 2. Saisie de la question en langage naturel |
| | 3. Détection de l'intention (PERSONAL_SQL / LEGAL_RAG / GENERAL) |
| | 4a. Si SQL → génération requête sécurisée → exécution → réponse data |
| | 4b. Si RAG → recherche Code du Travail → réponse juridique contextuelle |
| | 5. Réponse affichée avec contexte et source |
| **Alt. A1** | Cross-tenant détecté → refus immédiat |
| **Alt. A2** | Hallucination détectée → réponse de fallback sécurisée |
| **Alt. A3** | Injection SQL → blocage + alerte sécurité |

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 41 — SPRINT 4 : DIAGRAMME DE CLASSES    ║
# ╚══════════════════════════════════════════════════╝

**[Image : Diagramme de classes Sprint 4]**

```
ChatSession (channel, status, startedAt, employee)
  └──── ChatMessage (role: USER|ASSISTANT, content, intent,
                     sentAt, tokenUsed, errorOccurred)

MessageIntent : PERSONAL_SQL | ADMIN_SQL | LEGAL_RAG | GENERAL

KnowledgeDocument (title, content, fileUrl, vectorIndexed, company)
  └── Ingestion : KnowledgeDocumentSeeder (Code du Travail TN)

AccountingEntry (accountCode, debit, credit, label, period)
  └── plan comptable → export SAGE (CSV / XML)

ComplianceDeclaration (type: CNSS_SAL|CNSS_PAT|CAVIS|IRPP,
                       period, totalAmount, fileUrl)

HrDocument (type: ATTESTATION_SALAIRE|CERTIFICAT_TRAVAIL,
            generatedAt, pdfUrl, employee)
```

---

# ╔══════════════════════════════════════════════════════╗
# ║  SLIDE 42 — SPRINT 4 : DIAGRAMMES DE SÉQUENCE      ║
# ╚══════════════════════════════════════════════════════╝

### Séquence 1 — Générer une déclaration de conformité

**[Image : Diagramme de séquence — Génération déclaration]**

```
RH   Angular  ComplianceResource  ComplianceService  PaySlipRepo  FileService
 │      │           │                   │                │             │
 │─décl►│           │                   │                │             │
 │      │── POST ──►│                   │                │             │
 │      │           │── generateDecl ──►│                │             │
 │      │           │                   │── findByPeriod►│             │
 │      │           │                   │◄── paySlips ───│             │
 │      │           │                   │── aggregate(CNSS + IRPP)     │
 │      │           │                   │── generatePDF ──────────────►│
 │      │           │                   │◄── fileUrl ─────────────────│
 │      │◄── téléch─│                   │                │             │
```

### Séquence 2 — Interaction avec le chatbot RH (PaieBot)

**[Image : Diagramme de séquence — Chatbot IA]**

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 43 — SPRINT 4 : RÉALISATION              ║
# ╚══════════════════════════════════════════════════╝

**[Grille d'images 2×2]**

```
┌─────────────────────────────┬─────────────────────────────┐
│  Plan comptable              │  Onglet Conformité          │
│  & export SAGE               │  (CNSS / CAVIS / IRPP)      │
│  (configuration + interface) │  (déclarations télécharg.)  │
├─────────────────────────────┼─────────────────────────────┤
│  Attestation de salaire      │  PaieBot — Chatbot RH       │
│  & Certificat de travail     │  (composant flottant —      │
│  (génération PDF)            │   détection d'intention)    │
└─────────────────────────────┴─────────────────────────────┘
```

---

# ╔══════════════════════════════════════════════════╗
# ║  SLIDE 44 — SPRINT 4 : TESTS & RITUELS AGILES  ║
# ╚══════════════════════════════════════════════════╝

| ID | Description | Résultat attendu | Statut |
|---|---|---|---|
| T-14.1 | Génération CNSS — période clôturée | Fichier avec montants exacts | ✅ OK |
| T-14.2 | Génération IRPP annuel | Récapitulatif conforme LF 2026 | ✅ OK |
| T-16.1 | Chatbot — question personnelle (salaire) | Réponse SQL correcte et isolée | ✅ OK |
| T-16.2 | Chatbot — tentative cross-tenant | Refus immédiat — aucune donnée exposée | ✅ OK |
| T-16.3 | Chatbot — injection SQL | Blocage + alerte sécurité | ✅ OK |
| T-16.4 | Chatbot — question juridique (Code du Travail) | Réponse RAG contextuelle et sourcée | ✅ OK |

**Sprint Review :** 15 User Stories validées ✅

---
---

# ╔══════════════════════════════════════════════════╗
# ║   PARTIE 4 — BILAN & CONCLUSION                 ║
# ╚══════════════════════════════════════════════════╝

---

# ╔══════════════════════════════════════════════╗
# ║      SLIDE 45 — BILAN QUANTITATIF           ║
# ╚══════════════════════════════════════════════╝

### Ce que nous avons construit — En chiffres

```
  ┌───────────────────────────────────────────────────────────────┐
  │    61  User Stories livrées        16  Épics couverts        │
  │   349  Fichiers Java compilés     232  Fichiers de tests      │
  │    30  Mappers MapStruct           80+ Endpoints REST         │
  │     5  Rôles RBAC                   4  Sprints × 3 semaines  │
  │     2  Langues (fr + ar-ly)         1  Modèle IA local       │
  │     0  Erreur de compilation        0  Dette technique bloquante│
  └───────────────────────────────────────────────────────────────┘
```

**État des modules à la livraison :**

| Module | Statut |
|---|---|
| Authentification & Multi-tenant | ✅ Production-ready |
| Gestion RH (employés, contrats, documents) | ✅ Production-ready |
| Moteur de paie LF 2026 | ✅ Validé comptablement |
| PaieBot — Chatbot IA (RAG + SQL) | ✅ Opérationnel |
| Conformité & Déclarations (CNSS/CAVIS/IRPP) | ✅ Testé |
| Génération PDF (bulletins, attestations) | ✅ JasperReports |
| Export comptable SAGE | ✅ Testé |

---

# ╔══════════════════════════════════════════════╗
# ║        SLIDE 46 — CONCLUSION               ║
# ╚══════════════════════════════════════════════╝

### Ce que PaieZone RH apporte

> PaieZone RH est la première plateforme SaaS tunisienne à combiner
> un moteur de paie conforme LF 2026, une architecture multi-tenant
> par schéma PostgreSQL, et un assistant IA local fonctionnant
> entièrement sans cloud externe.

**Synthèse des apports :**

```
  ✅  Automatisation complète du cycle paie — fin des feuilles Excel
  ✅  Conformité légale garantie — CNSS / IRPP / CAVIS / CSS / TFP
  ✅  Sécurité multi-tenant — données 100 % isolées par entreprise
  ✅  PaieBot — support RH 24h/24 — confidentialité totale (local)
  ✅  Intégration ComptaZone — export SAGE — cycle comptable complet
  ✅  Méthodologie Scrum — 4 sprints — 61 User Stories — 0 bug bloquant
```

---

# ╔══════════════════════════════════════════════╗
# ║       SLIDE 47 — PERSPECTIVES              ║
# ╚══════════════════════════════════════════════╝

### Roadmap future

| Terme | Fonctionnalité |
|---|---|
| **Court terme** | Tableau de bord KPIs temps réel (graphiques, indicateurs RH) |
| **Court terme** | Application mobile PWA (Angular) → React Native |
| **Moyen terme** | Export déclarations CNSS/CNAM en fichier plat officiel |
| **Moyen terme** | Intégration bidirectionnelle complète avec ComptaZone |
| **Long terme** | Déploiement Kubernetes multi-région |
| **Long terme** | Modèle IA fine-tuné sur la législation tunisienne |
| **Long terme** | Marketplace de rubriques de paie personnalisées |

---

# ╔══════════════════════════════════════════════╗
# ║       SLIDE 48 — REMERCIEMENTS             ║
# ╚══════════════════════════════════════════════╝

> Nous tenons à exprimer notre sincère gratitude à toutes les personnes
> qui ont contribué à la réalisation de ce projet de fin d'études.

**À nos encadrants :**
- **Mme Amina HECHKEL** — pour son suivi rigoureux, ses conseils académiques et sa disponibilité
- **M. Salim HMIDI** — pour son accompagnement professionnel et sa confiance tout au long de ce stage
- **M. Hadj Amor Ramzi** — Product Owner — pour sa vision claire des besoins métier

**À nos familles** — pour leur soutien indéfectible tout au long de ce parcours

**À l'équipe pédagogique d'ISET Mahdia** — pour la qualité de la formation dispensée

**Au jury** — pour l'honneur qu'il nous fait d'évaluer ce travail

---

# ╔══════════════════════════════════════════════╗
# ║     SLIDE 49 — MERCI | Q & A               ║
# ╚══════════════════════════════════════════════╝

---

# PaieZone RH
## *"De la feuille Excel à la plateforme SaaS IA — la paie tunisienne réinventée."*

---

**Chayma Bouguerra** | chaymabouguerra14@gmail.com
**Takwa Boughmadi**

*ISET Mahdia — 2025-2026*

---

> *"Nous sommes à votre disposition pour toute question."*

---
---

# ════════════════════════════════════════════════
# ANNEXE — NOTES DE PRÉSENTATION
# ════════════════════════════════════════════════

## Timing suggéré (20 minutes total)

| Partie | Slides | Durée |
|---|---|---|
| Introduction & Contexte | 3 – 6 | 4 min |
| Cadre du projet | 7 – 14 | 5 min |
| Sprint 1 | 15 – 21 | 2 min |
| Sprint 2 | 22 – 28 | 2 min |
| Sprint 3 | 29 – 36 | 2 min |
| Sprint 4 | 37 – 44 | 3 min |
| Bilan & Conclusion | 45 – 48 | 2 min |
| **TOTAL** | | **20 min** |

## 10 Points clés à mémoriser

1. **Stack** : Spring Boot 4 + JHipster 9 + Angular 18 + PostgreSQL 15 + Ollama phi3
2. **Méthodologie** : Scrum — 4 sprints × 3 semaines — 61 User Stories — 16 épics
3. **Multi-tenant** : isolation `search_path` PostgreSQL + `TenantContextService` Spring
4. **Paie** : CNSS 9,18% + CAVIS 1% + CSS 0,5% + IRPP progressif LF 2026
5. **PaieBot** : Ollama/phi3 local — RAG Code du Travail TN + Text-to-SQL sécurisé
6. **Sécurité IA** : anti-hallucination + anti cross-tenant + anti injection SQL
7. **RBAC** : 5 rôles — filtre tenant automatique via JWT (companyId non falsifiable)
8. **Build** : 0 erreur — 349 fichiers Java + 232 tests compilés
9. **Postes** : ASUS TUF Gaming F15 (i7-13620H, 16 Go) + ASUS VivoBook (i5-1135G7, 16 Go)
10. **Confidentialité IA** : Ollama tourne en local — aucune donnée salariale vers cloud externe
