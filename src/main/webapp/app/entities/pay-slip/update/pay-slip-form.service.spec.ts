import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../pay-slip.test-samples';

import { PaySlipFormService } from './pay-slip-form.service';

describe('PaySlip Form Service', () => {
  let service: PaySlipFormService;

  beforeEach(() => {
    service = TestBed.inject(PaySlipFormService);
  });

  describe('Service methods', () => {
    describe('createPaySlipFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPaySlipFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            month: expect.any(Object),
            year: expect.any(Object),
            baseSalary: expect.any(Object),
            totalGains: expect.any(Object),
            totalDeductions: expect.any(Object),
            grossSalary: expect.any(Object),
            cnssSalaryAmount: expect.any(Object),
            cavisAmount: expect.any(Object),
            taxableIncome: expect.any(Object),
            irppAmount: expect.any(Object),
            netSalary: expect.any(Object),
            employerCnss: expect.any(Object),
            employerCavis: expect.any(Object),
            totalEmployerCost: expect.any(Object),
            workedDays: expect.any(Object),
            paidLeaveDays: expect.any(Object),
            unpaidDays: expect.any(Object),
            overtimeHours: expect.any(Object),
            status: expect.any(Object),
            pdfUrl: expect.any(Object),
            generatedAt: expect.any(Object),
            sentToEmployeeAt: expect.any(Object),
            bankTransferRef: expect.any(Object),
            employee: expect.any(Object),
            payrollPeriod: expect.any(Object),
            contract: expect.any(Object),
          }),
        );
      });

      it('passing IPaySlip should create a new form with FormGroup', () => {
        const formGroup = service.createPaySlipFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            month: expect.any(Object),
            year: expect.any(Object),
            baseSalary: expect.any(Object),
            totalGains: expect.any(Object),
            totalDeductions: expect.any(Object),
            grossSalary: expect.any(Object),
            cnssSalaryAmount: expect.any(Object),
            cavisAmount: expect.any(Object),
            taxableIncome: expect.any(Object),
            irppAmount: expect.any(Object),
            netSalary: expect.any(Object),
            employerCnss: expect.any(Object),
            employerCavis: expect.any(Object),
            totalEmployerCost: expect.any(Object),
            workedDays: expect.any(Object),
            paidLeaveDays: expect.any(Object),
            unpaidDays: expect.any(Object),
            overtimeHours: expect.any(Object),
            status: expect.any(Object),
            pdfUrl: expect.any(Object),
            generatedAt: expect.any(Object),
            sentToEmployeeAt: expect.any(Object),
            bankTransferRef: expect.any(Object),
            employee: expect.any(Object),
            payrollPeriod: expect.any(Object),
            contract: expect.any(Object),
          }),
        );
      });
    });

    describe('getPaySlip', () => {
      it('should return NewPaySlip for default PaySlip initial value', () => {
        const formGroup = service.createPaySlipFormGroup(sampleWithNewData);

        const paySlip = service.getPaySlip(formGroup);

        expect(paySlip).toMatchObject(sampleWithNewData);
      });

      it('should return NewPaySlip for empty PaySlip initial value', () => {
        const formGroup = service.createPaySlipFormGroup();

        const paySlip = service.getPaySlip(formGroup);

        expect(paySlip).toMatchObject({});
      });

      it('should return IPaySlip', () => {
        const formGroup = service.createPaySlipFormGroup(sampleWithRequiredData);

        const paySlip = service.getPaySlip(formGroup);

        expect(paySlip).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPaySlip should not enable id FormControl', () => {
        const formGroup = service.createPaySlipFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPaySlip should disable id FormControl', () => {
        const formGroup = service.createPaySlipFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
