import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../official-document.test-samples';

import { OfficialDocumentFormService } from './official-document-form.service';

describe('OfficialDocument Form Service', () => {
  let service: OfficialDocumentFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficialDocumentFormService);
  });

  describe('Service methods', () => {
    describe('createOfficialDocumentFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createOfficialDocumentFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            docType: expect.any(Object),
            title: expect.any(Object),
            month: expect.any(Object),
            year: expect.any(Object),
            generatedAt: expect.any(Object),
            fileUrl: expect.any(Object),
            signedBy: expect.any(Object),
            sentAt: expect.any(Object),
            notes: expect.any(Object),
            company: expect.any(Object),
            employee: expect.any(Object),
            generatedBy: expect.any(Object),
          }),
        );
      });

      it('passing IOfficialDocument should create a new form with FormGroup', () => {
        const formGroup = service.createOfficialDocumentFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            docType: expect.any(Object),
            title: expect.any(Object),
            month: expect.any(Object),
            year: expect.any(Object),
            generatedAt: expect.any(Object),
            fileUrl: expect.any(Object),
            signedBy: expect.any(Object),
            sentAt: expect.any(Object),
            notes: expect.any(Object),
            company: expect.any(Object),
            employee: expect.any(Object),
            generatedBy: expect.any(Object),
          }),
        );
      });
    });

    describe('getOfficialDocument', () => {
      it('should return NewOfficialDocument for default OfficialDocument initial value', () => {
        const formGroup = service.createOfficialDocumentFormGroup(sampleWithNewData);

        const officialDocument = service.getOfficialDocument(formGroup) as any;

        expect(officialDocument).toMatchObject(sampleWithNewData);
      });

      it('should return NewOfficialDocument for empty OfficialDocument initial value', () => {
        const formGroup = service.createOfficialDocumentFormGroup();

        const officialDocument = service.getOfficialDocument(formGroup) as any;

        expect(officialDocument).toMatchObject({});
      });

      it('should return IOfficialDocument', () => {
        const formGroup = service.createOfficialDocumentFormGroup(sampleWithRequiredData);

        const officialDocument = service.getOfficialDocument(formGroup) as any;

        expect(officialDocument).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IOfficialDocument should not enable id FormControl', () => {
        const formGroup = service.createOfficialDocumentFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewOfficialDocument should disable id FormControl', () => {
        const formGroup = service.createOfficialDocumentFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
