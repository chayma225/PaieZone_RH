import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../advance.test-samples';

import { AdvanceFormService } from './advance-form.service';

describe('Advance Form Service', () => {
  let service: AdvanceFormService;

  beforeEach(() => {
    service = TestBed.inject(AdvanceFormService);
  });

  describe('Service methods', () => {
    describe('createAdvanceFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAdvanceFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            requestDate: expect.any(Object),
            amount: expect.any(Object),
            deductionMonth: expect.any(Object),
            deductionYear: expect.any(Object),
            status: expect.any(Object),
            approvedBy: expect.any(Object),
            notes: expect.any(Object),
            employee: expect.any(Object),
            paySlip: expect.any(Object),
            approvedByUser: expect.any(Object),
          }),
        );
      });

      it('passing IAdvance should create a new form with FormGroup', () => {
        const formGroup = service.createAdvanceFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            requestDate: expect.any(Object),
            amount: expect.any(Object),
            deductionMonth: expect.any(Object),
            deductionYear: expect.any(Object),
            status: expect.any(Object),
            approvedBy: expect.any(Object),
            notes: expect.any(Object),
            employee: expect.any(Object),
            paySlip: expect.any(Object),
            approvedByUser: expect.any(Object),
          }),
        );
      });
    });

    describe('getAdvance', () => {
      it('should return NewAdvance for default Advance initial value', () => {
        const formGroup = service.createAdvanceFormGroup(sampleWithNewData);

        const advance = service.getAdvance(formGroup);

        expect(advance).toMatchObject(sampleWithNewData);
      });

      it('should return NewAdvance for empty Advance initial value', () => {
        const formGroup = service.createAdvanceFormGroup();

        const advance = service.getAdvance(formGroup);

        expect(advance).toMatchObject({});
      });

      it('should return IAdvance', () => {
        const formGroup = service.createAdvanceFormGroup(sampleWithRequiredData);

        const advance = service.getAdvance(formGroup);

        expect(advance).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAdvance should not enable id FormControl', () => {
        const formGroup = service.createAdvanceFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAdvance should disable id FormControl', () => {
        const formGroup = service.createAdvanceFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
