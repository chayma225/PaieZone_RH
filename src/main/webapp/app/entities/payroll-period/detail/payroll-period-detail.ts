import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {NgIf, NgFor, NgClass, DatePipe, DecimalPipe} from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { IPayrollPeriod, MONTH_LABELS, STATUS_CONFIG } from '../payroll-period.model';
import { PayrollPeriodService, BulkCalculationResult } from '../service/payroll-period.service';

@Component({
  selector: 'jhi-payroll-period-detail',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe,DecimalPipe, RouterModule],
  templateUrl: './payroll-period-detail.html',
})
export class PayrollPeriodDetail {

  private route = inject(ActivatedRoute);
  private svc   = inject(PayrollPeriodService);

  period: IPayrollPeriod | null =
    this.route.snapshot.data['payrollPeriod'] as IPayrollPeriod | null;

  isCalculating = false;
  isValidating  = false;
  isLocking     = false;
  result:     BulkCalculationResult | null = null;
  successMsg  = '';
  errorMsg    = '';

  label  = (m: number): string => MONTH_LABELS[m] ?? String(m);
  slabel = (s: string): string => STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s;
  badge  = (s: string): string => STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.badge ?? 'bg-secondary';

  previousState(): void { window.history.back(); }

  private reloadPeriod(): void {
    if (!this.period?.id) return;
    this.svc.find(this.period.id).subscribe({
      next: (res: HttpResponse<IPayrollPeriod>) => {
        if (res.body) this.period = res.body;
      },
    });
  }

  calculateAll(): void {
    if (!this.period?.id) return;
    if (!confirm(
      `Calculer tous les bulletins de ${this.label(this.period.month!)} ${this.period.year} ?`
    )) return;
    this.isCalculating = true;
    this.result = null;
    this.successMsg = '';
    this.errorMsg   = '';
    this.svc.calculateAll(this.period.id).subscribe({
      next: res => {
        this.result        = res.body;
        this.isCalculating = false;
        this.successMsg    =
          `✅ ${res.body?.calculated}/${res.body?.totalEmployees} bulletins calculés.`;
        if ((res.body?.errors ?? 0) > 0)
          this.errorMsg = `⚠️ ${res.body?.errors} erreur(s).`;
        this.reloadPeriod();
      },
      error: err => {
        this.isCalculating = false;
        this.errorMsg = err?.error?.detail ?? 'Erreur calcul.';
      },
    });
  }

  validatePeriod(): void {
    if (!this.period?.id) return;
    if (!confirm(`Valider ${this.label(this.period.month!)} ${this.period.year} ?`)) return;
    this.isValidating = true;
    this.svc.validatePeriod(this.period.id).subscribe({
      next: () => {
        this.isValidating = false;
        this.successMsg = '✅ Période validée.';
        this.reloadPeriod();
      },
      error: err => {
        this.isValidating = false;
        this.errorMsg = err?.error?.detail ?? 'Erreur validation.';
      },
    });
  }

  lockPeriod(): void {
    if (!this.period?.id) return;
    if (!confirm(
      `⚠️ CLÔTURER DÉFINITIVEMENT ${this.label(this.period.month!)} ${this.period.year} ?\nIRRÉVERSIBLE.`
    )) return;
    this.isLocking = true;
    this.svc.lockPeriod(this.period.id).subscribe({
      next: () => {
        this.isLocking  = false;
        this.successMsg = '🔒 Période clôturée.';
        this.reloadPeriod();
      },
      error: err => {
        this.isLocking = false;
        this.errorMsg  = err?.error?.detail ?? 'Erreur clôture.';
      },
    });
  }
}
