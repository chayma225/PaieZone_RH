import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';

import {
  IPayrollPeriod,
  PayrollStatus,
  MONTH_LABELS,
  STATUS_CONFIG,
} from '../payroll-period.model';
import {
  PayrollPeriodService,
  BulkCalculationResult,
} from '../service/payroll-period.service';

@Component({
  selector: 'jhi-payroll-period',
  standalone: true,
  imports: [
    NgIf, NgFor, NgClass, DatePipe,
    RouterModule, FormsModule,
    NgbPaginationModule, NgbTooltipModule,
  ],
  templateUrl: './payroll-period.html',
})
export class PayrollPeriod implements OnInit {

  private svc = inject(PayrollPeriodService);

  periods     = signal<IPayrollPeriod[]>([]);
  loading     = signal(false);
  calculating = signal<number | null>(null);
  calcResult  = signal<BulkCalculationResult | null>(null);
  totalItems  = signal(0);
  page        = 1;
  pageSize    = 15;
  filterYear:   number | null = null;
  filterStatus: string | null = null;
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    const req: any = {
      page: this.page - 1,
      size: this.pageSize,
      sort: 'year,desc',
    };
    if (this.filterYear)   req['year.equals']   = this.filterYear;
    if (this.filterStatus) req['status.equals'] = this.filterStatus;

    this.svc.query(req)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          this.periods.set(res.body ?? []);
          this.totalItems.set(+(res.headers.get('X-Total-Count') ?? 0));
        },
        error: err => console.error('Erreur chargement', err),
      });
  }

  onCalculate(p: IPayrollPeriod): void {
    if (!confirm(`Calculer tous les bulletins de ${this.label(p.month!)} ${p.year} ?`)) return;
    this.calculating.set(p.id!);
    this.svc.calculateAll(p.id!)
      .pipe(finalize(() => this.calculating.set(null)))
      .subscribe({
        next: res => { this.calcResult.set(res.body); this.load(); },
        error: err => alert(err?.error?.detail ?? 'Erreur calcul.'),
      });
  }

  onValidate(p: IPayrollPeriod): void {
    if (!confirm(`Valider ${this.label(p.month!)} ${p.year} ?`)) return;
    this.svc.validatePeriod(p.id!).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.detail ?? 'Erreur validation.'),
    });
  }

  onLock(p: IPayrollPeriod): void {
    if (!confirm(
      `⚠️ Clôturer définitivement ${this.label(p.month!)} ${p.year} ?\nIRRÉVERSIBLE.`
    )) return;
    this.svc.lockPeriod(p.id!).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.detail ?? 'Erreur clôture.'),
    });
  }

  onDelete(p: IPayrollPeriod): void {
    if (!confirm(`Supprimer la période ${this.label(p.month!)} ${p.year} ?`)) return;
    this.svc.delete(p.id!).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.detail ?? 'Erreur suppression.'),
    });
  }

  reset(): void {
    this.filterYear   = null;
    this.filterStatus = null;
    this.page         = 1;
    this.load();
  }

  trackById = (_: number, p: IPayrollPeriod): number => p.id!;

  label = (m: number): string => MONTH_LABELS[m] ?? String(m);

  statusLabel = (s: string): string =>
    STATUS_CONFIG[s as PayrollStatus]
      ? STATUS_CONFIG[s as PayrollStatus].label
      : s;

  statusBadge = (s: string): string =>
    STATUS_CONFIG[s as PayrollStatus]
      ? STATUS_CONFIG[s as PayrollStatus].badge
      : 'bg-secondary';

  statusIcon = (s: string): string =>
    STATUS_CONFIG[s as PayrollStatus]
      ? STATUS_CONFIG[s as PayrollStatus].icon
      : '';

  iconBg = (s: string): string =>
    ({ DRAFT: 'bg-secondary', CALCULATED: 'bg-info', VALIDATED: 'bg-warning', LOCKED: 'bg-success' })[s]
    ?? 'bg-secondary';
}
