-- ════════════════════════════════════════════════════════════════
--  Jours fériés tunisiens officiels 2024-2028
--  Base : PostgreSQL · Table : public_holiday
--  Exécution : psql -U <user> -d paieZoneRH -f insert_public_holidays.sql
-- ════════════════════════════════════════════════════════════════

-- Purge des années concernées pour idempotence
DELETE FROM public_holiday WHERE year BETWEEN 2024 AND 2028;

-- ════════════════════════════════════════════════════════════════
--  2024
-- ════════════════════════════════════════════════════════════════

-- Dates fixes
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Jour de l''An',                'رأس السنة الميلادية',       '2024-01-01', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Indépendance',     'عيد الاستقلال',             '2024-03-20', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Martyr',              'يوم الشهيد',                '2024-04-09', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Travail',             'عيد العمال',                '2024-05-01', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la République',       'عيد الجمهورية',             '2024-07-25', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la Femme',            'عيد المرأة',                '2024-08-13', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Évacuation',       'عيد الجلاء',                '2024-10-15', 2024, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Journée de la Commémoration', 'ذكرى التحول',               '2024-11-07', 2024, true,  true);

-- Dates variables (hégirien)
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J1)',            'عيد الفطر المبارك - يوم 1', '2024-04-10', 2024, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J2)',            'عيد الفطر المبارك - يوم 2', '2024-04-11', 2024, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J3)',            'عيد الفطر المبارك - يوم 3', '2024-04-12', 2024, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J1)',            'عيد الأضحى المبارك - يوم 1','2024-06-17', 2024, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J2)',            'عيد الأضحى المبارك - يوم 2','2024-06-18', 2024, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Nouvel An Hégirien',          'رأس السنة الهجرية',         '2024-07-07', 2024, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Mawlid (Aïd el-Mawlid)',      'المولد النبوي الشريف',      '2024-09-16', 2024, false, true);

-- ════════════════════════════════════════════════════════════════
--  2025
-- ════════════════════════════════════════════════════════════════

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Jour de l''An',                'رأس السنة الميلادية',       '2025-01-01', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Indépendance',     'عيد الاستقلال',             '2025-03-20', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Martyr',              'يوم الشهيد',                '2025-04-09', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Travail',             'عيد العمال',                '2025-05-01', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la République',       'عيد الجمهورية',             '2025-07-25', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la Femme',            'عيد المرأة',                '2025-08-13', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Évacuation',       'عيد الجلاء',                '2025-10-15', 2025, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Journée de la Commémoration', 'ذكرى التحول',               '2025-11-07', 2025, true,  true);

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J1)',            'عيد الفطر المبارك - يوم 1', '2025-03-30', 2025, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J2)',            'عيد الفطر المبارك - يوم 2', '2025-03-31', 2025, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J3)',            'عيد الفطر المبارك - يوم 3', '2025-04-01', 2025, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J1)',            'عيد الأضحى المبارك - يوم 1','2025-06-06', 2025, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J2)',            'عيد الأضحى المبارك - يوم 2','2025-06-07', 2025, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Nouvel An Hégirien',          'رأس السنة الهجرية',         '2025-06-26', 2025, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Mawlid (Aïd el-Mawlid)',      'المولد النبوي الشريف',      '2025-09-04', 2025, false, true);

-- ════════════════════════════════════════════════════════════════
--  2026
-- ════════════════════════════════════════════════════════════════

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Jour de l''An',                'رأس السنة الميلادية',       '2026-01-01', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Indépendance',     'عيد الاستقلال',             '2026-03-20', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Martyr',              'يوم الشهيد',                '2026-04-09', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Travail',             'عيد العمال',                '2026-05-01', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la République',       'عيد الجمهورية',             '2026-07-25', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la Femme',            'عيد المرأة',                '2026-08-13', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Évacuation',       'عيد الجلاء',                '2026-10-15', 2026, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Journée de la Commémoration', 'ذكرى التحول',               '2026-11-07', 2026, true,  true);

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J1)',            'عيد الفطر المبارك - يوم 1', '2026-03-21', 2026, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J2)',            'عيد الفطر المبارك - يوم 2', '2026-03-22', 2026, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J3)',            'عيد الفطر المبارك - يوم 3', '2026-03-23', 2026, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J1)',            'عيد الأضحى المبارك - يوم 1','2026-05-27', 2026, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J2)',            'عيد الأضحى المبارك - يوم 2','2026-05-28', 2026, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Nouvel An Hégirien',          'رأس السنة الهجرية',         '2026-06-16', 2026, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Mawlid (Aïd el-Mawlid)',      'المولد النبوي الشريف',      '2026-08-25', 2026, false, true);

-- ════════════════════════════════════════════════════════════════
--  2027
-- ════════════════════════════════════════════════════════════════

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Jour de l''An',                'رأس السنة الميلادية',       '2027-01-01', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Indépendance',     'عيد الاستقلال',             '2027-03-20', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Martyr',              'يوم الشهيد',                '2027-04-09', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Travail',             'عيد العمال',                '2027-05-01', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la République',       'عيد الجمهورية',             '2027-07-25', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la Femme',            'عيد المرأة',                '2027-08-13', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Évacuation',       'عيد الجلاء',                '2027-10-15', 2027, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Journée de la Commémoration', 'ذكرى التحول',               '2027-11-07', 2027, true,  true);

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J1)',            'عيد الفطر المبارك - يوم 1', '2027-03-09', 2027, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J2)',            'عيد الفطر المبارك - يوم 2', '2027-03-10', 2027, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J3)',            'عيد الفطر المبارك - يوم 3', '2027-03-11', 2027, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J1)',            'عيد الأضحى المبارك - يوم 1','2027-05-17', 2027, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J2)',            'عيد الأضحى المبارك - يوم 2','2027-05-18', 2027, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Nouvel An Hégirien',          'رأس السنة الهجرية',         '2027-06-06', 2027, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Mawlid (Aïd el-Mawlid)',      'المولد النبوي الشريف',      '2027-08-14', 2027, false, true);

-- ════════════════════════════════════════════════════════════════
--  2028
-- ════════════════════════════════════════════════════════════════

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Jour de l''An',                'رأس السنة الميلادية',       '2028-01-01', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Indépendance',     'عيد الاستقلال',             '2028-03-20', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Martyr',              'يوم الشهيد',                '2028-04-09', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête du Travail',             'عيد العمال',                '2028-05-01', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la République',       'عيد الجمهورية',             '2028-07-25', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de la Femme',            'عيد المرأة',                '2028-08-13', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Fête de l''Évacuation',       'عيد الجلاء',                '2028-10-15', 2028, true,  true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Journée de la Commémoration', 'ذكرى التحول',               '2028-11-07', 2028, true,  true);

INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J1)',            'عيد الفطر المبارك - يوم 1', '2028-02-27', 2028, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J2)',            'عيد الفطر المبارك - يوم 2', '2028-02-28', 2028, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Fitr (J3)',            'عيد الفطر المبارك - يوم 3', '2028-02-29', 2028, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J1)',            'عيد الأضحى المبارك - يوم 1','2028-05-05', 2028, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Aïd el-Adha (J2)',            'عيد الأضحى المبارك - يوم 2','2028-05-06', 2028, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Nouvel An Hégirien',          'رأس السنة الهجرية',         '2028-05-25', 2028, false, true);
INSERT INTO public_holiday (id, name, name_ar, holiday_date, year, is_recurring, active) VALUES (nextval('sequence_generator'), 'Mawlid (Aïd el-Mawlid)',      'المولد النبوي الشريف',      '2028-08-02', 2028, false, true);

-- Vérification
SELECT year, COUNT(*) as total, SUM(CASE WHEN is_recurring THEN 1 ELSE 0 END) as fixes, SUM(CASE WHEN NOT is_recurring THEN 1 ELSE 0 END) as variables
FROM public_holiday WHERE year BETWEEN 2024 AND 2028
GROUP BY year ORDER BY year;
