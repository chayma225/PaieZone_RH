import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../company.test-samples';

import { CompanyFormService } from './company-form.service';

describe('Company Form Service', () => {
  let service: CompanyFormService;

  beforeEach(() => {
    service = TestBed.inject(CompanyFormService);
  });

  describe('Service methods', () => {
    describe('createCompanyFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createCompanyFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            tradeName: expect.any(Object),
            taxId: expect.any(Object),
            cnssId: expect.any(Object),
            address: expect.any(Object),
            city: expect.any(Object),
            postalCode: expect.any(Object),
            phone: expect.any(Object),
            email: expect.any(Object),
            logoUrl: expect.any(Object),
            tenantSchema: expect.any(Object),
            active: expect.any(Object),
            trialEnd: expect.any(Object),
            createdAt: expect.any(Object),
            companySubscription: expect.any(Object),
          }),
        );
      });

      it('passing ICompany should create a new form with FormGroup', () => {
        const formGroup = service.createCompanyFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            tradeName: expect.any(Object),
            taxId: expect.any(Object),
            cnssId: expect.any(Object),
            address: expect.any(Object),
            city: expect.any(Object),
            postalCode: expect.any(Object),
            phone: expect.any(Object),
            email: expect.any(Object),
            logoUrl: expect.any(Object),
            tenantSchema: expect.any(Object),
            active: expect.any(Object),
            trialEnd: expect.any(Object),
            createdAt: expect.any(Object),
            companySubscription: expect.any(Object),
          }),
        );
      });
    });

    describe('getCompany', () => {
      it('should return NewCompany for default Company initial value', () => {
        const formGroup = service.createCompanyFormGroup(sampleWithNewData);

        const company = service.getCompany(formGroup);

        expect(company).toMatchObject(sampleWithNewData);
      });

      it('should return NewCompany for empty Company initial value', () => {
        const formGroup = service.createCompanyFormGroup();

        const company = service.getCompany(formGroup);

        expect(company).toMatchObject({});
      });

      it('should return ICompany', () => {
        const formGroup = service.createCompanyFormGroup(sampleWithRequiredData);

        const company = service.getCompany(formGroup);

        expect(company).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ICompany should not enable id FormControl', () => {
        const formGroup = service.createCompanyFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewCompany should disable id FormControl', () => {
        const formGroup = service.createCompanyFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
