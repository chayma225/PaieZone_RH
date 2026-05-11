import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { IPayrollPeriod, MONTH_LABELS } from '../payroll-period.model';
import { PayrollPeriodService } from '../service/payroll-period.service';

@Component({
  selector: 'jhi-payroll-period-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll-period-delete-dialog.html',
})
export class PayrollPeriodDeleteDialogComponent {

  modal         = inject(NgbActiveModal);
  periodService = inject(PayrollPeriodService);

  @Input() payrollPeriod!: IPayrollPeriod;
  isDeleting = false;

  getMonthLabel(m: number): string {
    return MONTH_LABELS[m] ?? String(m);
  }

  onConfirm(): void {
    this.isDeleting = true;
    this.periodService.delete(this.payrollPeriod.id!).subscribe({
      next: () => this.modal.close('deleted'),
      error: err => {
        alert(err?.error?.detail ?? 'Erreur lors de la suppression.');
        this.isDeleting = false;
      },
    });
  }
}
