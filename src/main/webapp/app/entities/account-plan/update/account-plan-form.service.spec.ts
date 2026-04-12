import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../account-plan.test-samples';

import { AccountPlanFormService } from './account-plan-form.service';

describe('AccountPlan Form Service', () => {
  let service: AccountPlanFormService;

  beforeEach(() => {
    service = TestBed.inject(AccountPlanFormService);
  });

  describe('Service methods', () => {
    describe('createAccountPlanFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createAccountPlanFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            accountCode: expect.any(Object),
            accountLabel: expect.any(Object),
            accountLabelAr: expect.any(Object),
            accountType: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });

      it('passing IAccountPlan should create a new form with FormGroup', () => {
        const formGroup = service.createAccountPlanFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            accountCode: expect.any(Object),
            accountLabel: expect.any(Object),
            accountLabelAr: expect.any(Object),
            accountType: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });
    });

    describe('getAccountPlan', () => {
      it('should return NewAccountPlan for default AccountPlan initial value', () => {
        const formGroup = service.createAccountPlanFormGroup(sampleWithNewData);

        const accountPlan = service.getAccountPlan(formGroup);

        expect(accountPlan).toMatchObject(sampleWithNewData);
      });

      it('should return NewAccountPlan for empty AccountPlan initial value', () => {
        const formGroup = service.createAccountPlanFormGroup();

        const accountPlan = service.getAccountPlan(formGroup);

        expect(accountPlan).toMatchObject({});
      });

      it('should return IAccountPlan', () => {
        const formGroup = service.createAccountPlanFormGroup(sampleWithRequiredData);

        const accountPlan = service.getAccountPlan(formGroup);

        expect(accountPlan).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IAccountPlan should not enable id FormControl', () => {
        const formGroup = service.createAccountPlanFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewAccountPlan should disable id FormControl', () => {
        const formGroup = service.createAccountPlanFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
