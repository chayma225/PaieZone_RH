import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../regulatory-param.test-samples';

import { RegulatoryParamFormService } from './regulatory-param-form.service';

describe('RegulatoryParam Form Service', () => {
  let service: RegulatoryParamFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegulatoryParamFormService);
  });

  describe('Service methods', () => {
    describe('createRegulatoryParamFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createRegulatoryParamFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            paramKey: expect.any(Object),
            paramLabel: expect.any(Object),
            numericValue: expect.any(Object),
            textValue: expect.any(Object),
            effectiveFrom: expect.any(Object),
            effectiveTo: expect.any(Object),
            legalReference: expect.any(Object),
            active: expect.any(Object),
          }),
        );
      });

      it('passing IRegulatoryParam should create a new form with FormGroup', () => {
        const formGroup = service.createRegulatoryParamFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            paramKey: expect.any(Object),
            paramLabel: expect.any(Object),
            numericValue: expect.any(Object),
            textValue: expect.any(Object),
            effectiveFrom: expect.any(Object),
            effectiveTo: expect.any(Object),
            legalReference: expect.any(Object),
            active: expect.any(Object),
          }),
        );
      });
    });

    describe('getRegulatoryParam', () => {
      it('should return NewRegulatoryParam for default RegulatoryParam initial value', () => {
        const formGroup = service.createRegulatoryParamFormGroup(sampleWithNewData);

        const regulatoryParam = service.getRegulatoryParam(formGroup) as any;

        expect(regulatoryParam).toMatchObject(sampleWithNewData);
      });

      it('should return NewRegulatoryParam for empty RegulatoryParam initial value', () => {
        const formGroup = service.createRegulatoryParamFormGroup();

        const regulatoryParam = service.getRegulatoryParam(formGroup) as any;

        expect(regulatoryParam).toMatchObject({});
      });

      it('should return IRegulatoryParam', () => {
        const formGroup = service.createRegulatoryParamFormGroup(sampleWithRequiredData);

        const regulatoryParam = service.getRegulatoryParam(formGroup) as any;

        expect(regulatoryParam).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IRegulatoryParam should not enable id FormControl', () => {
        const formGroup = service.createRegulatoryParamFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewRegulatoryParam should disable id FormControl', () => {
        const formGroup = service.createRegulatoryParamFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
