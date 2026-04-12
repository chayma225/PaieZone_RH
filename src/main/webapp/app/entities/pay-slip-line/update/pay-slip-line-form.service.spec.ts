import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../pay-slip-line.test-samples';

import { PaySlipLineFormService } from './pay-slip-line-form.service';

describe('PaySlipLine Form Service', () => {
  let service: PaySlipLineFormService;

  beforeEach(() => {
    service = TestBed.inject(PaySlipLineFormService);
  });

  describe('Service methods', () => {
    describe('createPaySlipLineFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPaySlipLineFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            sortOrder: expect.any(Object),
            rubriqueCode: expect.any(Object),
            rubriqueLabel: expect.any(Object),
            rubriqueType: expect.any(Object),
            base: expect.any(Object),
            rate: expect.any(Object),
            amount: expect.any(Object),
            taxable: expect.any(Object),
            paySlip: expect.any(Object),
            rubrique: expect.any(Object),
          }),
        );
      });

      it('passing IPaySlipLine should create a new form with FormGroup', () => {
        const formGroup = service.createPaySlipLineFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            sortOrder: expect.any(Object),
            rubriqueCode: expect.any(Object),
            rubriqueLabel: expect.any(Object),
            rubriqueType: expect.any(Object),
            base: expect.any(Object),
            rate: expect.any(Object),
            amount: expect.any(Object),
            taxable: expect.any(Object),
            paySlip: expect.any(Object),
            rubrique: expect.any(Object),
          }),
        );
      });
    });

    describe('getPaySlipLine', () => {
      it('should return NewPaySlipLine for default PaySlipLine initial value', () => {
        const formGroup = service.createPaySlipLineFormGroup(sampleWithNewData);

        const paySlipLine = service.getPaySlipLine(formGroup);

        expect(paySlipLine).toMatchObject(sampleWithNewData);
      });

      it('should return NewPaySlipLine for empty PaySlipLine initial value', () => {
        const formGroup = service.createPaySlipLineFormGroup();

        const paySlipLine = service.getPaySlipLine(formGroup);

        expect(paySlipLine).toMatchObject({});
      });

      it('should return IPaySlipLine', () => {
        const formGroup = service.createPaySlipLineFormGroup(sampleWithRequiredData);

        const paySlipLine = service.getPaySlipLine(formGroup);

        expect(paySlipLine).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPaySlipLine should not enable id FormControl', () => {
        const formGroup = service.createPaySlipLineFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPaySlipLine should disable id FormControl', () => {
        const formGroup = service.createPaySlipLineFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
