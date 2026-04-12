import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPayrollPeriod, NewPayrollPeriod } from '../payroll-period.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPayrollPeriod for edit and NewPayrollPeriodFormGroupInput for create.
 */
type PayrollPeriodFormGroupInput = IPayrollPeriod | PartialWithRequiredKeyOf<NewPayrollPeriod>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPayrollPeriod | NewPayrollPeriod> = Omit<T, 'calculatedAt' | 'validatedAt' | 'lockedAt'> & {
  calculatedAt?: string | null;
  validatedAt?: string | null;
  lockedAt?: string | null;
};

type PayrollPeriodFormRawValue = FormValueOf<IPayrollPeriod>;

type NewPayrollPeriodFormRawValue = FormValueOf<NewPayrollPeriod>;

type PayrollPeriodFormDefaults = Pick<NewPayrollPeriod, 'id' | 'calculatedAt' | 'validatedAt' | 'lockedAt'>;

type PayrollPeriodFormGroupContent = {
  id: FormControl<PayrollPeriodFormRawValue['id'] | NewPayrollPeriod['id']>;
  month: FormControl<PayrollPeriodFormRawValue['month']>;
  year: FormControl<PayrollPeriodFormRawValue['year']>;
  status: FormControl<PayrollPeriodFormRawValue['status']>;
  calculatedAt: FormControl<PayrollPeriodFormRawValue['calculatedAt']>;
  validatedAt: FormControl<PayrollPeriodFormRawValue['validatedAt']>;
  lockedAt: FormControl<PayrollPeriodFormRawValue['lockedAt']>;
  notes: FormControl<PayrollPeriodFormRawValue['notes']>;
  company: FormControl<PayrollPeriodFormRawValue['company']>;
  createdBy: FormControl<PayrollPeriodFormRawValue['createdBy']>;
};

export type PayrollPeriodFormGroup = FormGroup<PayrollPeriodFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PayrollPeriodFormService {
  createPayrollPeriodFormGroup(payrollPeriod?: PayrollPeriodFormGroupInput): PayrollPeriodFormGroup {
    const payrollPeriodRawValue = this.convertPayrollPeriodToPayrollPeriodRawValue({
      ...this.getFormDefaults(),
      ...(payrollPeriod ?? { id: null }),
    });
    return new FormGroup<PayrollPeriodFormGroupContent>({
      id: new FormControl(
        { value: payrollPeriodRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      month: new FormControl(payrollPeriodRawValue.month, {
        validators: [Validators.required, Validators.min(1), Validators.max(12)],
      }),
      year: new FormControl(payrollPeriodRawValue.year, {
        validators: [Validators.required],
      }),
      status: new FormControl(payrollPeriodRawValue.status, {
        validators: [Validators.required],
      }),
      calculatedAt: new FormControl(payrollPeriodRawValue.calculatedAt),
      validatedAt: new FormControl(payrollPeriodRawValue.validatedAt),
      lockedAt: new FormControl(payrollPeriodRawValue.lockedAt),
      notes: new FormControl(payrollPeriodRawValue.notes),
      company: new FormControl(payrollPeriodRawValue.company, {
        validators: [Validators.required],
      }),
      createdBy: new FormControl(payrollPeriodRawValue.createdBy),
    });
  }

  getPayrollPeriod(form: PayrollPeriodFormGroup): IPayrollPeriod | NewPayrollPeriod {
    return this.convertPayrollPeriodRawValueToPayrollPeriod(form.getRawValue() as PayrollPeriodFormRawValue | NewPayrollPeriodFormRawValue);
  }

  resetForm(form: PayrollPeriodFormGroup, payrollPeriod: PayrollPeriodFormGroupInput): void {
    const payrollPeriodRawValue = this.convertPayrollPeriodToPayrollPeriodRawValue({ ...this.getFormDefaults(), ...payrollPeriod });
    form.reset({
      ...payrollPeriodRawValue,
      id: { value: payrollPeriodRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PayrollPeriodFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      calculatedAt: currentTime,
      validatedAt: currentTime,
      lockedAt: currentTime,
    };
  }

  private convertPayrollPeriodRawValueToPayrollPeriod(
    rawPayrollPeriod: PayrollPeriodFormRawValue | NewPayrollPeriodFormRawValue,
  ): IPayrollPeriod | NewPayrollPeriod {
    return {
      ...rawPayrollPeriod,
      calculatedAt: dayjs(rawPayrollPeriod.calculatedAt, DATE_TIME_FORMAT),
      validatedAt: dayjs(rawPayrollPeriod.validatedAt, DATE_TIME_FORMAT),
      lockedAt: dayjs(rawPayrollPeriod.lockedAt, DATE_TIME_FORMAT),
    };
  }

  private convertPayrollPeriodToPayrollPeriodRawValue(
    payrollPeriod: IPayrollPeriod | (Partial<NewPayrollPeriod> & PayrollPeriodFormDefaults),
  ): PayrollPeriodFormRawValue | PartialWithRequiredKeyOf<NewPayrollPeriodFormRawValue> {
    return {
      ...payrollPeriod,
      calculatedAt: payrollPeriod.calculatedAt ? payrollPeriod.calculatedAt.format(DATE_TIME_FORMAT) : undefined,
      validatedAt: payrollPeriod.validatedAt ? payrollPeriod.validatedAt.format(DATE_TIME_FORMAT) : undefined,
      lockedAt: payrollPeriod.lockedAt ? payrollPeriod.lockedAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
