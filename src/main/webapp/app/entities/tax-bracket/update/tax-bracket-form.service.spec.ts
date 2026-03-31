import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../tax-bracket.test-samples';

import { TaxBracketFormService } from './tax-bracket-form.service';

describe('TaxBracket Form Service', () => {
  let service: TaxBracketFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaxBracketFormService);
  });

  describe('Service methods', () => {
    describe('createTaxBracketFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTaxBracketFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            year: expect.any(Object),
            minIncome: expect.any(Object),
            maxIncome: expect.any(Object),
            rate: expect.any(Object),
            fixedDeduction: expect.any(Object),
            sortOrder: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });

      it('passing ITaxBracket should create a new form with FormGroup', () => {
        const formGroup = service.createTaxBracketFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            year: expect.any(Object),
            minIncome: expect.any(Object),
            maxIncome: expect.any(Object),
            rate: expect.any(Object),
            fixedDeduction: expect.any(Object),
            sortOrder: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });
    });

    describe('getTaxBracket', () => {
      it('should return NewTaxBracket for default TaxBracket initial value', () => {
        const formGroup = service.createTaxBracketFormGroup(sampleWithNewData);

        const taxBracket = service.getTaxBracket(formGroup) as any;

        expect(taxBracket).toMatchObject(sampleWithNewData);
      });

      it('should return NewTaxBracket for empty TaxBracket initial value', () => {
        const formGroup = service.createTaxBracketFormGroup();

        const taxBracket = service.getTaxBracket(formGroup) as any;

        expect(taxBracket).toMatchObject({});
      });

      it('should return ITaxBracket', () => {
        const formGroup = service.createTaxBracketFormGroup(sampleWithRequiredData);

        const taxBracket = service.getTaxBracket(formGroup) as any;

        expect(taxBracket).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITaxBracket should not enable id FormControl', () => {
        const formGroup = service.createTaxBracketFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTaxBracket should disable id FormControl', () => {
        const formGroup = service.createTaxBracketFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
