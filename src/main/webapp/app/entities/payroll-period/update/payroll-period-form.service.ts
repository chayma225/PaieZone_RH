import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IPayrollPeriod, NewPayrollPeriod, PayrollStatus } from '../payroll-period.model';

type PayrollPeriodFormContent = {
  id:        FormControl<IPayrollPeriod['id'] | NewPayrollPeriod['id']>;
  month:     FormControl<IPayrollPeriod['month']>;
  year:      FormControl<IPayrollPeriod['year']>;
  status:    FormControl<IPayrollPeriod['status']>;
  companyId: FormControl<IPayrollPeriod['companyId']>;
  notes:     FormControl<IPayrollPeriod['notes']>;
};

export type PayrollPeriodFormGroup = FormGroup<PayrollPeriodFormContent>;

@Injectable({ providedIn: 'root' })
export class PayrollPeriodFormService {

  createFormGroup(p: IPayrollPeriod | null = null): PayrollPeriodFormGroup {
    const now = new Date();
    const defaults: Partial<IPayrollPeriod> = {
      status:    PayrollStatus.DRAFT,
      month:     now.getMonth() + 1,
      year:      now.getFullYear(),
      companyId: 1,
      notes:     null,
    };
    const raw = { ...defaults, ...(p ?? {}) };

    return new FormGroup<PayrollPeriodFormContent>({
      id: new FormControl(
        { value: raw.id ?? null, disabled: true },
        { nonNullable: true }
      ),
      month: new FormControl(raw.month, [
        Validators.required,
        Validators.min(1),
        Validators.max(12),
      ]),
      year: new FormControl(raw.year, [
        Validators.required,
        Validators.min(2020),
        Validators.max(2099),
      ]),
      status: new FormControl(raw.status ?? PayrollStatus.DRAFT, [
        Validators.required,
      ]),
      companyId: new FormControl(raw.companyId, [
        Validators.required,
      ]),
      notes: new FormControl(raw.notes ?? null),
    });
  }

  getValue(form: PayrollPeriodFormGroup): IPayrollPeriod | NewPayrollPeriod {
    const raw = form.getRawValue() as any;
    if (!raw.id) {
      raw.status = PayrollStatus.DRAFT;
    }
    return {
      id:        raw.id ?? null,
      month:     raw.month,
      year:      raw.year,
      status:    raw.status,
      companyId: raw.companyId,
      notes:     raw.notes ?? null,
    } as IPayrollPeriod | NewPayrollPeriod;
  }

  resetForm(form: PayrollPeriodFormGroup, p: IPayrollPeriod): void {
    form.reset({
      id:        { value: p.id, disabled: true },
      month:     p.month,
      year:      p.year,
      status:    p.status ?? PayrollStatus.DRAFT,
      companyId: p.companyId ?? 1,
      notes:     p.notes ?? null,
    } as any);
  }
}
