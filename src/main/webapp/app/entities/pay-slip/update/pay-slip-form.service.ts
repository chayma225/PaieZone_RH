import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IPaySlip, NewPaySlip } from '../pay-slip.model';

type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

type PaySlipFormGroupInput = IPaySlip | PartialWithRequiredKeyOf<NewPaySlip>;

type FormValueOf<T extends IPaySlip | NewPaySlip> = Omit<T, 'generatedAt' | 'sentToEmployeeAt'> & {
  generatedAt?: string | null;
  sentToEmployeeAt?: string | null;
};

type PaySlipFormRawValue = FormValueOf<IPaySlip>;
type NewPaySlipFormRawValue = FormValueOf<NewPaySlip>;

type PaySlipFormDefaults = Pick<NewPaySlip, 'id' | 'generatedAt' | 'sentToEmployeeAt'>;

type PaySlipFormGroupContent = {
  id: FormControl<PaySlipFormRawValue['id']>;
  month: FormControl<PaySlipFormRawValue['month']>;
  year: FormControl<PaySlipFormRawValue['year']>;
  baseSalary: FormControl<PaySlipFormRawValue['baseSalary']>;
  totalGains: FormControl<PaySlipFormRawValue['totalGains']>;
  totalDeductions: FormControl<PaySlipFormRawValue['totalDeductions']>;
  grossSalary: FormControl<PaySlipFormRawValue['grossSalary']>;
  cnssSalaryAmount: FormControl<PaySlipFormRawValue['cnssSalaryAmount']>;
  cavisAmount: FormControl<PaySlipFormRawValue['cavisAmount']>;
  cssAmount: FormControl<PaySlipFormRawValue['cssAmount']>;
  taxableIncome: FormControl<PaySlipFormRawValue['taxableIncome']>;
  irppAmount: FormControl<PaySlipFormRawValue['irppAmount']>;
  netSalary: FormControl<PaySlipFormRawValue['netSalary']>;
  employerCnss: FormControl<PaySlipFormRawValue['employerCnss']>;
  employerCavis: FormControl<PaySlipFormRawValue['employerCavis']>;
  tfpAmount: FormControl<PaySlipFormRawValue['tfpAmount']>;
  totalEmployerCost: FormControl<PaySlipFormRawValue['totalEmployerCost']>;
  bonusTotal: FormControl<PaySlipFormRawValue['bonusTotal']>;
  advanceDeduction: FormControl<PaySlipFormRawValue['advanceDeduction']>;
  unpaidLeaveDeduction: FormControl<PaySlipFormRawValue['unpaidLeaveDeduction']>;
  overtimeAmount: FormControl<PaySlipFormRawValue['overtimeAmount']>;
  workedDays: FormControl<PaySlipFormRawValue['workedDays']>;
  paidLeaveDays: FormControl<PaySlipFormRawValue['paidLeaveDays']>;
  unpaidDays: FormControl<PaySlipFormRawValue['unpaidDays']>;
  overtimeHours: FormControl<PaySlipFormRawValue['overtimeHours']>;
  status: FormControl<PaySlipFormRawValue['status']>;
  pdfUrl: FormControl<PaySlipFormRawValue['pdfUrl']>;
  generatedAt: FormControl<string | null>;
  sentToEmployeeAt: FormControl<string | null>;
  bankTransferRef: FormControl<PaySlipFormRawValue['bankTransferRef']>;
  employee: FormControl<any>;
  payrollPeriod: FormControl<any>;
  contract: FormControl<any>;
};

export type PaySlipFormGroup = FormGroup<PaySlipFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PaySlipFormService {

  createPaySlipFormGroup(paySlip?: PaySlipFormGroupInput): PaySlipFormGroup {
    const defaults = this.getFormDefaults();
    const paySlipRawValue = this.convertPaySlipToPaySlipRawValue({
      ...defaults,
      ...(paySlip ?? { id: null }),
    });

    return new FormGroup<PaySlipFormGroupContent>({
      id: new FormControl({ value: paySlipRawValue.id, disabled: true }, { nonNullable: true }),
      month: new FormControl(paySlipRawValue.month, [Validators.required, Validators.min(1), Validators.max(12)]),
      year: new FormControl(paySlipRawValue.year, [Validators.required]),
      baseSalary: new FormControl(paySlipRawValue.baseSalary, [Validators.required]),
      totalGains: new FormControl(paySlipRawValue.totalGains, [Validators.required]),
      totalDeductions: new FormControl(paySlipRawValue.totalDeductions, [Validators.required]),
      grossSalary: new FormControl(paySlipRawValue.grossSalary, [Validators.required]),
      cnssSalaryAmount: new FormControl(paySlipRawValue.cnssSalaryAmount, [Validators.required]),
      cavisAmount: new FormControl(paySlipRawValue.cavisAmount),
      cssAmount: new FormControl(paySlipRawValue.cssAmount),
      taxableIncome: new FormControl(paySlipRawValue.taxableIncome, [Validators.required]),
      irppAmount: new FormControl(paySlipRawValue.irppAmount, [Validators.required]),
      netSalary: new FormControl(paySlipRawValue.netSalary, [Validators.required]),
      employerCnss: new FormControl(paySlipRawValue.employerCnss, [Validators.required]),
      employerCavis: new FormControl(paySlipRawValue.employerCavis),
      tfpAmount: new FormControl(paySlipRawValue.tfpAmount),
      totalEmployerCost: new FormControl(paySlipRawValue.totalEmployerCost, [Validators.required]),
      bonusTotal: new FormControl(paySlipRawValue.bonusTotal),
      advanceDeduction: new FormControl(paySlipRawValue.advanceDeduction),
      unpaidLeaveDeduction: new FormControl(paySlipRawValue.unpaidLeaveDeduction),
      overtimeAmount: new FormControl(paySlipRawValue.overtimeAmount),
      workedDays: new FormControl(paySlipRawValue.workedDays),
      paidLeaveDays: new FormControl(paySlipRawValue.paidLeaveDays),
      unpaidDays: new FormControl(paySlipRawValue.unpaidDays),
      overtimeHours: new FormControl(paySlipRawValue.overtimeHours),
      status: new FormControl(paySlipRawValue.status, [Validators.required]),
      pdfUrl: new FormControl(paySlipRawValue.pdfUrl, [Validators.maxLength(500)]),
      generatedAt: new FormControl(paySlipRawValue.generatedAt),
      sentToEmployeeAt: new FormControl(paySlipRawValue.sentToEmployeeAt),
      bankTransferRef: new FormControl(paySlipRawValue.bankTransferRef, [Validators.maxLength(100)]),
      employee: new FormControl(paySlipRawValue.employee, [Validators.required]),
      payrollPeriod: new FormControl(paySlipRawValue.payrollPeriod, [Validators.required]),
      contract: new FormControl(paySlipRawValue.contract, [Validators.required]),
    });
  }

  getPaySlip(form: PaySlipFormGroup): IPaySlip | NewPaySlip {
    return this.convertPaySlipRawValueToPaySlip(form.getRawValue() as any);
  }

  resetForm(form: PaySlipFormGroup, paySlip: PaySlipFormGroupInput): void {
    const paySlipRawValue = this.convertPaySlipToPaySlipRawValue({ ...this.getFormDefaults(), ...paySlip });
    form.reset(paySlipRawValue);
  }

  private getFormDefaults(): PaySlipFormDefaults {
    return {
      id: null,
      generatedAt: null,
      sentToEmployeeAt: null,
    };
  }

  private convertPaySlipRawValueToPaySlip(raw: any): IPaySlip | NewPaySlip {
    return {
      ...raw,
      generatedAt: raw.generatedAt ? dayjs(raw.generatedAt, DATE_TIME_FORMAT) : undefined,
      sentToEmployeeAt: raw.sentToEmployeeAt ? dayjs(raw.sentToEmployeeAt, DATE_TIME_FORMAT) : undefined,
    };
  }

  private convertPaySlipToPaySlipRawValue(paySlip: any): any {
    return {
      ...paySlip,
      generatedAt: paySlip.generatedAt ? dayjs(paySlip.generatedAt).format(DATE_TIME_FORMAT) : null,
      sentToEmployeeAt: paySlip.sentToEmployeeAt ? dayjs(paySlip.sentToEmployeeAt).format(DATE_TIME_FORMAT) : null,
    };
  }
}
