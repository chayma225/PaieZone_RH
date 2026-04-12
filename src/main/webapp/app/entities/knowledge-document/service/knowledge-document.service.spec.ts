import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IKnowledgeDocument } from '../knowledge-document.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../knowledge-document.test-samples';

import { KnowledgeDocumentService, RestKnowledgeDocument } from './knowledge-document.service';

const requireRestSample: RestKnowledgeDocument = {
  ...sampleWithRequiredData,
  indexedAt: sampleWithRequiredData.indexedAt?.toJSON(),
  createdAt: sampleWithRequiredData.createdAt?.toJSON(),
};

describe('KnowledgeDocument Service', () => {
  let service: KnowledgeDocumentService;
  let httpMock: HttpTestingController;
  let expectedResult: IKnowledgeDocument | IKnowledgeDocument[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(KnowledgeDocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a KnowledgeDocument', () => {
      const knowledgeDocument = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(knowledgeDocument).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a KnowledgeDocument', () => {
      const knowledgeDocument = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(knowledgeDocument).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a KnowledgeDocument', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of KnowledgeDocument', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a KnowledgeDocument', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addKnowledgeDocumentToCollectionIfMissing', () => {
      it('should add a KnowledgeDocument to an empty array', () => {
        const knowledgeDocument: IKnowledgeDocument = sampleWithRequiredData;
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing([], knowledgeDocument);
        expect(expectedResult).toEqual([knowledgeDocument]);
      });

      it('should not add a KnowledgeDocument to an array that contains it', () => {
        const knowledgeDocument: IKnowledgeDocument = sampleWithRequiredData;
        const knowledgeDocumentCollection: IKnowledgeDocument[] = [
          {
            ...knowledgeDocument,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing(knowledgeDocumentCollection, knowledgeDocument);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a KnowledgeDocument to an array that doesn't contain it", () => {
        const knowledgeDocument: IKnowledgeDocument = sampleWithRequiredData;
        const knowledgeDocumentCollection: IKnowledgeDocument[] = [sampleWithPartialData];
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing(knowledgeDocumentCollection, knowledgeDocument);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(knowledgeDocument);
      });

      it('should add only unique KnowledgeDocument to an array', () => {
        const knowledgeDocumentArray: IKnowledgeDocument[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const knowledgeDocumentCollection: IKnowledgeDocument[] = [sampleWithRequiredData];
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing(knowledgeDocumentCollection, ...knowledgeDocumentArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const knowledgeDocument: IKnowledgeDocument = sampleWithRequiredData;
        const knowledgeDocument2: IKnowledgeDocument = sampleWithPartialData;
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing([], knowledgeDocument, knowledgeDocument2);
        expect(expectedResult).toEqual([knowledgeDocument, knowledgeDocument2]);
      });

      it('should accept null and undefined values', () => {
        const knowledgeDocument: IKnowledgeDocument = sampleWithRequiredData;
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing([], null, knowledgeDocument, undefined);
        expect(expectedResult).toEqual([knowledgeDocument]);
      });

      it('should return initial array if no KnowledgeDocument is added', () => {
        const knowledgeDocumentCollection: IKnowledgeDocument[] = [sampleWithRequiredData];
        expectedResult = service.addKnowledgeDocumentToCollectionIfMissing(knowledgeDocumentCollection, undefined, null);
        expect(expectedResult).toEqual(knowledgeDocumentCollection);
      });
    });

    describe('compareKnowledgeDocument', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareKnowledgeDocument(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 2351 };
        const entity2 = null;

        const compareResult1 = service.compareKnowledgeDocument(entity1, entity2);
        const compareResult2 = service.compareKnowledgeDocument(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 2351 };
        const entity2 = { id: 28934 };

        const compareResult1 = service.compareKnowledgeDocument(entity1, entity2);
        const compareResult2 = service.compareKnowledgeDocument(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 2351 };
        const entity2 = { id: 2351 };

        const compareResult1 = service.compareKnowledgeDocument(entity1, entity2);
        const compareResult2 = service.compareKnowledgeDocument(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
