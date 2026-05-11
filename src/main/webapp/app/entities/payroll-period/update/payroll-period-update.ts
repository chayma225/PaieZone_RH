import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { finalize } from 'rxjs';
import { IPayrollPeriod, MONTH_LABELS } from '../payroll-period.model';
import { PayrollPeriodService } from '../service/payroll-period.service';

@Component({
  selector: 'jhi-payroll-period-update',
  standalone: true,
  imports: [NgIf, NgFor, RouterModule, ReactiveFormsModule],
  templateUrl: './payroll-period-update.html',
})
export class PayrollPeriodUpdate implements OnInit {

  private fb     = inject(FormBuilder);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);
  private svc    = inject(PayrollPeriodService);

  isEdit = false;
  saving = false;

  months = Object.entries(MONTH_LABELS).map(([v, l]) => ({ v: +v, l }));
  years  = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + 2 - i);

  form = this.fb.group({
    id:     [null as number | null],
    month:  [null as number | null, [Validators.required, Validators.min(1), Validators.max(12)]],
    year:   [null as number | null, [Validators.required]],
    status: ['DRAFT', Validators.required],
    companyId: [null as number | null],
  });

  ngOnInit(): void {
    const data = this.route.snapshot.data['payrollPeriod'] as IPayrollPeriod | null;
    if (data?.id) {
      this.isEdit = true;
      this.form.patchValue(data as any);
    }
  }

  invalid(f: string): boolean {
    const c = this.form.get(f);
    return !!(c?.invalid && (c.dirty || c.touched));
  }
  getMonthLabel(m: number): string {
    return MONTH_LABELS[m] ?? String(m);
  }
  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    const val = this.form.value as IPayrollPeriod;
    const req$ = this.isEdit ? this.svc.update(val) : this.svc.create(val);
    req$.pipe(finalize(() => (this.saving = false))).subscribe({
      next: () => this.router.navigate(['/payroll-periods']),
      error: err => alert(err?.error?.detail ?? 'Erreur lors de la sauvegarde.'),
    });
  }
}
