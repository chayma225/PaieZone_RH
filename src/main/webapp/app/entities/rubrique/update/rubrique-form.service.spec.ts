import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../rubrique.test-samples';

import { RubriqueFormService } from './rubrique-form.service';

describe('Rubrique Form Service', () => {
  let service: RubriqueFormService;

  beforeEach(() => {
    service = TestBed.inject(RubriqueFormService);
  });

  describe('Service methods', () => {
    describe('createRubriqueFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createRubriqueFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            label: expect.any(Object),
            labelAr: expect.any(Object),
            rubriqueType: expect.any(Object),
            base: expect.any(Object),
            rate: expect.any(Object),
            fixedAmount: expect.any(Object),
            formula: expect.any(Object),
            taxable: expect.any(Object),
            cnssSalary: expect.any(Object),
            cnssEmployer: expect.any(Object),
            sortOrder: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });

      it('passing IRubrique should create a new form with FormGroup', () => {
        const formGroup = service.createRubriqueFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            code: expect.any(Object),
            label: expect.any(Object),
            labelAr: expect.any(Object),
            rubriqueType: expect.any(Object),
            base: expect.any(Object),
            rate: expect.any(Object),
            fixedAmount: expect.any(Object),
            formula: expect.any(Object),
            taxable: expect.any(Object),
            cnssSalary: expect.any(Object),
            cnssEmployer: expect.any(Object),
            sortOrder: expect.any(Object),
            active: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });
    });

    describe('getRubrique', () => {
      it('should return NewRubrique for default Rubrique initial value', () => {
        const formGroup = service.createRubriqueFormGroup(sampleWithNewData);

        const rubrique = service.getRubrique(formGroup);

        expect(rubrique).toMatchObject(sampleWithNewData);
      });

      it('should return NewRubrique for empty Rubrique initial value', () => {
        const formGroup = service.createRubriqueFormGroup();

        const rubrique = service.getRubrique(formGroup);

        expect(rubrique).toMatchObject({});
      });

      it('should return IRubrique', () => {
        const formGroup = service.createRubriqueFormGroup(sampleWithRequiredData);

        const rubrique = service.getRubrique(formGroup);

        expect(rubrique).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IRubrique should not enable id FormControl', () => {
        const formGroup = service.createRubriqueFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewRubrique should disable id FormControl', () => {
        const formGroup = service.createRubriqueFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
