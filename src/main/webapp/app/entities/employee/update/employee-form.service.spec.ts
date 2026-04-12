import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../employee.test-samples';

import { EmployeeFormService } from './employee-form.service';

describe('Employee Form Service', () => {
  let service: EmployeeFormService;

  beforeEach(() => {
    service = TestBed.inject(EmployeeFormService);
  });

  describe('Service methods', () => {
    describe('createEmployeeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createEmployeeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            matricule: expect.any(Object),
            firstName: expect.any(Object),
            lastName: expect.any(Object),
            firstNameAr: expect.any(Object),
            lastNameAr: expect.any(Object),
            birthDate: expect.any(Object),
            birthPlace: expect.any(Object),
            gender: expect.any(Object),
            maritalStatus: expect.any(Object),
            numberOfChildren: expect.any(Object),
            chefDeFamille: expect.any(Object),
            nationalId: expect.any(Object),
            passportNumber: expect.any(Object),
            nationality: expect.any(Object),
            address: expect.any(Object),
            city: expect.any(Object),
            personalEmail: expect.any(Object),
            professionalEmail: expect.any(Object),
            phoneNumber: expect.any(Object),
            cnssNumber: expect.any(Object),
            category: expect.any(Object),
            photoUrl: expect.any(Object),
            hireDate: expect.any(Object),
            trialEndDate: expect.any(Object),
            active: expect.any(Object),
            notes: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            company: expect.any(Object),
            department: expect.any(Object),
            position: expect.any(Object),
            manager: expect.any(Object),
            userProfile: expect.any(Object),
          }),
        );
      });

      it('passing IEmployee should create a new form with FormGroup', () => {
        const formGroup = service.createEmployeeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            matricule: expect.any(Object),
            firstName: expect.any(Object),
            lastName: expect.any(Object),
            firstNameAr: expect.any(Object),
            lastNameAr: expect.any(Object),
            birthDate: expect.any(Object),
            birthPlace: expect.any(Object),
            gender: expect.any(Object),
            maritalStatus: expect.any(Object),
            numberOfChildren: expect.any(Object),
            chefDeFamille: expect.any(Object),
            nationalId: expect.any(Object),
            passportNumber: expect.any(Object),
            nationality: expect.any(Object),
            address: expect.any(Object),
            city: expect.any(Object),
            personalEmail: expect.any(Object),
            professionalEmail: expect.any(Object),
            phoneNumber: expect.any(Object),
            cnssNumber: expect.any(Object),
            category: expect.any(Object),
            photoUrl: expect.any(Object),
            hireDate: expect.any(Object),
            trialEndDate: expect.any(Object),
            active: expect.any(Object),
            notes: expect.any(Object),
            createdAt: expect.any(Object),
            updatedAt: expect.any(Object),
            company: expect.any(Object),
            department: expect.any(Object),
            position: expect.any(Object),
            manager: expect.any(Object),
            userProfile: expect.any(Object),
          }),
        );
      });
    });

    describe('getEmployee', () => {
      it('should return NewEmployee for default Employee initial value', () => {
        const formGroup = service.createEmployeeFormGroup(sampleWithNewData);

        const employee = service.getEmployee(formGroup);

        expect(employee).toMatchObject(sampleWithNewData);
      });

      it('should return NewEmployee for empty Employee initial value', () => {
        const formGroup = service.createEmployeeFormGroup();

        const employee = service.getEmployee(formGroup);

        expect(employee).toMatchObject({});
      });

      it('should return IEmployee', () => {
        const formGroup = service.createEmployeeFormGroup(sampleWithRequiredData);

        const employee = service.getEmployee(formGroup);

        expect(employee).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IEmployee should not enable id FormControl', () => {
        const formGroup = service.createEmployeeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewEmployee should disable id FormControl', () => {
        const formGroup = service.createEmployeeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
