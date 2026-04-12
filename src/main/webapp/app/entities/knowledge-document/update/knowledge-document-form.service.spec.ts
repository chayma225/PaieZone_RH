import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../knowledge-document.test-samples';

import { KnowledgeDocumentFormService } from './knowledge-document-form.service';

describe('KnowledgeDocument Form Service', () => {
  let service: KnowledgeDocumentFormService;

  beforeEach(() => {
    service = TestBed.inject(KnowledgeDocumentFormService);
  });

  describe('Service methods', () => {
    describe('createKnowledgeDocumentFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            category: expect.any(Object),
            content: expect.any(Object),
            fileUrl: expect.any(Object),
            vectorIndexed: expect.any(Object),
            indexedAt: expect.any(Object),
            active: expect.any(Object),
            createdAt: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });

      it('passing IKnowledgeDocument should create a new form with FormGroup', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            title: expect.any(Object),
            category: expect.any(Object),
            content: expect.any(Object),
            fileUrl: expect.any(Object),
            vectorIndexed: expect.any(Object),
            indexedAt: expect.any(Object),
            active: expect.any(Object),
            createdAt: expect.any(Object),
            company: expect.any(Object),
          }),
        );
      });
    });

    describe('getKnowledgeDocument', () => {
      it('should return NewKnowledgeDocument for default KnowledgeDocument initial value', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup(sampleWithNewData);

        const knowledgeDocument = service.getKnowledgeDocument(formGroup);

        expect(knowledgeDocument).toMatchObject(sampleWithNewData);
      });

      it('should return NewKnowledgeDocument for empty KnowledgeDocument initial value', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup();

        const knowledgeDocument = service.getKnowledgeDocument(formGroup);

        expect(knowledgeDocument).toMatchObject({});
      });

      it('should return IKnowledgeDocument', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup(sampleWithRequiredData);

        const knowledgeDocument = service.getKnowledgeDocument(formGroup);

        expect(knowledgeDocument).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IKnowledgeDocument should not enable id FormControl', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewKnowledgeDocument should disable id FormControl', () => {
        const formGroup = service.createKnowledgeDocumentFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
