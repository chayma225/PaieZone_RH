import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../company-subscription.test-samples';

import { CompanySubscriptionFormService } from './company-subscription-form.service';

describe('CompanySubscription Form Service', () => {
  let service: CompanySubscriptionFormService;

  beforeEach(() => {
    service = TestBed.inject(CompanySubscriptionFormService);
  });

  describe('Service methods', () => {
    describe('createCompanySubscriptionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createCompanySubscriptionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            plan: expect.any(Object),
            status: expect.any(Object),
            maxEmployees: expect.any(Object),
            priceHT: expect.any(Object),
            billingDay: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            renewalDate: expect.any(Object),
            notes: expect.any(Object),
          }),
        );
      });

      it('passing ICompanySubscription should create a new form with FormGroup', () => {
        const formGroup = service.createCompanySubscriptionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            plan: expect.any(Object),
            status: expect.any(Object),
            maxEmployees: expect.any(Object),
            priceHT: expect.any(Object),
            billingDay: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            renewalDate: expect.any(Object),
            notes: expect.any(Object),
          }),
        );
      });
    });

    describe('getCompanySubscription', () => {
      it('should return NewCompanySubscription for default CompanySubscription initial value', () => {
        const formGroup = service.createCompanySubscriptionFormGroup(sampleWithNewData);

        const companySubscription = service.getCompanySubscription(formGroup);

        expect(companySubscription).toMatchObject(sampleWithNewData);
      });

      it('should return NewCompanySubscription for empty CompanySubscription initial value', () => {
        const formGroup = service.createCompanySubscriptionFormGroup();

        const companySubscription = service.getCompanySubscription(formGroup);

        expect(companySubscription).toMatchObject({});
      });

      it('should return ICompanySubscription', () => {
        const formGroup = service.createCompanySubscriptionFormGroup(sampleWithRequiredData);

        const companySubscription = service.getCompanySubscription(formGroup);

        expect(companySubscription).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ICompanySubscription should not enable id FormControl', () => {
        const formGroup = service.createCompanySubscriptionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewCompanySubscription should disable id FormControl', () => {
        const formGroup = service.createCompanySubscriptionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
