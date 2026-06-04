-- =============================================================
-- PAIEZONERH — Script de démonstration PFE 2026
-- Société demo : TechSoft SARL | 6 employés | 5 mois de paie
-- =============================================================
-- Prérequis : lancer l'app une fois (Liquibase crée les tables)
-- Exécution  : psql -U <user> -d <db> -f demo-pfe.sql
--              ou coller dans pgAdmin > Query Tool
--
-- Comptes demo (mot de passe = "admin" pour tous) :
--   superadmin      → ROLE_SUPER_ADMIN
--   admin.techsoft  → ROLE_ADMIN
--   fatma.mejri     → ROLE_RH_COMPTABLE
--   mondher.khalil  → ROLE_EMPLOYE (Manager)
--   ahmed.benali    → ROLE_EMPLOYE
--   karim.trabelsi  → ROLE_EMPLOYE
--   omar.belhaj     → ROLE_EMPLOYE
--   sonia.gharbi    → ROLE_EMPLOYE
-- =============================================================

-- =============================================================
-- 0. NETTOYAGE (à décommenter si tu relances le script)
-- =============================================================
-- DELETE FROM audit_log           WHERE id >= 10000;
-- DELETE FROM pay_slip_line       WHERE id >= 10000;
-- DELETE FROM accounting_entry    WHERE id >= 10000;
-- DELETE FROM hr_document         WHERE id >= 10000;
-- DELETE FROM advance             WHERE id >= 10000;
-- DELETE FROM bonus               WHERE id >= 10000;
-- DELETE FROM leave_balance       WHERE id >= 10000;
-- DELETE FROM leave_request       WHERE id >= 10000;
-- DELETE FROM leave_type          WHERE id >= 10000;
-- DELETE FROM public_holiday      WHERE id >= 10000;
-- DELETE FROM pay_slip            WHERE id >= 10000;
-- DELETE FROM payroll_period      WHERE id >= 10000;
-- DELETE FROM rubrique            WHERE id >= 10000;
-- DELETE FROM account_plan        WHERE id >= 10000;
-- DELETE FROM tax_bracket         WHERE id >= 10000;
-- DELETE FROM regulatory_param    WHERE id >= 10000;
-- DELETE FROM contract            WHERE id >= 10000;
-- DELETE FROM employee            WHERE id >= 10000;
-- DELETE FROM job_position        WHERE id >= 10000;
-- UPDATE department               SET manager_id = NULL WHERE id >= 10000;
-- DELETE FROM department          WHERE id >= 10000;
-- DELETE FROM user_profile        WHERE id >= 10000;
-- DELETE FROM pz_user_authority   WHERE user_id >= 10000;
-- DELETE FROM pz_user             WHERE id >= 10000;
-- DELETE FROM company             WHERE id >= 10000;
-- DELETE FROM company_subscription WHERE id >= 10000;

-- =============================================================
-- 1. RÔLES
-- =============================================================
INSERT INTO pz_authority (name) VALUES
  ('ROLE_SUPER_ADMIN'),
  ('ROLE_ADMIN'),
  ('ROLE_RH_COMPTABLE'),
  ('ROLE_EMPLOYE'),
  ('ROLE_USER')
ON CONFLICT (name) DO NOTHING;

-- =============================================================
-- 2. ABONNEMENT SaaS
-- =============================================================
INSERT INTO company_subscription
  (id, plan, status, max_employees, price_ht, billing_day, start_date, end_date, renewal_date, notes)
VALUES
  (10001, 'BUSINESS', 'ACTIVE', 50, 299.00, 1,
   '2026-01-01', NULL, '2027-01-01',
   'Abonnement annuel PFE démo — TechSoft SARL');

-- =============================================================
-- 3. ENTREPRISE
-- =============================================================
INSERT INTO company
  (id, name, trade_name, tax_id, cnss_id, address, city, postal_code,
   phone, email, tenant_schema, active, created_at, company_subscription_id)
VALUES
  (10000, 'TechSoft SARL', 'TechSoft',
   '1234567A/B/000', 'CNSS-12345678',
   'Avenue Habib Bourguiba, Imm. Khémaïs Bâtiment B', 'Tunis', '1001',
   '+216 71 000 001', 'contact@techsoft.tn',
   'techsoft', true, NOW(), 10001);

-- =============================================================
-- 4. UTILISATEURS (mot de passe "admin" pour tous)
-- =============================================================
INSERT INTO pz_user
  (id, login, password_hash, first_name, last_name, email, activated, lang_key, created_by, created_date)
VALUES
  (10100, 'superadmin',     '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Super',   'Admin',    'superadmin@paiezone.tn',        true, 'fr', 'system', NOW()),
  (10101, 'admin.techsoft', '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Admin',   'TechSoft', 'admin@techsoft.tn',             true, 'fr', 'system', NOW()),
  (10102, 'fatma.mejri',    '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Fatma',   'Mejri',    'fatma.mejri@techsoft.tn',       true, 'fr', 'system', NOW()),
  (10103, 'mondher.khalil', '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Mondher', 'Khalil',   'mondher.khalil@techsoft.tn',    true, 'fr', 'system', NOW()),
  (10104, 'ahmed.benali',   '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Ahmed',   'Ben Ali',  'ahmed.benali@techsoft.tn',      true, 'fr', 'system', NOW()),
  (10105, 'karim.trabelsi', '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Karim',   'Trabelsi', 'karim.trabelsi@techsoft.tn',    true, 'fr', 'system', NOW()),
  (10106, 'omar.belhaj',    '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Omar',    'Belhaj',   'omar.belhaj@techsoft.tn',       true, 'fr', 'system', NOW()),
  (10107, 'sonia.gharbi',   '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC', 'Sonia',   'Gharbi',   'sonia.gharbi@techsoft.tn',      true, 'fr', 'system', NOW());

-- =============================================================
-- 5. RÔLES UTILISATEURS
-- =============================================================
INSERT INTO pz_user_authority (user_id, authority_name) VALUES
  (10100, 'ROLE_SUPER_ADMIN'), (10100, 'ROLE_ADMIN'),       (10100, 'ROLE_USER'),
  (10101, 'ROLE_ADMIN'),       (10101, 'ROLE_USER'),
  (10102, 'ROLE_RH_COMPTABLE'),(10102, 'ROLE_EMPLOYE'),     (10102, 'ROLE_USER'),
  (10103, 'ROLE_EMPLOYE'),     (10103, 'ROLE_USER'),
  (10104, 'ROLE_EMPLOYE'),     (10104, 'ROLE_USER'),
  (10105, 'ROLE_EMPLOYE'),     (10105, 'ROLE_USER'),
  (10106, 'ROLE_EMPLOYE'),     (10106, 'ROLE_USER'),
  (10107, 'ROLE_EMPLOYE'),     (10107, 'ROLE_USER');

-- =============================================================
-- 6. PROFILS UTILISATEURS
-- =============================================================
INSERT INTO user_profile
  (id, jhi_user_id, role, phone_number, locale, two_factor_enabled, active, company_id)
VALUES
  (10200, 'superadmin',     'SUPER_ADMIN',  '+216 99 000 000', 'fr', false, true, 10000),
  (10201, 'admin.techsoft', 'ADMIN',        '+216 99 000 001', 'fr', false, true, 10000),
  (10202, 'fatma.mejri',    'RH_COMPTABLE', '+216 22 112 233', 'fr', false, true, 10000),
  (10203, 'mondher.khalil', 'MANAGER',      '+216 22 445 566', 'fr', false, true, 10000),
  (10204, 'ahmed.benali',   'EMPLOYE',      '+216 55 112 233', 'fr', false, true, 10000),
  (10205, 'karim.trabelsi', 'EMPLOYE',      '+216 55 223 344', 'fr', false, true, 10000),
  (10206, 'omar.belhaj',    'EMPLOYE',      '+216 55 334 455', 'fr', false, true, 10000),
  (10207, 'sonia.gharbi',   'EMPLOYE',      '+216 55 445 566', 'fr', false, true, 10000);

-- =============================================================
-- 7. DÉPARTEMENTS
-- =============================================================
INSERT INTO department (id, code, name, description, active, company_id, manager_id)
VALUES
  (10300, 'DEPT-IT',  'Informatique',        'Développement logiciel & infrastructure', true, 10000, NULL),
  (10301, 'DEPT-RH',  'Ressources Humaines', 'Gestion du personnel & paie',             true, 10000, NULL),
  (10302, 'DEPT-FIN', 'Finance',             'Comptabilité & contrôle de gestion',      true, 10000, NULL);

-- =============================================================
-- 8. POSTES
-- =============================================================
INSERT INTO job_position
  (id, code, title, description, min_salary, max_salary, active, company_id, department_id)
VALUES
  (10400, 'DIR-GEN',   'Directeur Général',    'Direction et stratégie de l''entreprise', 4000.00, 6000.00, true, 10000, 10300),
  (10401, 'DEV-SR',    'Développeur Senior',   'Développement logiciel avancé (5+ ans)',  3000.00, 4500.00, true, 10000, 10300),
  (10402, 'DEV-JR',    'Développeur Junior',   'Développement logiciel (< 3 ans)',         1500.00, 2500.00, true, 10000, 10300),
  (10403, 'RH-MGR',    'Responsable RH',       'Gestion des ressources humaines',          2500.00, 3500.00, true, 10000, 10301),
  (10404, 'COMPT-SR',  'Comptable',            'Gestion comptable & déclarations fiscales',2000.00, 3000.00, true, 10000, 10302),
  (10405, 'CHEF-PROJ', 'Chef de Projet',       'Pilotage de projets informatiques',        3000.00, 4000.00, true, 10000, 10300);

-- =============================================================
-- 9. EMPLOYÉS
-- =============================================================
-- Montants LF-2026 pré-calculés :
--   Mondher  4500 TND → net 3030.79
--   Ahmed    3500 TND → net 2368.28
--   Karim    1800 TND → net 1434.02
--   Fatma    2800 TND → net 1923.45
--   Omar     2200 TND → net 1619.68
--   Sonia    3200 TND → net 2202.00
INSERT INTO employee (
  id, matricule, first_name, last_name, first_name_ar, last_name_ar,
  birth_date, birth_place, gender, marital_status, number_of_children,
  chef_de_famille, national_id, nationality, address, city,
  personal_email, professional_email, phone_number, cnss_number, category,
  hire_date, active, created_at,
  company_id, department_id, position_id, manager_id, user_profile_id,
  bank_rib, salary_brut, salary_net, balance_conge, job_title
) VALUES
  (10500, 'EMP-001', 'Mondher', 'Khalil',   'منذر',    'خليل',
   '1980-03-15', 'Tunis',   'MALE',   'MARRIED', 1, true,
   '10380030', 'Tunisienne', '12 Rue de la Liberté',    'Tunis',
   'mondher.khalil@gmail.com',   'mondher.khalil@techsoft.tn', '+216 22 445 566', 'CNSS-001-0001', 'DIRECTOR',
   '2018-01-15', true, NOW(),
   10000, 10300, 10400, NULL,  10203,
   'TN5900400150120111111500014', 4500.000, 3030.790, 26, 'Directeur Général'),

  (10501, 'EMP-002', 'Ahmed',   'Ben Ali',  'أحمد',    'بن علي',
   '1988-07-22', 'Sfax',    'MALE',   'MARRIED', 2, true,
   '10432045', 'Tunisienne', '5 Impasse des Jasmins',   'Sfax',
   'ahmed.benali@gmail.com',     'ahmed.benali@techsoft.tn',   '+216 55 112 233', 'CNSS-002-0002', 'EMPLOYEE',
   '2020-03-01', true, NOW(),
   10000, 10300, 10401, 10500, 10204,
   'TN5900400150120222222500028', 3500.000, 2368.280, 18, 'Développeur Senior'),

  (10502, 'EMP-003', 'Karim',   'Trabelsi', 'كريم',    'الترابلسي',
   '1996-11-05', 'Sousse',  'MALE',   'SINGLE',  0, false,
   '10567821', 'Tunisienne', '8 Avenue de la Paix',     'Sousse',
   'karim.trabelsi@gmail.com',   'karim.trabelsi@techsoft.tn', '+216 55 223 344', 'CNSS-003-0003', 'EMPLOYEE',
   '2024-09-15', true, NOW(),
   10000, 10300, 10402, 10500, 10205,
   'TN5900400150120333333500031', 1800.000, 1434.020, 10, 'Développeur Junior'),

  (10503, 'EMP-004', 'Fatma',   'Mejri',    'فاطمة',   'مجري',
   '1991-04-18', 'Tunis',   'FEMALE', 'SINGLE',  0, false,
   '10445621', 'Tunisienne', '22 Rue Ibn Khaldoun',     'Tunis',
   'fatma.mejri@gmail.com',      'fatma.mejri@techsoft.tn',    '+216 22 112 233', 'CNSS-004-0004', 'SUPERVISOR',
   '2019-06-01', true, NOW(),
   10000, 10301, 10403, 10500, 10202,
   'TN5900400150120444444500044', 2800.000, 1923.450, 22, 'Responsable RH'),

  (10504, 'EMP-005', 'Omar',    'Belhaj',   'عمر',     'بلحاج',
   '1985-09-30', 'Bizerte', 'MALE',   'MARRIED', 1, true,
   '10512478', 'Tunisienne', '3 Rue de l''Olivier',     'Bizerte',
   'omar.belhaj@gmail.com',      'omar.belhaj@techsoft.tn',    '+216 55 334 455', 'CNSS-005-0005', 'TECHNICIAN',
   '2021-02-10', true, NOW(),
   10000, 10302, 10404, 10500, 10206,
   'TN5900400150120555555500057', 2200.000, 1619.680, 18, 'Comptable'),

  (10505, 'EMP-006', 'Sonia',   'Gharbi',   'سونيا',   'الغربي',
   '1987-01-25', 'Nabeul',  'FEMALE', 'MARRIED', 2, true,
   '10498763', 'Tunisienne', '15 Rue des Roses',        'Nabeul',
   'sonia.gharbi@gmail.com',     'sonia.gharbi@techsoft.tn',   '+216 55 445 566', 'CNSS-006-0006', 'MANAGER',
   '2019-11-20', true, NOW(),
   10000, 10300, 10405, 10500, 10207,
   'TN5900400150120666666500060', 3200.000, 2202.000, 20, 'Chef de Projet');

-- Manager de chaque département
UPDATE department SET manager_id = 10500 WHERE id = 10300;
UPDATE department SET manager_id = 10503 WHERE id = 10301;
UPDATE department SET manager_id = 10504 WHERE id = 10302;

-- =============================================================
-- 10. CONTRATS
-- =============================================================
INSERT INTO contract
  (id, reference, contract_type, status, start_date, end_date, signed_date,
   base_salary, working_hours_week, working_days_week, convention_collective,
   trial_period_months, renewal_count, created_at, employee_id)
VALUES
  (10600, 'CTR-2018-001', 'CDI', 'ACTIVE', '2018-01-15', NULL,         '2018-01-10', 4500.00, 40, 5, 'UTICA', 6, 0, NOW(), 10500),
  (10601, 'CTR-2020-002', 'CDI', 'ACTIVE', '2020-03-01', NULL,         '2020-02-25', 3500.00, 40, 5, 'UTICA', 6, 0, NOW(), 10501),
  (10602, 'CTR-2024-003', 'CDD', 'ACTIVE', '2024-09-15', '2026-09-14', '2024-09-10', 1800.00, 40, 5, 'UTICA', 3, 0, NOW(), 10502),
  (10603, 'CTR-2019-004', 'CDI', 'ACTIVE', '2019-06-01', NULL,         '2019-05-28', 2800.00, 40, 5, 'UTICA', 6, 0, NOW(), 10503),
  (10604, 'CTR-2021-005', 'CDI', 'ACTIVE', '2021-02-10', NULL,         '2021-02-05', 2200.00, 40, 5, 'UTICA', 6, 0, NOW(), 10504),
  (10605, 'CTR-2019-006', 'CDI', 'ACTIVE', '2019-11-20', NULL,         '2019-11-15', 3200.00, 40, 5, 'UTICA', 6, 0, NOW(), 10505);

-- =============================================================
-- 11. PÉRIODES DE PAIE (Janvier → Mai 2026)
-- =============================================================
INSERT INTO payroll_period
  (id, month, year, status, calculated_at, validated_at, locked_at, company_id)
VALUES
  (10700, 1, 2026, 'LOCKED',     '2026-01-31 12:00:00+01', '2026-01-31 14:00:00+01', '2026-01-31 16:00:00+01', 10000),
  (10701, 2, 2026, 'LOCKED',     '2026-02-28 12:00:00+01', '2026-02-28 14:00:00+01', '2026-02-28 16:00:00+01', 10000),
  (10702, 3, 2026, 'LOCKED',     '2026-03-31 12:00:00+02', '2026-03-31 14:00:00+02', '2026-03-31 16:00:00+02', 10000),
  (10703, 4, 2026, 'VALIDATED',  '2026-04-30 12:00:00+02', '2026-04-30 14:00:00+02', NULL,                      10000),
  (10704, 5, 2026, 'CALCULATED', '2026-05-31 12:00:00+02', NULL,                      NULL,                      10000);

-- =============================================================
-- 12. BULLETINS DE PAIE (30 bulletins : 6 employés × 5 mois)
-- =============================================================
-- Calcul LF-2026 appliqué (taux constants sur les 5 mois) :
--   CNSS salarié  : 9.18%   | CAVIS salarié  : 1%
--   CNSS patronal : 16.57%  | CAVIS patronal : 1%
--
-- Employé  | Brut    | CNSS_s | CAVIS_s | IRPP   | CSS   | Net sal  | CNSS_p | CAVIS_p | Coût total
-- Mondher  | 4500.00 | 413.10 |  45.00  | 980.50 | 30.61 | 3030.79 | 745.65 |  45.00  | 5290.65
-- Ahmed    | 3500.00 | 321.30 |  35.00  | 751.50 | 23.92 | 2368.28 | 579.95 |  35.00  | 4114.95
-- Karim    | 1800.00 | 165.24 |  18.00  | 168.25 | 14.49 | 1434.02 | 298.26 |  18.00  | 2116.26
-- Fatma    | 2800.00 | 257.04 |  28.00  | 572.08 | 19.43 | 1923.45 | 463.96 |  28.00  | 3291.96
-- Omar     | 2200.00 | 201.96 |  22.00  | 340.00 | 16.36 | 1619.68 | 364.54 |  22.00  | 2586.54
-- Sonia    | 3200.00 | 293.76 |  32.00  | 650.00 | 22.24 | 2202.00 | 530.24 |  32.00  | 3762.24

-- total_deductions par employé :
--   Mondher : 413.10+45.00+980.50+30.61 = 1469.21
--   Ahmed   : 321.30+35.00+751.50+23.92 = 1131.72
--   Karim   : 165.24+18.00+168.25+14.49 =  365.98
--   Fatma   : 257.04+28.00+572.08+19.43 =  876.55
--   Omar    : 201.96+22.00+340.00+16.36 =  580.32
--   Sonia   : 293.76+32.00+650.00+22.24 =  998.00

INSERT INTO pay_slip (
  id, month, year,
  base_salary, total_gains, total_deductions, gross_salary,
  cnss_salary_amount, cavis_amount, taxable_income, irpp_amount, net_salary,
  employer_cnss, employer_cavis, total_employer_cost,
  worked_days, paid_leave_days, unpaid_days, overtime_hours,
  status, generated_at,
  employee_id, payroll_period_id, contract_id
) VALUES
-- ── JANVIER 2026 (période 10700, statut LOCKED) ──────────────
(10800, 1,2026, 4500.00,4500.00,1469.21,4500.00, 413.10,45.00,4086.90, 980.50,3030.79, 745.65,45.00,5290.65, 26,0,0,0, 'LOCKED','2026-01-31 16:00:00+01', 10500,10700,10600),
(10801, 1,2026, 3500.00,3500.00,1131.72,3500.00, 321.30,35.00,3178.70, 751.50,2368.28, 579.95,35.00,4114.95, 26,0,0,0, 'LOCKED','2026-01-31 16:00:00+01', 10501,10700,10601),
(10802, 1,2026, 1800.00,1800.00, 365.98,1800.00, 165.24,18.00,1634.76, 168.25,1434.02, 298.26,18.00,2116.26, 26,0,0,0, 'LOCKED','2026-01-31 16:00:00+01', 10502,10700,10602),
(10803, 1,2026, 2800.00,2800.00, 876.55,2800.00, 257.04,28.00,2542.96, 572.08,1923.45, 463.96,28.00,3291.96, 26,0,0,0, 'LOCKED','2026-01-31 16:00:00+01', 10503,10700,10603),
(10804, 1,2026, 2200.00,2200.00, 580.32,2200.00, 201.96,22.00,1998.04, 340.00,1619.68, 364.54,22.00,2586.54, 26,0,0,0, 'LOCKED','2026-01-31 16:00:00+01', 10504,10700,10604),
(10805, 1,2026, 3200.00,3200.00, 998.00,3200.00, 293.76,32.00,2906.24, 650.00,2202.00, 530.24,32.00,3762.24, 26,0,0,0, 'LOCKED','2026-01-31 16:00:00+01', 10505,10700,10605),
-- ── FÉVRIER 2026 (période 10701, statut LOCKED) ───────────────
(10806, 2,2026, 4500.00,4500.00,1469.21,4500.00, 413.10,45.00,4086.90, 980.50,3030.79, 745.65,45.00,5290.65, 24,0,0,0, 'LOCKED','2026-02-28 16:00:00+01', 10500,10701,10600),
(10807, 2,2026, 3500.00,3500.00,1131.72,3500.00, 321.30,35.00,3178.70, 751.50,2368.28, 579.95,35.00,4114.95, 24,0,0,0, 'LOCKED','2026-02-28 16:00:00+01', 10501,10701,10601),
(10808, 2,2026, 1800.00,1800.00, 365.98,1800.00, 165.24,18.00,1634.76, 168.25,1434.02, 298.26,18.00,2116.26, 24,0,0,0, 'LOCKED','2026-02-28 16:00:00+01', 10502,10701,10602),
(10809, 2,2026, 2800.00,2800.00, 876.55,2800.00, 257.04,28.00,2542.96, 572.08,1923.45, 463.96,28.00,3291.96, 24,0,0,0, 'LOCKED','2026-02-28 16:00:00+01', 10503,10701,10603),
(10810, 2,2026, 2200.00,2200.00, 580.32,2200.00, 201.96,22.00,1998.04, 340.00,1619.68, 364.54,22.00,2586.54, 24,0,0,0, 'LOCKED','2026-02-28 16:00:00+01', 10504,10701,10604),
(10811, 2,2026, 3200.00,3200.00, 998.00,3200.00, 293.76,32.00,2906.24, 650.00,2202.00, 530.24,32.00,3762.24, 24,0,0,0, 'LOCKED','2026-02-28 16:00:00+01', 10505,10701,10605),
-- ── MARS 2026 (période 10702, statut LOCKED) ──────────────────
(10812, 3,2026, 4500.00,4500.00,1469.21,4500.00, 413.10,45.00,4086.90, 980.50,3030.79, 745.65,45.00,5290.65, 26,0,0,0, 'LOCKED','2026-03-31 16:00:00+02', 10500,10702,10600),
(10813, 3,2026, 3500.00,3500.00,1131.72,3500.00, 321.30,35.00,3178.70, 751.50,2368.28, 579.95,35.00,4114.95, 26,0,0,0, 'LOCKED','2026-03-31 16:00:00+02', 10501,10702,10601),
(10814, 3,2026, 1800.00,1800.00, 365.98,1800.00, 165.24,18.00,1634.76, 168.25,1434.02, 298.26,18.00,2116.26, 26,0,0,0, 'LOCKED','2026-03-31 16:00:00+02', 10502,10702,10602),
(10815, 3,2026, 2800.00,2800.00, 876.55,2800.00, 257.04,28.00,2542.96, 572.08,1923.45, 463.96,28.00,3291.96, 26,0,0,0, 'LOCKED','2026-03-31 16:00:00+02', 10503,10702,10603),
(10816, 3,2026, 2200.00,2200.00, 580.32,2200.00, 201.96,22.00,1998.04, 340.00,1619.68, 364.54,22.00,2586.54, 26,0,0,0, 'LOCKED','2026-03-31 16:00:00+02', 10504,10702,10604),
(10817, 3,2026, 3200.00,3200.00, 998.00,3200.00, 293.76,32.00,2906.24, 650.00,2202.00, 530.24,32.00,3762.24, 26,0,0,0, 'LOCKED','2026-03-31 16:00:00+02', 10505,10702,10605),
-- ── AVRIL 2026 (période 10703, statut VALIDATED) ──────────────
-- Ahmed a pris 5 jours de congé approuvé (7-11 avril), worked_days = 21, paid_leave_days = 5
(10818, 4,2026, 4500.00,4500.00,1469.21,4500.00, 413.10,45.00,4086.90, 980.50,3030.79, 745.65,45.00,5290.65, 23,0,0,0, 'VALIDATED','2026-04-30 14:00:00+02', 10500,10703,10600),
(10819, 4,2026, 3500.00,3500.00,1131.72,3500.00, 321.30,35.00,3178.70, 751.50,2368.28, 579.95,35.00,4114.95, 21,5,0,0, 'VALIDATED','2026-04-30 14:00:00+02', 10501,10703,10601),
(10820, 4,2026, 1800.00,1800.00, 365.98,1800.00, 165.24,18.00,1634.76, 168.25,1434.02, 298.26,18.00,2116.26, 23,0,0,0, 'VALIDATED','2026-04-30 14:00:00+02', 10502,10703,10602),
(10821, 4,2026, 2800.00,2800.00, 876.55,2800.00, 257.04,28.00,2542.96, 572.08,1923.45, 463.96,28.00,3291.96, 23,0,0,0, 'VALIDATED','2026-04-30 14:00:00+02', 10503,10703,10603),
(10822, 4,2026, 2200.00,2200.00, 580.32,2200.00, 201.96,22.00,1998.04, 340.00,1619.68, 364.54,22.00,2586.54, 23,0,0,0, 'VALIDATED','2026-04-30 14:00:00+02', 10504,10703,10604),
(10823, 4,2026, 3200.00,3200.00, 998.00,3200.00, 293.76,32.00,2906.24, 650.00,2202.00, 530.24,32.00,3762.24, 21,4,0,0, 'VALIDATED','2026-04-30 14:00:00+02', 10505,10703,10605),
-- ── MAI 2026 (période 10704, statut CALCULATED) ───────────────
(10824, 5,2026, 4500.00,4500.00,1469.21,4500.00, 413.10,45.00,4086.90, 980.50,3030.79, 745.65,45.00,5290.65, 21,0,0,0, 'CALCULATED','2026-05-31 12:00:00+02', 10500,10704,10600),
(10825, 5,2026, 3500.00,3500.00,1131.72,3500.00, 321.30,35.00,3178.70, 751.50,2368.28, 579.95,35.00,4114.95, 21,0,0,0, 'CALCULATED','2026-05-31 12:00:00+02', 10501,10704,10601),
(10826, 5,2026, 1800.00,1800.00, 365.98,1800.00, 165.24,18.00,1634.76, 168.25,1434.02, 298.26,18.00,2116.26, 21,0,0,0, 'CALCULATED','2026-05-31 12:00:00+02', 10502,10704,10602),
(10827, 5,2026, 2800.00,2800.00, 876.55,2800.00, 257.04,28.00,2542.96, 572.08,1923.45, 463.96,28.00,3291.96, 21,0,0,0, 'CALCULATED','2026-05-31 12:00:00+02', 10503,10704,10603),
(10828, 5,2026, 2200.00,2200.00, 580.32,2200.00, 201.96,22.00,1998.04, 340.00,1619.68, 364.54,22.00,2586.54, 21,0,0,0, 'CALCULATED','2026-05-31 12:00:00+02', 10504,10704,10604),
(10829, 5,2026, 3200.00,3200.00, 998.00,3200.00, 293.76,32.00,2906.24, 650.00,2202.00, 530.24,32.00,3762.24, 21,0,0,0, 'CALCULATED','2026-05-31 12:00:00+02', 10505,10704,10605);

-- =============================================================
-- 13. RUBRIQUES DE PAIE
-- =============================================================
INSERT INTO rubrique
  (id, code, label, label_ar, rubrique_type, base, rate, fixed_amount,
   formula, taxable, cnss_salary, cnss_employer, sort_order, active, company_id)
VALUES
  (11000, 'D-SAL',  'Salaire de base',       'الأجر الأساسي',         'GAIN',           'FIXED',        NULL,  NULL, NULL, true,  true,  true,  1, true, 10000),
  (11001, 'D-CNS',  'CNSS salarié (9,18%)',  'اشتراكات الضمان الاجتماعي', 'DEDUCTION',  'PERCENT_BRUT', 9.18,  NULL, NULL, false, true,  false, 2, true, 10000),
  (11002, 'D-CAV',  'CAVIS salarié (1%)',    'كافيس - العامل',        'DEDUCTION',      'PERCENT_BRUT', 1.00,  NULL, NULL, false, false, false, 3, true, 10000),
  (11003, 'D-IRP',  'IRPP mensuel',          'الضريبة على الدخل',     'DEDUCTION',      'FORMULA',      NULL,  NULL, 'IRPP_LF2026', true, false, false, 4, true, 10000),
  (11004, 'D-CSS',  'CSS (1%)',              'المساهمة الاجتماعية',   'DEDUCTION',      'PERCENT_NET',  1.00,  NULL, NULL, false, false, false, 5, true, 10000),
  (11005, 'D-CNE',  'CNSS patronal (16,57%)','اشتراكات صاحب العمل',  'EMPLOYER_CHARGE','PERCENT_BRUT', 16.57, NULL, NULL, false, false, true,  6, true, 10000),
  (11006, 'D-CVE',  'CAVIS patronal (1%)',   'كافيس - صاحب العمل',   'EMPLOYER_CHARGE','PERCENT_BRUT', 1.00,  NULL, NULL, false, false, false, 7, true, 10000);

-- =============================================================
-- 14. LIGNES DU BULLETIN DE PAIE (détail Ahmed — Janvier 2026)
-- =============================================================
INSERT INTO pay_slip_line
  (id, sort_order, rubrique_code, rubrique_label, rubrique_type, base, rate, amount, taxable, pay_slip_id, rubrique_id)
VALUES
  (11100, 1, 'D-SAL', 'Salaire de base',        'GAIN',           3500.00, NULL,  3500.00, true,  10801, 11000),
  (11101, 2, 'D-CNS', 'CNSS salarié (9,18%)',   'DEDUCTION',      3500.00, 9.18,   321.30, false, 10801, 11001),
  (11102, 3, 'D-CAV', 'CAVIS salarié (1%)',      'DEDUCTION',      3500.00, 1.00,    35.00, false, 10801, 11002),
  (11103, 4, 'D-IRP', 'IRPP mensuel',            'DEDUCTION',      3178.70, NULL,   751.50, true,  10801, 11003),
  (11104, 5, 'D-CSS', 'CSS (1%)',                'DEDUCTION',      2392.20, 1.00,    23.92, false, 10801, 11004),
  (11105, 6, 'D-CNE', 'CNSS patronal (16,57%)', 'EMPLOYER_CHARGE',3500.00,16.57,   579.95, false, 10801, 11005),
  (11106, 7, 'D-CVE', 'CAVIS patronal (1%)',     'EMPLOYER_CHARGE',3500.00, 1.00,    35.00, false, 10801, 11006);

-- =============================================================
-- 15. TYPES DE CONGÉ
-- =============================================================
INSERT INTO leave_type
  (id, name, label, max_days_per_year, carry_over_days, paid, requires_medical, active, company_id)
VALUES
  (11200, 'ANNUEL',     'Congé annuel',          30, 5, true,  false, true, 10000),
  (11201, 'MALADIE',    'Congé maladie',         30, 0, true,  true,  true, 10000),
  (11202, 'MATERNITE',  'Congé maternité',       90, 0, true,  true,  true, 10000),
  (11203, 'SANS_SOLDE', 'Congé sans solde',      30, 0, false, false, true, 10000),
  (11204, 'MARIAGE',    'Congé mariage',          5, 0, true,  false, true, 10000);

-- =============================================================
-- 16. SOLDES DE CONGÉS (exercice 2026)
-- =============================================================
-- entitled=30, les valeurs reflètent les demandes approuvées
INSERT INTO leave_balance
  (id, year, entitled, taken, pending, carry_over, remaining, last_updated_at, employee_id, leave_type_id)
VALUES
  -- Mondher : solde plein (demande PENDING juin non déduite du solde)
  (11300, 2026, 30.00,  0.00, 5.00, 2.00, 27.00, NOW(), 10500, 11200),
  -- Ahmed : 5 jours pris (congé avril approuvé), 0 en attente
  (11301, 2026, 30.00,  5.00, 0.00, 1.00, 26.00, NOW(), 10501, 11200),
  -- Karim : demande PENDING juin en cours
  (11302, 2026, 30.00,  0.00, 4.00, 0.00, 26.00, NOW(), 10502, 11200),
  -- Fatma : solde plein (auto-rejet janvier sans impact solde)
  (11303, 2026, 30.00,  0.00, 0.00, 3.00, 33.00, NOW(), 10503, 11200),
  -- Omar : demande rejetée, solde intact
  (11304, 2026, 30.00,  0.00, 0.00, 0.00, 30.00, NOW(), 10504, 11200),
  -- Sonia : 4 jours pris (congé mars approuvé)
  (11305, 2026, 30.00,  4.00, 0.00, 2.00, 28.00, NOW(), 10505, 11200);

-- =============================================================
-- 17. DEMANDES DE CONGÉ
-- =============================================================
INSERT INTO leave_request
  (id, start_date, end_date, number_of_days, status, requested_at, processed_at,
   manager_comment, employee_comment, employee_id, leave_type_id, approved_by_id)
VALUES
  -- APPROVED : Ahmed (7-11 avril)
  (11400, '2026-04-07', '2026-04-11', 5, 'APPROVED',
   '2026-03-28 09:00:00+01', '2026-04-01 10:00:00+02',
   'Approuvé. Bon congé !', 'Congé familial planifié.', 10501, 11200, 10503),

  -- APPROVED : Sonia (23-26 mars)
  (11401, '2026-03-23', '2026-03-26', 4, 'APPROVED',
   '2026-03-10 10:00:00+01', '2026-03-12 09:00:00+01',
   'Approuvé.', 'Voyage de formation.', 10505, 11200, 10503),

  -- PENDING : Karim (15-19 juin)
  (11402, '2026-06-15', '2026-06-19', 4, 'PENDING',
   '2026-05-20 11:00:00+02', NULL,
   NULL, 'Vacances d''été.', 10502, 11200, NULL),

  -- PENDING : Mondher (1-5 juillet)
  (11403, '2026-07-01', '2026-07-05', 5, 'PENDING',
   '2026-05-28 08:00:00+02', NULL,
   NULL, 'Congé annuel Q3.', 10500, 11200, NULL),

  -- REJECTED par RH : Omar (20-25 avril) — période chargée
  (11404, '2026-04-20', '2026-04-25', 5, 'REJECTED',
   '2026-04-10 14:00:00+02', '2026-04-14 10:00:00+02',
   'Période de clôture trimestrielle. Merci de reporter.', 'Urgence personnelle.', 10504, 11200, 10503),

  -- AUTO-REJECTED : Fatma (date passée — soumis avec start_date dans le passé)
  (11405, '2026-01-15', '2026-01-17', 3, 'REJECTED',
   '2026-01-20 09:00:00+01', '2026-01-20 09:00:00+01',
   'Rejet automatique : la date de début (2026-01-15) est dans le passé.', NULL, 10503, 11200, NULL);

-- =============================================================
-- 18. PRIMES / BONUS
-- =============================================================
INSERT INTO bonus
  (id, bonus_type, label, amount, taxable, month, year, notes, employee_id, pay_slip_id)
VALUES
  (11500, 'PERFORMANCE',  'Prime de performance T1 2026', 800.00, true,  1, 2026, 'Objectifs Q1 dépassés de 120%', 10501, 10801),
  (11501, 'TRANSPORT',    'Indemnité transport',           150.00, false, 1, 2026, 'Forfait mensuel déplacement',   10505, 10805),
  (11502, 'END_OF_YEAR',  'Prime fin d''année 2025',      3000.00, true,  1, 2026, 'Bilan annuel positif',          10500, 10800),
  (11503, 'MEAL',         'Tickets restaurant Janvier',    120.00, false, 1, 2026, '22 tickets × 5.50 TND',        10504, 10804),
  (11504, 'SENIORITY',    'Prime d''ancienneté (7 ans)',   200.00, true,  3, 2026, 'Atteinte 7 ans d''ancienneté', 10503, 10815);

-- =============================================================
-- 19. AVANCES SUR SALAIRE
-- =============================================================
INSERT INTO advance
  (id, request_date, amount, deduction_month, deduction_year, status,
   approved_by, notes, reason, approved_at, employee_id, pay_slip_id)
VALUES
  -- Mondher : 1000 TND demandé jan, APPROUVÉ, déduit en fév
  (11600, '2026-01-10', 1000.00, 2, 2026, 'DEDUCTED',
   'Fatma Mejri', 'Avance exceptionnelle approuvée par DG',
   'Frais médicaux urgents', '2026-01-11 10:00:00+01', 10500, 10806),

  -- Ahmed : 500 TND demandé fév, APPROUVÉ (non encore déduit)
  (11601, '2026-02-15',  500.00, 5, 2026, 'APPROVED',
   'Fatma Mejri', 'Avance standard',
   'Achat équipement informatique personnel', '2026-02-16 09:00:00+01', 10501, NULL),

  -- Karim : 300 TND demandé mars, APPROUVÉ, déduit en avril
  (11602, '2026-03-05',  300.00, 4, 2026, 'DEDUCTED',
   'Fatma Mejri', 'Accord RH',
   'Frais de déménagement', '2026-03-06 14:00:00+01', 10502, 10820),

  -- Omar : 400 TND demandé avril, EN ATTENTE
  (11603, '2026-04-22',  400.00, NULL, NULL, 'REQUESTED',
   NULL, NULL,
   'Réparation véhicule', NULL, 10504, NULL),

  -- Sonia : 250 TND demandé mars, REJETÉ
  (11604, '2026-03-20',  250.00, NULL, NULL, 'REJECTED',
   'Fatma Mejri', 'Solde d''avances non soldé',
   'Dépense personnelle', '2026-03-21 11:00:00+01', 10505, NULL);

-- =============================================================
-- 20. PLAN COMPTABLE
-- =============================================================
INSERT INTO account_plan
  (id, account_code, account_label, account_label_ar, account_type, active, company_id)
VALUES
  (11700, '6411', 'Salaires du personnel',            'أجور الموظفين',           'EXPENSE',    true, 10000),
  (11701, '6413', 'Primes et gratifications',          'علاوات ومكافآت',          'EXPENSE',    true, 10000),
  (11702, '6441', 'Charges patronales CNSS',           'أعباء صاحب العمل',        'EXPENSE',    true, 10000),
  (11703, '6443', 'CAVIS patronal',                    'CAVIS صاحب العمل',        'EXPENSE',    true, 10000),
  (11704, '4311', 'Personnel — rémunérations dues',    'مستحقات الموظفين',        'LIABILITY',  true, 10000),
  (11705, '4321', 'Personnel — avances',               'سلف الموظفين',            'LIABILITY',  true, 10000),
  (11706, '4371', 'CNSS à payer',                      'CNSS مستحق',              'LIABILITY',  true, 10000),
  (11707, '4372', 'CAVIS à payer',                     'CAVIS مستحق',             'LIABILITY',  true, 10000),
  (11708, '4441', 'IRPP à payer',                      'ضريبة الدخل مستحقة',      'LIABILITY',  true, 10000),
  (11709, '4442', 'CSS à payer',                       'مساهمة اجتماعية مستحقة', 'LIABILITY',  true, 10000),
  (11710, '5121', 'Banque STB — compte courant',       'البنك - الحساب الجاري',  'ASSET',      true, 10000);

-- =============================================================
-- 21. ÉCRITURES COMPTABLES (Janvier & Février 2026)
-- =============================================================
INSERT INTO accounting_entry
  (id, entry_date, journal_ref, entry_type, description,
   debit_account, credit_account, amount, company_id, payroll_period_id)
VALUES
  -- Charges salariales Janvier 2026
  (11800, '2026-01-31', 'PAY-2026-01-001', 'SALARY_EXPENSE',
   'Charges salariales brutes — Janvier 2026',
   '6411', '4311', 18000.00, 10000, 10700),

  -- CNSS patronal Janvier 2026
  (11801, '2026-01-31', 'PAY-2026-01-002', 'CNSS_EXPENSE',
   'CNSS patronal — Janvier 2026 (16,57%)',
   '6441', '4371', 2982.60, 10000, 10700),

  -- CAVIS patronal Janvier 2026
  (11802, '2026-01-31', 'PAY-2026-01-003', 'CNSS_EXPENSE',
   'CAVIS patronal — Janvier 2026 (1%)',
   '6443', '4372', 180.00, 10000, 10700),

  -- Virement salaires nets Janvier 2026
  (11803, '2026-01-31', 'PAY-2026-01-004', 'BANK_TRANSFER',
   'Virement salaires nets — Janvier 2026',
   '4311', '5121', 14210.74, 10000, 10700),

  -- Charges salariales Février 2026
  (11804, '2026-02-28', 'PAY-2026-02-001', 'SALARY_EXPENSE',
   'Charges salariales brutes — Février 2026',
   '6411', '4311', 18000.00, 10000, 10701),

  -- CNSS patronal Février 2026
  (11805, '2026-02-28', 'PAY-2026-02-002', 'CNSS_EXPENSE',
   'CNSS patronal — Février 2026 (16,57%)',
   '6441', '4371', 2982.60, 10000, 10701),

  -- IRPP à payer (déclaration mensuelle)
  (11806, '2026-01-31', 'FISC-2026-01-001', 'TAX_PAYABLE',
   'IRPP retenu à la source — Janvier 2026',
   '4311', '4441', 3262.83, 10000, 10700);

-- =============================================================
-- 22. DOCUMENTS RH
-- =============================================================
INSERT INTO hr_document
  (id, document_type, title, description, file_url, file_size, mime_type,
   uploaded_at, expiry_date, active, employee_id)
VALUES
  (11900, 'CONTRACT',     'Contrat CDI — Mondher Khalil',   'Contrat signé DG',       '/docs/demo/ctr-mondher.pdf',   245000, 'application/pdf', '2018-01-15 10:00:00+01', NULL,         true, 10500),
  (11901, 'CONTRACT',     'Contrat CDI — Ahmed Ben Ali',    'Contrat Dev Senior',     '/docs/demo/ctr-ahmed.pdf',     215000, 'application/pdf', '2020-03-01 09:00:00+01', NULL,         true, 10501),
  (11902, 'CONTRACT',     'Contrat CDD — Karim Trabelsi',   'CDD 2 ans renouvelable', '/docs/demo/ctr-karim.pdf',     198000, 'application/pdf', '2024-09-15 09:00:00+01', '2026-09-14', true, 10502),
  (11903, 'CIN_COPY',     'CIN — Ahmed Ben Ali',            'Copie CIN recto/verso',  '/docs/demo/cin-ahmed.pdf',     89000,  'application/pdf', '2020-03-01 09:00:00+01', '2028-07-22', true, 10501),
  (11904, 'DIPLOMA',      'Diplôme Master — Ahmed Ben Ali', 'Master Informatique FST','/docs/demo/diplome-ahmed.pdf', 320000, 'application/pdf', '2020-03-01 09:30:00+01', NULL,         true, 10501),
  (11905, 'ATTESTATION',  'Attestation travail — Fatma',    'Pour démarches CNSS',    '/docs/demo/attest-fatma.pdf',  125000, 'application/pdf', '2026-03-10 14:00:00+01', NULL,         true, 10503);

-- =============================================================
-- 23. JOURS FÉRIÉS TUNISIE 2026
-- =============================================================
INSERT INTO public_holiday
  (id, name, name_ar, holiday_date, year, is_recurring, active)
VALUES
  (12000, 'Jour de l''An',              'رأس السنة الميلادية',        '2026-01-01', 2026, true,  true),
  (12001, 'Fête de l''Indépendance',    'عيد الاستقلال',             '2026-03-20', 2026, true,  true),
  (12002, 'Fête du Martyr',             'يوم الشهيد',                '2026-04-09', 2026, true,  true),
  (12003, 'Fête du Travail',            'عيد العمال',                '2026-05-01', 2026, true,  true),
  (12004, 'Aïd el-Fitr (J1)',           'عيد الفطر المبارك يوم 1',   '2026-03-30', 2026, false, true),
  (12005, 'Aïd el-Fitr (J2)',           'عيد الفطر المبارك يوم 2',   '2026-03-31', 2026, false, true),
  (12006, 'Aïd el-Fitr (J3)',           'عيد الفطر المبارك يوم 3',   '2026-04-01', 2026, false, true);

-- =============================================================
-- 24. JOURNAL D'AUDIT
-- =============================================================
INSERT INTO audit_log
  (id, action, entity_type, entity_id, old_value, new_value,
   ip_address, occurred_at, user_id, company_id)
VALUES
  (12100, 'LOGIN',           'User',          10103, NULL,                          NULL,                        '192.168.1.50', '2026-05-31 08:05:00+02', 10103, 10000),
  (12101, 'LEAVE_APPROVED',  'LeaveRequest',  11400, '{"status":"PENDING"}',        '{"status":"APPROVED"}',     '192.168.1.40', '2026-04-01 10:00:00+02', 10102, 10000),
  (12102, 'LEAVE_REJECTED',  'LeaveRequest',  11404, '{"status":"PENDING"}',        '{"status":"REJECTED"}',     '192.168.1.40', '2026-04-14 10:00:00+02', 10102, 10000),
  (12103, 'PAYROLL_LOCKED',  'PayrollPeriod', 10700, '{"status":"VALIDATED"}',      '{"status":"LOCKED"}',       '192.168.1.40', '2026-01-31 16:00:00+01', 10102, 10000),
  (12104, 'ADVANCE_APPROVED','Advance',       11601, '{"status":"REQUESTED"}',      '{"status":"APPROVED"}',     '192.168.1.40', '2026-02-16 09:00:00+01', 10102, 10000),
  (12105, 'CONTRACT_CREATED','Contract',      10602, NULL,                          '{"type":"CDD","emp":10502}', '192.168.1.40', '2024-09-15 09:00:00+01', 10102, 10000),
  (12106, 'LOGIN',           'User',          10102, NULL,                          NULL,                        '192.168.1.40', '2026-05-31 07:58:00+02', 10102, 10000),
  (12107, 'PAYROLL_CALCULATED','PayrollPeriod',10704,'{"status":"DRAFT"}',          '{"status":"CALCULATED"}',   '192.168.1.40', '2026-05-31 12:00:00+02', 10102, 10000);

-- =============================================================
-- 25. PARAMÈTRES RÉGLEMENTAIRES (CNSS / IRPP)
-- =============================================================
-- Colonnes réelles : id, param_key, param_label, numeric_value, text_value,
--                    effective_from, effective_to, legal_reference, active
INSERT INTO regulatory_param
  (id, param_key, param_label, numeric_value, text_value, effective_from, legal_reference, active)
VALUES
  (12200, 'CNSS_RATE_EMPLOYEE',  'Taux CNSS salarié LF-2026',        9.18,  NULL, '2026-01-01', 'LF-2026 Art. 25',  true),
  (12201, 'CNSS_RATE_EMPLOYER',  'Taux CNSS patronal LF-2026',      16.57,  NULL, '2026-01-01', 'LF-2026 Art. 25',  true),
  (12202, 'CAVIS_RATE_EMPLOYEE', 'Taux CAVIS salarié',                1.00,  NULL, '2026-01-01', 'LF-2026',          true),
  (12203, 'CAVIS_RATE_EMPLOYER', 'Taux CAVIS patronal',               1.00,  NULL, '2026-01-01', 'LF-2026',          true),
  (12204, 'CSS_RATE',            'Taux CSS (Contribution Sociale)',   1.00,  NULL, '2026-01-01', 'LF-2026 Art. 70',  true),
  (12205, 'CNSS_PLAFOND_MONTH',  'Plafond mensuel assiette CNSS',  666.67,  NULL, '2026-01-01', 'LF-2026',          true);

-- =============================================================
-- 26. TRANCHES IRPP LF-2026
-- =============================================================
-- Colonnes réelles : id, year, min_income, max_income, rate, fixed_deduction, sort_order, company_id
-- fixed_deduction : permet calcul IRPP = revenu × taux - fixed_deduction
INSERT INTO tax_bracket
  (id, year, min_income, max_income, rate, fixed_deduction, sort_order, company_id)
VALUES
  (12300, 2026,     0.00,  5000.00,  0.00,     0.00, 1, NULL),
  (12301, 2026,  5000.01, 20000.00, 26.00,  1300.00, 2, NULL),
  (12302, 2026, 20000.01, 30000.00, 28.00,  1700.00, 3, NULL),
  (12303, 2026, 30000.01, 50000.00, 32.00,  2900.00, 4, NULL),
  (12304, 2026, 50000.01,      NULL, 35.00, 4400.00, 5, NULL);

-- =============================================================
-- 27. MISE À JOUR DE LA SÉQUENCE
-- =============================================================
SELECT setval('sequence_generator', 13000, true);

-- =============================================================
-- RÉSUMÉ DES DONNÉES INSÉRÉES
-- =============================================================
-- ✅ 1 entreprise  : TechSoft SARL (Tunis)
-- ✅ 8 utilisateurs : superadmin, admin.techsoft, 6 employés
-- ✅ 4 rôles       : SUPER_ADMIN, ADMIN, RH_COMPTABLE, EMPLOYE
-- ✅ 3 départements : IT, RH, Finance
-- ✅ 6 postes      : DG, Dev SR, Dev JR, RH Mgr, Comptable, Chef Projet
-- ✅ 6 employés    : Mondher, Ahmed, Karim, Fatma, Omar, Sonia
-- ✅ 6 contrats    : CDI×5, CDD×1
-- ✅ 5 périodes    : Jan-Mar LOCKED | Avr VALIDATED | Mai CALCULATED
-- ✅ 30 bulletins  : 6 emp × 5 mois (LF-2026)
-- ✅ 7 lignes bul. : détail Ahmed Janvier 2026
-- ✅ 7 rubriques   : SAL, CNSS_s, CAVIS_s, IRPP, CSS, CNSS_p, CAVIS_p
-- ✅ 5 types congé : Annuel, Maladie, Maternité, Sans solde, Mariage
-- ✅ 6 soldes      : 2026 par employé
-- ✅ 6 demandes    : 2 APPROVED, 2 PENDING, 1 REJECTED RH, 1 AUTO-REJECTED
-- ✅ 5 primes      : Performance, Transport, Fin d'année, Resto, Ancienneté
-- ✅ 5 avances     : DEDUCTED×2, APPROVED×1, REQUESTED×1, REJECTED×1
-- ✅ 11 comptes    : 641x charges, 431x personnel, 441x impôts, 512x banque
-- ✅ 7 écritures   : Jan et Fév (salaires, CNSS, virements, IRPP)
-- ✅ 6 documents   : Contrats, CIN, Diplôme, Attestation
-- ✅ 7 fériés      : Tunisie 2026 (Jan, Mar, Avr, Mai)
-- ✅ 8 audit logs  : Logins, validations, approbations
-- ✅ 6 params régl.: Taux CNSS/CAVIS/CSS
-- ✅ 5 tranches    : IRPP LF-2026 (0/26/28/32/35%)
-- =============================================================
