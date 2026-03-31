import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPaySlip, NewPaySlip } from '../pay-slip.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPaySlip for edit and NewPaySlipFormGroupInput for create.
 */
type PaySlipFormGroupInput = IPaySlip | PartialWithRequiredKeyOf<NewPaySlip>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IPaySlip | NewPaySlip> = Omit<T, 'generatedAt' | 'sentToEmployeeAt'> & {
  generatedAt?: string | null;
  sentToEmployeeAt?: string | null;
};

type PaySlipFormRawValue = FormValueOf<IPaySlip>;

type NewPaySlipFormRawValue = FormValueOf<NewPaySlip>;

type PaySlipFormDefaults = Pick<NewPaySlip, 'id' | 'generatedAt' | 'sentToEmployeeAt'>;

type PaySlipFormGroupContent = {
  id: FormControl<PaySlipFormRawValue['id'] | NewPaySlip['id']>;
  month: FormControl<PaySlipFormRawValue['month']>;
  year: FormControl<PaySlipFormRawValue['year']>;
  baseSalary: FormControl<PaySlipFormRawValue['baseSalary']>;
  totalGains: FormControl<PaySlipFormRawValue['totalGains']>;
  totalDeductions: FormControl<PaySlipFormRawValue['totalDeductions']>;
  grossSalary: FormControl<PaySlipFormRawValue['grossSalary']>;
  cnssSalaryAmount: FormControl<PaySlipFormRawValue['cnssSalaryAmount']>;
  cavisAmount: FormControl<PaySlipFormRawValue['cavisAmount']>;
  taxableIncome: FormControl<PaySlipFormRawValue['taxableIncome']>;
  irppAmount: FormControl<PaySlipFormRawValue['irppAmount']>;
  netSalary: FormControl<PaySlipFormRawValue['netSalary']>;
  employerCnss: FormControl<PaySlipFormRawValue['employerCnss']>;
  employerCavis: FormControl<PaySlipFormRawValue['employerCavis']>;
  totalEmployerCost: FormControl<PaySlipFormRawValue['totalEmployerCost']>;
  workedDays: FormControl<PaySlipFormRawValue['workedDays']>;
  paidLeaveDays: FormControl<PaySlipFormRawValue['paidLeaveDays']>;
  unpaidDays: FormControl<PaySlipFormRawValue['unpaidDays']>;
  overtimeHours: FormControl<PaySlipFormRawValue['overtimeHours']>;
  status: FormControl<PaySlipFormRawValue['status']>;
  pdfUrl: FormControl<PaySlipFormRawValue['pdfUrl']>;
  generatedAt: FormControl<PaySlipFormRawValue['generatedAt']>;
  sentToEmployeeAt: FormControl<PaySlipFormRawValue['sentToEmployeeAt']>;
  bankTransferRef: FormControl<PaySlipFormRawValue['bankTransferRef']>;
  employee: FormControl<PaySlipFormRawValue['employee']>;
  payrollPeriod: FormControl<PaySlipFormRawValue['payrollPeriod']>;
  contract: FormControl<PaySlipFormRawValue['contract']>;
};

export type PaySlipFormGroup = FormGroup<PaySlipFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PaySlipFormService {
  createPaySlipFormGroup(paySlip: PaySlipFormGroupInput = { id: null }): PaySlipFormGroup {
    const paySlipRawValue = this.convertPaySlipToPaySlipRawValue({
      ...this.getFormDefaults(),
      ...paySlip,
    });
    return new FormGroup<PaySlipFormGroupContent>({
      id: new FormControl(
        { value: paySlipRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      month: new FormControl(paySlipRawValue.month, {
        validators: [Validators.required, Validators.min(1), Validators.max(12)],
      }),
      year: new FormControl(paySlipRawValue.year, {
        validators: [Validators.required],
      }),
      baseSalary: new FormControl(paySlipRawValue.baseSalary, {
        validators: [Validators.required],
      }),
      totalGains: new FormControl(paySlipRawValue.totalGains, {
        validators: [Validators.required],
      }),
      totalDeductions: new FormControl(paySlipRawValue.totalDeductions, {
        validators: [Validators.required],
      }),
      grossSalary: new FormControl(paySlipRawValue.grossSalary, {
        validators: [Validators.required],
      }),
      cnssSalaryAmount: new FormControl(paySlipRawValue.cnssSalaryAmount, {
        validators: [Validators.required],
      }),
      cavisAmount: new FormControl(paySlipRawValue.cavisAmount),
      taxableIncome: new FormControl(paySlipRawValue.taxableIncome, {
        validators: [Validators.required],
      }),
      irppAmount: new FormControl(paySlipRawValue.irppAmount, {
        validators: [Validators.required],
      }),
      netSalary: new FormControl(paySlipRawValue.netSalary, {
        validators: [Validators.required],
      }),
      employerCnss: new FormControl(paySlipRawValue.employerCnss, {
        validators: [Validators.required],
      }),
      employerCavis: new FormControl(paySlipRawValue.employerCavis),
      totalEmployerCost: new FormControl(paySlipRawValue.totalEmployerCost, {
        validators: [Validators.required],
      }),
      workedDays: new FormControl(paySlipRawValue.workedDays),
      paidLeaveDays: new FormControl(paySlipRawValue.paidLeaveDays),
      unpaidDays: new FormControl(paySlipRawValue.unpaidDays),
      overtimeHours: new FormControl(paySlipRawValue.overtimeHours),
      status: new FormControl(paySlipRawValue.status, {
        validators: [Validators.required],
      }),
      pdfUrl: new FormControl(paySlipRawValue.pdfUrl, {
        validators: [Validators.maxLength(500)],
      }),
      generatedAt: new FormControl(paySlipRawValue.generatedAt),
      sentToEmployeeAt: new FormControl(paySlipRawValue.sentToEmployeeAt),
      bankTransferRef: new FormControl(paySlipRawValue.bankTransferRef, {
        validators: [Validators.maxLength(100)],
      }),
      employee: new FormControl(paySlipRawValue.employee, {
        validators: [Validators.required],
      }),
      payrollPeriod: new FormControl(paySlipRawValue.payrollPeriod, {
        validators: [Validators.required],
      }),
      contract: new FormControl(paySlipRawValue.contract, {
        validators: [Validators.required],
      }),
    });
  }

  getPaySlip(form: PaySlipFormGroup): IPaySlip | NewPaySlip {
    return this.convertPaySlipRawValueToPaySlip(form.getRawValue() as PaySlipFormRawValue | NewPaySlipFormRawValue);
  }

  resetForm(form: PaySlipFormGroup, paySlip: PaySlipFormGroupInput): void {
    const paySlipRawValue = this.convertPaySlipToPaySlipRawValue({ ...this.getFormDefaults(), ...paySlip });
    form.reset(
      {
        ...paySlipRawValue,
        id: { value: paySlipRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): PaySlipFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      generatedAt: currentTime,
      sentToEmployeeAt: currentTime,
    };
  }

  private convertPaySlipRawValueToPaySlip(rawPaySlip: PaySlipFormRawValue | NewPaySlipFormRawValue): IPaySlip | NewPaySlip {
    return {
      ...rawPaySlip,
      generatedAt: dayjs(rawPaySlip.generatedAt, DATE_TIME_FORMAT),
      sentToEmployeeAt: dayjs(rawPaySlip.sentToEmployeeAt, DATE_TIME_FORMAT),
    };
  }

  private convertPaySlipToPaySlipRawValue(
    paySlip: IPaySlip | (Partial<NewPaySlip> & PaySlipFormDefaults),
  ): PaySlipFormRawValue | PartialWithRequiredKeyOf<NewPaySlipFormRawValue> {
    return {
      ...paySlip,
      generatedAt: paySlip.generatedAt ? paySlip.generatedAt.format(DATE_TIME_FORMAT) : undefined,
      sentToEmployeeAt: paySlip.sentToEmployeeAt ? paySlip.sentToEmployeeAt.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
