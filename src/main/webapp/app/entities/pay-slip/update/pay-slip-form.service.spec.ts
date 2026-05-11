
import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IPaySlip, NewPaySlip } from '../pay-slip.model';

export type PaySlipFormGroup = FormGroup<{
  id:                   FormControl<IPaySlip['id'] | NewPaySlip['id']>;
  month:                FormControl<IPaySlip['month']>;
  year:                 FormControl<IPaySlip['year']>;
  baseSalary:           FormControl<IPaySlip['baseSalary']>;
  totalGains:           FormControl<IPaySlip['totalGains']>;
  totalDeductions:      FormControl<IPaySlip['totalDeductions']>;
  grossSalary:          FormControl<IPaySlip['grossSalary']>;
  cnssSalaryAmount:     FormControl<IPaySlip['cnssSalaryAmount']>;
  cavisAmount:          FormControl<IPaySlip['cavisAmount']>;
  cssAmount:            FormControl<IPaySlip['cssAmount']>;
  taxableIncome:        FormControl<IPaySlip['taxableIncome']>;
  irppAmount:           FormControl<IPaySlip['irppAmount']>;
  netSalary:            FormControl<IPaySlip['netSalary']>;
  employerCnss:         FormControl<IPaySlip['employerCnss']>;
  employerCavis:        FormControl<IPaySlip['employerCavis']>;
  tfpAmount:            FormControl<IPaySlip['tfpAmount']>;
  totalEmployerCost:    FormControl<IPaySlip['totalEmployerCost']>;
  bonusTotal:           FormControl<IPaySlip['bonusTotal']>;
  advanceDeduction:     FormControl<IPaySlip['advanceDeduction']>;
  unpaidLeaveDeduction: FormControl<IPaySlip['unpaidLeaveDeduction']>;
  overtimeAmount:       FormControl<IPaySlip['overtimeAmount']>;
  workedDays:           FormControl<IPaySlip['workedDays']>;
  paidLeaveDays:        FormControl<IPaySlip['paidLeaveDays']>;
  unpaidDays:           FormControl<IPaySlip['unpaidDays']>;
  overtimeHours:        FormControl<IPaySlip['overtimeHours']>;
  status:               FormControl<IPaySlip['status']>;
  pdfUrl:               FormControl<IPaySlip['pdfUrl']>;
  generatedAt:          FormControl<IPaySlip['generatedAt']>;
  sentToEmployeeAt:     FormControl<IPaySlip['sentToEmployeeAt']>;
  bankTransferRef:      FormControl<IPaySlip['bankTransferRef']>;
  employee:             FormControl<any>;
  payrollPeriod:        FormControl<any>;
  contract:             FormControl<any>;
}>;

@Injectable({ providedIn: 'root' })
export class PaySlipFormService {

  createPaySlipFormGroup(paySlip: IPaySlip | NewPaySlip = { id: null }): PaySlipFormGroup {
    const raw = paySlip as any;
    return new FormGroup({
      id: new FormControl(
        { value: raw.id, disabled: raw.id !== null },
        { nonNullable: true }
      ),
      month:                new FormControl(raw.month,         [Validators.required, Validators.min(1), Validators.max(12)]),
      year:                 new FormControl(raw.year,          [Validators.required]),
      baseSalary:           new FormControl(raw.baseSalary,    [Validators.required]),
      totalGains:           new FormControl(raw.totalGains,    [Validators.required]),
      totalDeductions:      new FormControl(raw.totalDeductions,[Validators.required]),
      grossSalary:          new FormControl(raw.grossSalary,   [Validators.required]),
      cnssSalaryAmount:     new FormControl(raw.cnssSalaryAmount, [Validators.required]),
      cavisAmount:          new FormControl(raw.cavisAmount    ?? null),
      cssAmount:            new FormControl(raw.cssAmount      ?? null),
      taxableIncome:        new FormControl(raw.taxableIncome, [Validators.required]),
      irppAmount:           new FormControl(raw.irppAmount,    [Validators.required]),
      netSalary:            new FormControl(raw.netSalary,     [Validators.required]),
      employerCnss:         new FormControl(raw.employerCnss,  [Validators.required]),
      employerCavis:        new FormControl(raw.employerCavis  ?? null),
      tfpAmount:            new FormControl(raw.tfpAmount      ?? null),
      totalEmployerCost:    new FormControl(raw.totalEmployerCost, [Validators.required]),
      bonusTotal:           new FormControl(raw.bonusTotal     ?? null),
      advanceDeduction:     new FormControl(raw.advanceDeduction ?? null),
      unpaidLeaveDeduction: new FormControl(raw.unpaidLeaveDeduction ?? null),
      overtimeAmount:       new FormControl(raw.overtimeAmount ?? null),
      workedDays:           new FormControl(raw.workedDays     ?? null),
      paidLeaveDays:        new FormControl(raw.paidLeaveDays  ?? null),
      unpaidDays:           new FormControl(raw.unpaidDays     ?? null),
      overtimeHours:        new FormControl(raw.overtimeHours  ?? null),
      status:               new FormControl(raw.status,        [Validators.required]),
      pdfUrl:               new FormControl(raw.pdfUrl         ?? null,  [Validators.maxLength(500)]),
      generatedAt:          new FormControl(raw.generatedAt    ?? null),
      sentToEmployeeAt:     new FormControl(raw.sentToEmployeeAt ?? null),
      bankTransferRef:      new FormControl(raw.bankTransferRef ?? null, [Validators.maxLength(100)]),
      employee:             new FormControl(raw.employee       ?? null, [Validators.required]),
      payrollPeriod:        new FormControl(raw.payrollPeriod  ?? null, [Validators.required]),
      contract:             new FormControl(raw.contract       ?? null, [Validators.required]),
    }) as PaySlipFormGroup;
  }

  getPaySlip(form: PaySlipFormGroup): IPaySlip | NewPaySlip {
    return form.getRawValue() as IPaySlip | NewPaySlip;
  }

  resetForm(form: PaySlipFormGroup, paySlip: IPaySlip | NewPaySlip): void {
    const raw = paySlip as any;
    form.reset({
      ...raw,
      cssAmount:            raw.cssAmount            ?? null,
      tfpAmount:            raw.tfpAmount            ?? null,
      unpaidLeaveDeduction: raw.unpaidLeaveDeduction ?? null,
      overtimeAmount:       raw.overtimeAmount       ?? null,
    });
  }
}
