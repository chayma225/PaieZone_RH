import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../hr-document.test-samples';

import { HrDocumentFormService } from './hr-document-form.service';

describe('HrDocument Form Service', () => {
  let service: HrDocumentFormService;

  beforeEach(() => {
    service = TestBed.inject(HrDocumentFormService);
  });

  describe('Service methods', () => {
    describe('createHrDocumentFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createHrDocumentFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            documentType: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            fileUrl: expect.any(Object),
            fileSize: expect.any(Object),
            mimeType: expect.any(Object),
            uploadedAt: expect.any(Object),
            expiryDate: expect.any(Object),
            active: expect.any(Object),
            employee: expect.any(Object),
            uploadedBy: expect.any(Object),
          }),
        );
      });

      it('passing IHrDocument should create a new form with FormGroup', () => {
        const formGroup = service.createHrDocumentFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            documentType: expect.any(Object),
            title: expect.any(Object),
            description: expect.any(Object),
            fileUrl: expect.any(Object),
            fileSize: expect.any(Object),
            mimeType: expect.any(Object),
            uploadedAt: expect.any(Object),
            expiryDate: expect.any(Object),
            active: expect.any(Object),
            employee: expect.any(Object),
            uploadedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getHrDocument', () => {
      it('should return NewHrDocument for default HrDocument initial value', () => {
        const formGroup = service.createHrDocumentFormGroup(sampleWithNewData);

        const hrDocument = service.getHrDocument(formGroup);

        expect(hrDocument).toMatchObject(sampleWithNewData);
      });

      it('should return NewHrDocument for empty HrDocument initial value', () => {
        const formGroup = service.createHrDocumentFormGroup();

        const hrDocument = service.getHrDocument(formGroup);

        expect(hrDocument).toMatchObject({});
      });

      it('should return IHrDocument', () => {
        const formGroup = service.createHrDocumentFormGroup(sampleWithRequiredData);

        const hrDocument = service.getHrDocument(formGroup);

        expect(hrDocument).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IHrDocument should not enable id FormControl', () => {
        const formGroup = service.createHrDocumentFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewHrDocument should disable id FormControl', () => {
        const formGroup = service.createHrDocumentFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
