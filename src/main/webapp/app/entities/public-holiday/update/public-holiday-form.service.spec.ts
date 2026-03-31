import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../public-holiday.test-samples';

import { PublicHolidayFormService } from './public-holiday-form.service';

describe('PublicHoliday Form Service', () => {
  let service: PublicHolidayFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicHolidayFormService);
  });

  describe('Service methods', () => {
    describe('createPublicHolidayFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createPublicHolidayFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            nameAr: expect.any(Object),
            holidayDate: expect.any(Object),
            year: expect.any(Object),
            isRecurring: expect.any(Object),
            active: expect.any(Object),
          }),
        );
      });

      it('passing IPublicHoliday should create a new form with FormGroup', () => {
        const formGroup = service.createPublicHolidayFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            name: expect.any(Object),
            nameAr: expect.any(Object),
            holidayDate: expect.any(Object),
            year: expect.any(Object),
            isRecurring: expect.any(Object),
            active: expect.any(Object),
          }),
        );
      });
    });

    describe('getPublicHoliday', () => {
      it('should return NewPublicHoliday for default PublicHoliday initial value', () => {
        const formGroup = service.createPublicHolidayFormGroup(sampleWithNewData);

        const publicHoliday = service.getPublicHoliday(formGroup) as any;

        expect(publicHoliday).toMatchObject(sampleWithNewData);
      });

      it('should return NewPublicHoliday for empty PublicHoliday initial value', () => {
        const formGroup = service.createPublicHolidayFormGroup();

        const publicHoliday = service.getPublicHoliday(formGroup) as any;

        expect(publicHoliday).toMatchObject({});
      });

      it('should return IPublicHoliday', () => {
        const formGroup = service.createPublicHolidayFormGroup(sampleWithRequiredData);

        const publicHoliday = service.getPublicHoliday(formGroup) as any;

        expect(publicHoliday).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IPublicHoliday should not enable id FormControl', () => {
        const formGroup = service.createPublicHolidayFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewPublicHoliday should disable id FormControl', () => {
        const formGroup = service.createPublicHolidayFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
