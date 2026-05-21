import { Injectable, signal } from '@angular/core';
import type {
  Company, Employee, Department, PayrollPeriod, LeaveRequest,
  Advance, AuditEntry, TenantUser,
} from './types';

@Injectable({ providedIn: 'root' })
export class DataService {
  // ─── Companies (tenants) ────────────────────────────────────────────
  readonly companies = signal<Company[]>([
    { id: 1, name: 'Atlas Tech SARL', tradeName: 'Atlas Tech', taxId: '1234567/A', city: 'Tunis', employees: 42, plan: 'BUSINESS', status: 'ACTIVE', priceHT: 540, renewal: '2026-08-12', schema: 'atlas_tech', mrr: 540 },
    { id: 2, name: 'Sahel Mediagroup', tradeName: 'Sahel Media', taxId: '7634210/B', city: 'Sousse', employees: 18, plan: 'PME', status: 'ACTIVE', priceHT: 260, renewal: '2026-06-30', schema: 'sahel_media', mrr: 260 },
    { id: 3, name: 'Carthago Industries', tradeName: 'Carthago Ind.', taxId: '9912340/C', city: 'Bizerte', employees: 124, plan: 'ENTERPRISE', status: 'ACTIVE', priceHT: 1480, renewal: '2027-01-04', schema: 'carthago_ind', mrr: 1480 },
    { id: 4, name: 'Mahdia Build SARL', tradeName: 'Mahdia Build', taxId: '5512098/D', city: 'Mahdia', employees: 8, plan: 'STARTER', status: 'TRIAL', priceHT: 0, renewal: '2026-05-22', schema: 'mahdia_build', mrr: 0 },
    { id: 5, name: 'Olea Pharma SA', tradeName: 'Olea Pharma', taxId: '3344001/E', city: 'Sfax', employees: 56, plan: 'BUSINESS', status: 'ACTIVE', priceHT: 720, renewal: '2026-09-18', schema: 'olea_pharma', mrr: 720 },
    { id: 6, name: 'Hammamet Resort & Co', tradeName: 'Hammamet Resort', taxId: '2218800/F', city: 'Hammamet', employees: 88, plan: 'BUSINESS', status: 'SUSPENDED', priceHT: 880, renewal: '2026-04-30', schema: 'hammamet_res', mrr: 0 },
    { id: 7, name: 'Djerba Agro SARL', tradeName: 'Djerba Agro', taxId: '8800123/G', city: 'Djerba', employees: 22, plan: 'PME', status: 'ACTIVE', priceHT: 290, renewal: '2026-07-09', schema: 'djerba_agro', mrr: 290 },
    { id: 8, name: 'Kairouan Logistique', tradeName: 'Kairouan Log.', taxId: '4456789/H', city: 'Kairouan', employees: 34, plan: 'PME', status: 'ACTIVE', priceHT: 320, renewal: '2026-11-21', schema: 'kairouan_log', mrr: 320 },
  ]);

  readonly planLimits: Record<string, { maxEmployees: number; price: number; label: string }> = {
    STARTER: { maxEmployees: 10, price: 0, label: 'Starter (Essai)' },
    PME: { maxEmployees: 30, price: 290, label: 'PME' },
    BUSINESS: { maxEmployees: 100, price: 720, label: 'Business' },
    ENTERPRISE: { maxEmployees: 500, price: 1480, label: 'Enterprise' },
    CUSTOM: { maxEmployees: 9999, price: 0, label: 'Sur mesure' },
  };

  // ─── Regulatory ────────────────────────────────────────────────────
  readonly regulatory = signal([
    { code: 'CNSS_SAL', label: 'CNSS salarié (base)', rate: 9.18, unit: '%', updated: '2026-01-01', source: 'JORT n°3-2026' },
    { code: 'CAVIS', label: 'CAVIS (régime complémentaire)', rate: 1.00, unit: '%', updated: '2026-01-01', source: 'JORT n°3-2026' },
    { code: 'CSS', label: 'CSS (contribution sociale solidaire)', rate: 0.50, unit: '%', updated: '2026-01-01', source: 'LF 2026 Art. 12' },
    { code: 'CNSS_EMP', label: 'CNSS employeur', rate: 16.57, unit: '%', updated: '2026-01-01', source: 'JORT n°3-2026' },
    { code: 'TFP', label: 'TFP (taxe formation pro.)', rate: 1.00, unit: '%', updated: '2026-01-01', source: 'LF 2026 Art. 18' },
    { code: 'FOPROLOS', label: 'FOPROLOS (employeur)', rate: 1.00, unit: '%', updated: '2026-01-01', source: 'LF 2026 Art. 19' },
  ]);

  readonly irppBrackets = signal([
    { from: 0, to: 5000, rate: 0, label: 'Tranche exonérée' },
    { from: 5000, to: 10000, rate: 15, label: '15%' },
    { from: 10000, to: 20000, rate: 25, label: '25%' },
    { from: 20000, to: 30000, rate: 30, label: '30%' },
    { from: 30000, to: 40000, rate: 33, label: '33%' },
    { from: 40000, to: 50000, rate: 36, label: '36%' },
    { from: 50000, to: 70000, rate: 38, label: '38%' },
    { from: 70000, to: null, rate: 40, label: '40%' },
  ]);

  // ─── Audit log ─────────────────────────────────────────────────────
  readonly audit = signal<AuditEntry[]>([
    { id: 9412, user: 'admin@paiezone.tn', role: 'SUPER_ADMIN', action: 'UPDATE', entity: 'RegulatoryParam', entityId: 'CNSS_SAL', ip: '41.230.114.22', date: '14/05/2026 08:42:11', detail: 'rate: 9.00 → 9.18' },
    { id: 9411, user: 'leila.chaabane@atlas-tech.tn', role: 'ADMIN', action: 'CREATE', entity: 'Employee', entityId: '#EMP-1043', ip: '197.0.84.10', date: '14/05/2026 08:33:00', detail: 'Mohamed Trabelsi (CDI)' },
    { id: 9410, user: 'leila.chaabane@atlas-tech.tn', role: 'ADMIN', action: 'VALIDATE', entity: 'PayrollPeriod', entityId: '2026-04', ip: '197.0.84.10', date: '14/05/2026 07:58:42', detail: 'Avril 2026 — 42 bulletins' },
    { id: 9409, user: 'salma.bouzidi@atlas-tech.tn', role: 'RH_COMPTABLE', action: 'APPROVE', entity: 'LeaveRequest', entityId: '#LV-2811', ip: '197.0.84.11', date: '14/05/2026 07:14:19', detail: 'Approuvé 8 jours CP' },
    { id: 9407, user: 'mehdi.bensalah@atlas-tech.tn', role: 'EMPLOYE', action: 'VIEW', entity: 'PaySlip', entityId: '#PS-2026-04-A12', ip: '102.66.4.18', date: '13/05/2026 18:44:02', detail: 'Téléchargement PDF' },
    { id: 9405, user: 'salma.bouzidi@atlas-tech.tn', role: 'RH_COMPTABLE', action: 'EXPORT', entity: 'CnssDeclaration', entityId: '2026-Q1', ip: '197.0.84.11', date: '13/05/2026 14:08:11', detail: 'Export PDF + XML' },
    { id: 9403, user: 'leila.chaabane@atlas-tech.tn', role: 'ADMIN', action: 'UPDATE', entity: 'Contract', entityId: '#CTR-208', ip: '197.0.84.10', date: '13/05/2026 10:14:25', detail: 'Salaire: 2100 → 2350 TND' },
  ]);

  // ─── Employees (Atlas Tech) ────────────────────────────────────────
  readonly employees = signal<Employee[]>([
    { id: 1, matricule: 'A12-001', first: 'Leila', last: 'Chaâbane', ar: 'ليلى الشعبان', role: 'Directrice RH', dept: 'Direction RH', salary: 3850, contract: 'CDI', hireDate: '2018-04-02', city: 'Tunis', cnss: '12500-001', email: 'leila.chaabane@atlas-tech.tn', phone: '+216 22 145 308', cat: 'EXECUTIVE', gender: 'F', children: 2 },
    { id: 2, matricule: 'A12-018', first: 'Mehdi', last: 'Ben Salah', ar: 'مهدي بن صالح', role: 'Lead Développeur', dept: 'Engineering', salary: 3400, contract: 'CDI', hireDate: '2020-09-01', city: 'Tunis', cnss: '12500-018', email: 'mehdi.bensalah@atlas-tech.tn', phone: '+216 24 778 102', cat: 'MANAGER', gender: 'M', children: 1 },
    { id: 3, matricule: 'A12-022', first: 'Amal', last: 'Trabelsi', ar: 'أمل الطرابلسي', role: 'Designer UX', dept: 'Produit', salary: 2200, contract: 'CDI', hireDate: '2022-01-17', city: 'Ariana', cnss: '12500-022', email: 'amal.trabelsi@atlas-tech.tn', phone: '+216 29 600 411', cat: 'TECHNICIAN', gender: 'F', children: 0 },
    { id: 4, matricule: 'A12-031', first: 'Yassine', last: 'Khelifi', ar: 'ياسين الخليفي', role: 'Comptable', dept: 'Finance', salary: 1950, contract: 'CDI', hireDate: '2021-03-12', city: 'Tunis', cnss: '12500-031', email: 'yassine.khelifi@atlas-tech.tn', phone: '+216 21 008 555', cat: 'EMPLOYEE', gender: 'M', children: 3 },
    { id: 5, matricule: 'A12-037', first: 'Salma', last: 'Bouzidi', ar: 'سلمى البوزيدي', role: 'Responsable Paie', dept: 'Direction RH', salary: 2600, contract: 'CDI', hireDate: '2019-11-04', city: 'Manouba', cnss: '12500-037', email: 'salma.bouzidi@atlas-tech.tn', phone: '+216 27 332 891', cat: 'SUPERVISOR', gender: 'F', children: 1 },
    { id: 6, matricule: 'A12-044', first: 'Karim', last: 'Mejri', ar: 'كريم المجري', role: 'Ingénieur DevOps', dept: 'Engineering', salary: 2900, contract: 'CDI', hireDate: '2022-07-08', city: 'Ben Arous', cnss: '12500-044', email: 'karim.mejri@atlas-tech.tn', phone: '+216 28 449 720', cat: 'TECHNICIAN', gender: 'M', children: 0 },
    { id: 7, matricule: 'A12-049', first: 'Nour', last: 'Hamdi', ar: 'نور الحمدي', role: 'Commercial Senior', dept: 'Ventes', salary: 2400, contract: 'CDI', hireDate: '2020-02-20', city: 'Tunis', cnss: '12500-049', email: 'nour.hamdi@atlas-tech.tn', phone: '+216 22 887 005', cat: 'EMPLOYEE', gender: 'F', children: 2 },
    { id: 8, matricule: 'A12-055', first: 'Anis', last: 'Gharbi', ar: 'أنيس الغربي', role: 'Stagiaire — Engineering', dept: 'Engineering', salary: 600, contract: 'CIVP', hireDate: '2025-09-01', city: 'Tunis', cnss: '—', email: 'anis.gharbi@atlas-tech.tn', phone: '+216 50 110 207', cat: 'WORKER', gender: 'M', children: 0 },
    { id: 9, matricule: 'A12-058', first: 'Rim', last: 'Saidi', ar: 'ريم السعيدي', role: 'Marketing Manager', dept: 'Marketing', salary: 2800, contract: 'CDI', hireDate: '2021-10-11', city: 'Tunis', cnss: '12500-058', email: 'rim.saidi@atlas-tech.tn', phone: '+216 26 991 084', cat: 'MANAGER', gender: 'F', children: 1 },
    { id: 10, matricule: 'A12-061', first: 'Oussama', last: 'Romdhane', ar: 'أسامة الرمضاني', role: 'Développeur Full-Stack', dept: 'Engineering', salary: 2300, contract: 'CDD', hireDate: '2024-03-04', city: 'Sousse', cnss: '12500-061', email: 'oussama.romdhane@atlas-tech.tn', phone: '+216 25 554 632', cat: 'TECHNICIAN', gender: 'M', children: 0 },
    { id: 11, matricule: 'A12-064', first: 'Sirine', last: 'Mansouri', ar: 'سيرين المنصوري', role: 'Chargée RH', dept: 'Direction RH', salary: 1800, contract: 'CDI', hireDate: '2023-06-19', city: 'Ariana', cnss: '12500-064', email: 'sirine.mansouri@atlas-tech.tn', phone: '+216 21 778 005', cat: 'EMPLOYEE', gender: 'F', children: 0 },
    { id: 12, matricule: 'A12-067', first: 'Walid', last: 'Hammami', ar: 'وليد الحمامي', role: 'Support N2', dept: 'Support', salary: 1700, contract: 'CDI', hireDate: '2022-11-28', city: 'Tunis', cnss: '12500-067', email: 'walid.hammami@atlas-tech.tn', phone: '+216 24 412 008', cat: 'EMPLOYEE', gender: 'M', children: 2 },
  ]);

  // ─── Departments ───────────────────────────────────────────────────
  readonly departments = signal<Department[]>([
    { id: 1, code: 'DIR', name: 'Direction Générale', head: 'Mohamed Trabelsi', count: 3 },
    { id: 2, code: 'RH', name: 'Direction RH', head: 'Leila Chaâbane', count: 4 },
    { id: 3, code: 'ENG', name: 'Engineering', head: 'Mehdi Ben Salah', count: 14 },
    { id: 4, code: 'FIN', name: 'Finance', head: 'Yassine Khelifi', count: 3 },
    { id: 5, code: 'MKT', name: 'Marketing', head: 'Rim Saidi', count: 5 },
    { id: 6, code: 'VTE', name: 'Ventes', head: 'Nour Hamdi', count: 8 },
    { id: 7, code: 'SUP', name: 'Support Client', head: 'Walid Hammami', count: 5 },
  ]);

  // ─── Payroll periods ───────────────────────────────────────────────
  readonly payrollPeriods = signal<PayrollPeriod[]>([
    { id: 1, month: 5, year: 2026, label: 'Mai 2026', status: 'DRAFT', employees: 42, gross: 96400, net: 71200, validatedAt: null, lockedAt: null },
    { id: 2, month: 4, year: 2026, label: 'Avril 2026', status: 'VALIDATED', employees: 42, gross: 94800, net: 70100, validatedAt: '03/05/2026', lockedAt: '05/05/2026' },
    { id: 3, month: 3, year: 2026, label: 'Mars 2026', status: 'LOCKED', employees: 41, gross: 92100, net: 68200, validatedAt: '02/04/2026', lockedAt: '04/04/2026' },
    { id: 4, month: 2, year: 2026, label: 'Février 2026', status: 'EXPORTED', employees: 41, gross: 91200, net: 67500, validatedAt: '03/03/2026', lockedAt: '05/03/2026' },
    { id: 5, month: 1, year: 2026, label: 'Janvier 2026', status: 'EXPORTED', employees: 40, gross: 89400, net: 66200, validatedAt: '02/02/2026', lockedAt: '04/02/2026' },
  ]);

  // ─── Leaves ────────────────────────────────────────────────────────
  readonly leaves = signal<LeaveRequest[]>([
    { id: 'LV-2814', empId: 3, type: 'Congés payés', days: 5, from: '02/06/2026', to: '06/06/2026', submitted: 'il y a 2h', status: 'pending', note: 'Vacances famille.' },
    { id: 'LV-2813', empId: 7, type: 'RTT', days: 1, from: '20/05/2026', to: '20/05/2026', submitted: 'il y a 5h', status: 'pending', note: 'Rendez-vous médical.' },
    { id: 'LV-2812', empId: 10, type: 'Maladie', days: 3, from: '12/05/2026', to: '14/05/2026', submitted: 'hier', status: 'pending', note: 'Arrêt joint.' },
    { id: 'LV-2811', empId: 9, type: 'Congés payés', days: 8, from: '15/06/2026', to: '24/06/2026', submitted: 'hier', status: 'pending', note: '' },
    { id: 'LV-2810', empId: 2, type: 'Congés payés', days: 4, from: '28/05/2026', to: '31/05/2026', submitted: 'il y a 2 j', status: 'approved', note: '' },
  ]);

  readonly advances = signal<Advance[]>([
    { id: 'AV-118', empId: 12, amount: 800, reason: 'Frais médicaux famille', submitted: 'il y a 6h', status: 'pending', repayment: '3 mois' },
    { id: 'AV-117', empId: 3, amount: 500, reason: 'Imprévu personnel', submitted: 'il y a 1 j', status: 'pending', repayment: '2 mois' },
  ]);

  // ─── Tenant users ──────────────────────────────────────────────────
  readonly tenantUsers = signal<TenantUser[]>([
    { id: 1, empId: 1, role: 'ADMIN', lastLogin: '14/05/2026 08:33', active: true, twofa: true },
    { id: 2, empId: 5, role: 'RH_COMPTABLE', lastLogin: '14/05/2026 07:58', active: true, twofa: true },
    { id: 3, empId: 11, role: 'RH_COMPTABLE', lastLogin: '13/05/2026 17:12', active: true, twofa: false },
    { id: 4, empId: 2, role: 'EMPLOYE', lastLogin: '14/05/2026 09:14', active: true, twofa: false },
    { id: 5, empId: 3, role: 'EMPLOYE', lastLogin: '13/05/2026 18:02', active: true, twofa: false },
    { id: 6, empId: 4, role: 'EMPLOYE', lastLogin: '12/05/2026 16:48', active: true, twofa: false },
  ]);

  // ─── SaaS KPIs ─────────────────────────────────────────────────────
  readonly saasKpi = {
    mrr: 5610, mrrDelta: 12.8,
    arr: 67320, arrDelta: 14.2,
    tenants: 8, tenantsDelta: 2,
    totalEmployees: 392, employeesDelta: 28,
    churn: 1.2, uptime: 99.97,
  };

  // ─── Helpers ───────────────────────────────────────────────────────
  empById(id: number): Employee | undefined {
    return this.employees().find(e => e.id === id);
  }

  initials(e: Employee): string {
    return (e.first[0] + e.last[0]).toUpperCase();
  }

  fullName(e: Employee): string {
    return `${e.first} ${e.last}`;
  }

  fmtTND(n: number): string {
    return new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(n) + ' TND';
  }

  fmtTNDdec(n: number): string {
    return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n) + ' TND';
  }

  empBgIdx(id: number): number {
    return ((id * 31) % 6) + 1;
  }

  planLabel(plan: string): string {
    return this.planLimits[plan]?.label ?? plan;
  }
}
