import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../leave-request.test-samples';

import { LeaveRequestFormService } from './leave-request-form.service';

describe('LeaveRequest Form Service', () => {
  let service: LeaveRequestFormService;

  beforeEach(() => {
    service = TestBed.inject(LeaveRequestFormService);
  });

  describe('Service methods', () => {
    describe('createLeaveRequestFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createLeaveRequestFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            numberOfDays: expect.any(Object),
            status: expect.any(Object),
            requestedAt: expect.any(Object),
            processedAt: expect.any(Object),
            managerComment: expect.any(Object),
            employeeComment: expect.any(Object),
            documentUrl: expect.any(Object),
            employee: expect.any(Object),
            leaveType: expect.any(Object),
            approvedBy: expect.any(Object),
          }),
        );
      });

      it('passing ILeaveRequest should create a new form with FormGroup', () => {
        const formGroup = service.createLeaveRequestFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            startDate: expect.any(Object),
            endDate: expect.any(Object),
            numberOfDays: expect.any(Object),
            status: expect.any(Object),
            requestedAt: expect.any(Object),
            processedAt: expect.any(Object),
            managerComment: expect.any(Object),
            employeeComment: expect.any(Object),
            documentUrl: expect.any(Object),
            employee: expect.any(Object),
            leaveType: expect.any(Object),
            approvedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getLeaveRequest', () => {
      it('should return NewLeaveRequest for default LeaveRequest initial value', () => {
        const formGroup = service.createLeaveRequestFormGroup(sampleWithNewData);

        const leaveRequest = service.getLeaveRequest(formGroup);

        expect(leaveRequest).toMatchObject(sampleWithNewData);
      });

      it('should return NewLeaveRequest for empty LeaveRequest initial value', () => {
        const formGroup = service.createLeaveRequestFormGroup();

        const leaveRequest = service.getLeaveRequest(formGroup);

        expect(leaveRequest).toMatchObject({});
      });

      it('should return ILeaveRequest', () => {
        const formGroup = service.createLeaveRequestFormGroup(sampleWithRequiredData);

        const leaveRequest = service.getLeaveRequest(formGroup);

        expect(leaveRequest).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ILeaveRequest should not enable id FormControl', () => {
        const formGroup = service.createLeaveRequestFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewLeaveRequest should disable id FormControl', () => {
        const formGroup = service.createLeaveRequestFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
