import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../employee-history.test-samples';

import { EmployeeHistoryFormService } from './employee-history-form.service';

describe('EmployeeHistory Form Service', () => {
  let service: EmployeeHistoryFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeHistoryFormService);
  });

  describe('Service methods', () => {
    describe('createEmployeeHistoryFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createEmployeeHistoryFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            fieldName: expect.any(Object),
            oldValue: expect.any(Object),
            newValue: expect.any(Object),
            changedAt: expect.any(Object),
            changedBy: expect.any(Object),
            reason: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });

      it('passing IEmployeeHistory should create a new form with FormGroup', () => {
        const formGroup = service.createEmployeeHistoryFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            fieldName: expect.any(Object),
            oldValue: expect.any(Object),
            newValue: expect.any(Object),
            changedAt: expect.any(Object),
            changedBy: expect.any(Object),
            reason: expect.any(Object),
            employee: expect.any(Object),
          }),
        );
      });
    });

    describe('getEmployeeHistory', () => {
      it('should return NewEmployeeHistory for default EmployeeHistory initial value', () => {
        const formGroup = service.createEmployeeHistoryFormGroup(sampleWithNewData);

        const employeeHistory = service.getEmployeeHistory(formGroup) as any;

        expect(employeeHistory).toMatchObject(sampleWithNewData);
      });

      it('should return NewEmployeeHistory for empty EmployeeHistory initial value', () => {
        const formGroup = service.createEmployeeHistoryFormGroup();

        const employeeHistory = service.getEmployeeHistory(formGroup) as any;

        expect(employeeHistory).toMatchObject({});
      });

      it('should return IEmployeeHistory', () => {
        const formGroup = service.createEmployeeHistoryFormGroup(sampleWithRequiredData);

        const employeeHistory = service.getEmployeeHistory(formGroup) as any;

        expect(employeeHistory).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IEmployeeHistory should not enable id FormControl', () => {
        const formGroup = service.createEmployeeHistoryFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewEmployeeHistory should disable id FormControl', () => {
        const formGroup = service.createEmployeeHistoryFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
