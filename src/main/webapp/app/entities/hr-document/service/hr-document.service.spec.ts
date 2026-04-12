import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IHrDocument } from '../hr-document.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../hr-document.test-samples';

import { HrDocumentService, RestHrDocument } from './hr-document.service';

const requireRestSample: RestHrDocument = {
  ...sampleWithRequiredData,
  uploadedAt: sampleWithRequiredData.uploadedAt?.toJSON(),
  expiryDate: sampleWithRequiredData.expiryDate?.format(DATE_FORMAT),
};

describe('HrDocument Service', () => {
  let service: HrDocumentService;
  let httpMock: HttpTestingController;
  let expectedResult: IHrDocument | IHrDocument[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(HrDocumentService);
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

    it('should create a HrDocument', () => {
      const hrDocument = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(hrDocument).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a HrDocument', () => {
      const hrDocument = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(hrDocument).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a HrDocument', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of HrDocument', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a HrDocument', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addHrDocumentToCollectionIfMissing', () => {
      it('should add a HrDocument to an empty array', () => {
        const hrDocument: IHrDocument = sampleWithRequiredData;
        expectedResult = service.addHrDocumentToCollectionIfMissing([], hrDocument);
        expect(expectedResult).toEqual([hrDocument]);
      });

      it('should not add a HrDocument to an array that contains it', () => {
        const hrDocument: IHrDocument = sampleWithRequiredData;
        const hrDocumentCollection: IHrDocument[] = [
          {
            ...hrDocument,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addHrDocumentToCollectionIfMissing(hrDocumentCollection, hrDocument);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a HrDocument to an array that doesn't contain it", () => {
        const hrDocument: IHrDocument = sampleWithRequiredData;
        const hrDocumentCollection: IHrDocument[] = [sampleWithPartialData];
        expectedResult = service.addHrDocumentToCollectionIfMissing(hrDocumentCollection, hrDocument);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(hrDocument);
      });

      it('should add only unique HrDocument to an array', () => {
        const hrDocumentArray: IHrDocument[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const hrDocumentCollection: IHrDocument[] = [sampleWithRequiredData];
        expectedResult = service.addHrDocumentToCollectionIfMissing(hrDocumentCollection, ...hrDocumentArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const hrDocument: IHrDocument = sampleWithRequiredData;
        const hrDocument2: IHrDocument = sampleWithPartialData;
        expectedResult = service.addHrDocumentToCollectionIfMissing([], hrDocument, hrDocument2);
        expect(expectedResult).toEqual([hrDocument, hrDocument2]);
      });

      it('should accept null and undefined values', () => {
        const hrDocument: IHrDocument = sampleWithRequiredData;
        expectedResult = service.addHrDocumentToCollectionIfMissing([], null, hrDocument, undefined);
        expect(expectedResult).toEqual([hrDocument]);
      });

      it('should return initial array if no HrDocument is added', () => {
        const hrDocumentCollection: IHrDocument[] = [sampleWithRequiredData];
        expectedResult = service.addHrDocumentToCollectionIfMissing(hrDocumentCollection, undefined, null);
        expect(expectedResult).toEqual(hrDocumentCollection);
      });
    });

    describe('compareHrDocument', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareHrDocument(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 28321 };
        const entity2 = null;

        const compareResult1 = service.compareHrDocument(entity1, entity2);
        const compareResult2 = service.compareHrDocument(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 28321 };
        const entity2 = { id: 12636 };

        const compareResult1 = service.compareHrDocument(entity1, entity2);
        const compareResult2 = service.compareHrDocument(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 28321 };
        const entity2 = { id: 28321 };

        const compareResult1 = service.compareHrDocument(entity1, entity2);
        const compareResult2 = service.compareHrDocument(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
