import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import type {
  Company,
  Employee,
  Contract,
  Department,
  PayrollPeriod,
  LeaveRequest,
  Advance,
  AuditEntry,
  TenantUser,
  RegulatoryParam,
} from './types';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly api = inject(ApiService);

  // Reactive signals — populated from API on init
  readonly companies = signal<Company[]>([]);
  readonly companiesLoaded = signal(false);
  readonly employees = signal<Employee[]>([]);
  readonly departments = signal<Department[]>([]);
  readonly payrollPeriods = signal<PayrollPeriod[]>([]);
  readonly leaves = signal<LeaveRequest[]>([]);
  readonly advances = signal<Advance[]>([]);
  readonly stats = signal<Record<string, number>>({});

  // Audit & tenant users — loaded lazily by admin screens
  readonly audit = signal<AuditEntry[]>([]);
  readonly tenantUsers = signal<TenantUser[]>([]);

  readonly myEmployee = signal<Employee | null>(null);

  // Regulatory params — loaded from API, fallback to validated static values
  // GOLDEN RULE: NEVER modify the fallback rates (CNSS 9.18%, CAVIS 1%, CSS 0.5%)
  readonly regulatoryParams = signal<RegulatoryParam[]>([]);

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

  readonly planLimits: Record<string, { maxEmployees: number; price: number; label: string }> = {
    STARTER: { maxEmployees: 10, price: 0, label: 'Starter (Essai)' },
    PME: { maxEmployees: 30, price: 290, label: 'PME' },
    BUSINESS: { maxEmployees: 100, price: 720, label: 'Business' },
    ENTERPRISE: { maxEmployees: 500, price: 1480, label: 'Enterprise' },
    CUSTOM: { maxEmployees: 9999, price: 0, label: 'Sur mesure' },
  };

  constructor() {
    this.loadAll();
  }

  private mergeContracts(emps: Employee[], contracts: Contract[]): Employee[] {
    const best = new Map<number, Contract>();
    for (const c of contracts) {
      const prev = best.get(c.employeeId);
      if (!prev || c.status === 'ACTIVE') best.set(c.employeeId, c);
    }
    return emps.map(e => {
      const c = best.get(e.id);
      return c ? { ...e, salary: c.baseSalary, contract: c.contractType as Employee['contract'] } : e;
    });
  }

  private loadAll(): void {
    this.api.employees().subscribe({
      next: emps => {
        this.api.contracts().subscribe({
          next: contracts => this.employees.set(this.mergeContracts(emps, contracts)),
          error: () => this.employees.set(emps),
        });
      },
      error: () => {},
    });
    this.api.leaveRequests().subscribe({ next: v => this.leaves.set(v), error: () => {} });
    this.api.advances().subscribe({ next: v => this.advances.set(v), error: () => {} });
    this.api.payrollPeriods().subscribe({ next: v => this.payrollPeriods.set(v), error: () => {} });
    this.api.companies().subscribe({
      next: v => {
        this.companies.set(v);
        this.companiesLoaded.set(true);
      },
      error: () => {
        this.companiesLoaded.set(true);
      },
    });
    this.api.departments().subscribe({ next: v => this.departments.set(v), error: () => {} });
    this.api.dashboardStats().subscribe({ next: v => this.stats.set(v as any), error: () => {} });
    this.api.regulatoryParams().subscribe({ next: v => this.regulatoryParams.set(v), error: () => {} });
    this.api.myEmployee().subscribe({ next: v => this.myEmployee.set(v), error: () => {} });
  }

  loadAudit(): void {
    this.api.auditLogs().subscribe({ next: v => this.audit.set(v), error: () => {} });
  }

  reloadEmployees(): void {
    this.api.employees().subscribe({
      next: emps => {
        this.api.contracts().subscribe({
          next: contracts => this.employees.set(this.mergeContracts(emps, contracts)),
          error: () => this.employees.set(emps),
        });
      },
      error: () => {},
    });
    this.api.dashboardStats().subscribe({ next: v => this.stats.set(v as any), error: () => {} });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  empById(id: number): Employee | undefined {
    return this.employees().find(e => e.id === id);
  }

  initials(e: Employee): string {
    return ((e.first[0] ?? '') + (e.last[0] ?? '')).toUpperCase();
  }

  fullName(e: Employee): string {
    return `${e.first} ${e.last}`.trim();
  }

  fmtTND(n: number): string {
    return new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(n) + ' TND';
  }

  fmtTNDdec(n: number): string {
    return (
      new Intl.NumberFormat('fr-TN', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }).format(n) + ' TND'
    );
  }

  empBgIdx(id: number): number {
    return ((id * 31) % 6) + 1;
  }

  planLabel(plan: string): string {
    return this.planLimits[plan]?.label ?? plan;
  }
}
