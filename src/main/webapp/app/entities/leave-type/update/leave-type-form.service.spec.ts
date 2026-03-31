import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../leave-type.test-samples';

import { LeaveTypeFormService } from './leave-type-form.service';

describe('LeaveType Form Service', () => {
  let service: LeaveTypeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeaveTypeFormService);
  });

  describe('Service methods', () => {
    describe('createLeaveTypeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createLeaveTypeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            label: expect.any(Object),
            maxDaysPerYear: expect.any(Object),
            carryOverDays: expect.any(Object),
            paid: expect.any(Object),
            requiresMedical: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });

      it('passing ILeaveType should create a new form with FormGroup', () => {
        const formGroup = service.createLeaveTypeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            label: expect.any(Object),
            maxDaysPerYear: expect.any(Object),
            carryOverDays: expect.any(Object),
            paid: expect.any(Object),
            requiresMedical: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });
    });

    describe('getLeaveType', () => {
      it('should return NewLeaveType for default LeaveType initial value', () => {
        const formGroup = service.createLeaveTypeFormGroup(sampleWithNewData);

        const leaveType = service.getLeaveType(formGroup) as any;

        expect(leaveType).toMatchObject(sampleWithNewData);
      });

      it('should return NewLeaveType for empty LeaveType initial value', () => {
        const formGroup = service.createLeaveTypeFormGroup();

        const leaveType = service.getLeaveType(formGroup) as any;

        expect(leaveType).toMatchObject({});
      });

      it('should return ILeaveType', () => {
        const formGroup = service.createLeaveTypeFormGroup(sampleWithRequiredData);

        const leaveType = service.getLeaveType(formGroup) as any;

        expect(leaveType).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ILeaveType should not enable id FormControl', () => {
        const formGroup = service.createLeaveTypeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewLeaveType should disable id FormControl', () => {
        const formGroup = service.createLeaveTypeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
