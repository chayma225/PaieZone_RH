import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../payroll-period.test-samples';

import { PayrollPeriodFormService } from './payroll-period-form.service';

describe('PayrollPeriod Form Service', () => {
  let service: PayrollPeriodFormService;

  beforeEach(() => {
    service = TestBed.inject(PayrollPeriodFormService);
  });

  describe('Service methods', () => {
    describe('createPayrollPeriodFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPayrollPeriodFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            month: expect.any(Object),
            year: expect.any(Object),
            status: expect.any(Object),
            calculatedAt: expect.any(Object),
            validatedAt: expect.any(Object),
            lockedAt: expect.any(Object),
            notes: expect.any(Object),
            company: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });

      it('passing IPayrollPeriod should create a new form with FormGroup', () => {
        const formGroup = service.createPayrollPeriodFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            month: expect.any(Object),
            year: expect.any(Object),
            status: expect.any(Object),
            calculatedAt: expect.any(Object),
            validatedAt: expect.any(Object),
            lockedAt: expect.any(Object),
            notes: expect.any(Object),
            company: expect.any(Object),
            createdBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getPayrollPeriod', () => {
      it('should return NewPayrollPeriod for default PayrollPeriod initial value', () => {
        const formGroup = service.createPayrollPeriodFormGroup(sampleWithNewData);

        const payrollPeriod = service.getPayrollPeriod(formGroup);

        expect(payrollPeriod).toMatchObject(sampleWithNewData);
      });

      it('should return NewPayrollPeriod for empty PayrollPeriod initial value', () => {
        const formGroup = service.createPayrollPeriodFormGroup();

        const payrollPeriod = service.getPayrollPeriod(formGroup);

        expect(payrollPeriod).toMatchObject({});
      });

      it('should return IPayrollPeriod', () => {
        const formGroup = service.createPayrollPeriodFormGroup(sampleWithRequiredData);

        const payrollPeriod = service.getPayrollPeriod(formGroup);

        expect(payrollPeriod).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPayrollPeriod should not enable id FormControl', () => {
        const formGroup = service.createPayrollPeriodFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPayrollPeriod should disable id FormControl', () => {
        const formGroup = service.createPayrollPeriodFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
