import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../cnss-rate.test-samples';

import { CnssRateFormService } from './cnss-rate-form.service';

describe('CnssRate Form Service', () => {
  let service: CnssRateFormService;

  beforeEach(() => {
    service = TestBed.inject(CnssRateFormService);
  });

  describe('Service methods', () => {
    describe('createCnssRateFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createCnssRateFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            year: expect.any(Object),
            salaryCeiling: expect.any(Object),
            employeeRate: expect.any(Object),
            employerRate: expect.any(Object),
            cavisEmployee: expect.any(Object),
            cavisEmployer: expect.any(Object),
            smig: expect.any(Object),
            effectiveFrom: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });

      it('passing ICnssRate should create a new form with FormGroup', () => {
        const formGroup = service.createCnssRateFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            year: expect.any(Object),
            salaryCeiling: expect.any(Object),
            employeeRate: expect.any(Object),
            employerRate: expect.any(Object),
            cavisEmployee: expect.any(Object),
            cavisEmployer: expect.any(Object),
            smig: expect.any(Object),
            effectiveFrom: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });
    });

    describe('getCnssRate', () => {
      it('should return NewCnssRate for default CnssRate initial value', () => {
        const formGroup = service.createCnssRateFormGroup(sampleWithNewData);

        const cnssRate = service.getCnssRate(formGroup);

        expect(cnssRate).toMatchObject(sampleWithNewData);
      });

      it('should return NewCnssRate for empty CnssRate initial value', () => {
        const formGroup = service.createCnssRateFormGroup();

        const cnssRate = service.getCnssRate(formGroup);

        expect(cnssRate).toMatchObject({});
      });

      it('should return ICnssRate', () => {
        const formGroup = service.createCnssRateFormGroup(sampleWithRequiredData);

        const cnssRate = service.getCnssRate(formGroup);

        expect(cnssRate).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ICnssRate should not enable id FormControl', () => {
        const formGroup = service.createCnssRateFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewCnssRate should disable id FormControl', () => {
        const formGroup = service.createCnssRateFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
