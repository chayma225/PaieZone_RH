import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../job-position.test-samples';

import { JobPositionFormService } from './job-position-form.service';

describe('JobPosition Form Service', () => {
  let service: JobPositionFormService;

  beforeEach(() => {
    service = TestBed.inject(JobPositionFormService);
  });

  describe('Service methods', () => {
    describe('createJobPositionFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createJobPositionFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            minSalary: expect.any(Object),
            maxSalary: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
            department: expect.any(Object),
          }),
        );
      });

      it('passing IJobPosition should create a new form with FormGroup', () => {
        const formGroup = service.createJobPositionFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            minSalary: expect.any(Object),
            maxSalary: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
            department: expect.any(Object),
          }),
        );
      });
    });

    describe('getJobPosition', () => {
      it('should return NewJobPosition for default JobPosition initial value', () => {
        const formGroup = service.createJobPositionFormGroup(sampleWithNewData);

        const jobPosition = service.getJobPosition(formGroup);

        expect(jobPosition).toMatchObject(sampleWithNewData);
      });

      it('should return NewJobPosition for empty JobPosition initial value', () => {
        const formGroup = service.createJobPositionFormGroup();

        const jobPosition = service.getJobPosition(formGroup);

        expect(jobPosition).toMatchObject({});
      });

      it('should return IJobPosition', () => {
        const formGroup = service.createJobPositionFormGroup(sampleWithRequiredData);

        const jobPosition = service.getJobPosition(formGroup);

        expect(jobPosition).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IJobPosition should not enable id FormControl', () => {
        const formGroup = service.createJobPositionFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewJobPosition should disable id FormControl', () => {
        const formGroup = service.createJobPositionFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
