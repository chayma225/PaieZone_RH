import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IOfficialDocument } from '../official-document.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../official-document.test-samples';

import { OfficialDocumentService, RestOfficialDocument } from './official-document.service';

const requireRestSample: RestOfficialDocument = {
  ...sampleWithRequiredData,
  generatedAt: sampleWithRequiredData.generatedAt?.toJSON(),
  sentAt: sampleWithRequiredData.sentAt?.toJSON(),
};

describe('OfficialDocument Service', () => {
  let service: OfficialDocumentService;
  let httpMock: HttpTestingController;
  let expectedResult: IOfficialDocument | IOfficialDocument[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(OfficialDocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a OfficialDocument', () => {
      const officialDocument = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(officialDocument).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a OfficialDocument', () => {
      const officialDocument = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(officialDocument).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a OfficialDocument', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of OfficialDocument', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a OfficialDocument', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addOfficialDocumentToCollectionIfMissing', () => {
      it('should add a OfficialDocument to an empty array', () => {
        const officialDocument: IOfficialDocument = sampleWithRequiredData;
        expectedResult = service.addOfficialDocumentToCollectionIfMissing([], officialDocument);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(officialDocument);
      });

      it('should not add a OfficialDocument to an array that contains it', () => {
        const officialDocument: IOfficialDocument = sampleWithRequiredData;
        const officialDocumentCollection: IOfficialDocument[] = [
          {
            ...officialDocument,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addOfficialDocumentToCollectionIfMissing(officialDocumentCollection, officialDocument);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a OfficialDocument to an array that doesn't contain it", () => {
        const officialDocument: IOfficialDocument = sampleWithRequiredData;
        const officialDocumentCollection: IOfficialDocument[] = [sampleWithPartialData];
        expectedResult = service.addOfficialDocumentToCollectionIfMissing(officialDocumentCollection, officialDocument);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(officialDocument);
      });

      it('should add only unique OfficialDocument to an array', () => {
        const officialDocumentArray: IOfficialDocument[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const officialDocumentCollection: IOfficialDocument[] = [sampleWithRequiredData];
        expectedResult = service.addOfficialDocumentToCollectionIfMissing(officialDocumentCollection, ...officialDocumentArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const officialDocument: IOfficialDocument = sampleWithRequiredData;
        const officialDocument2: IOfficialDocument = sampleWithPartialData;
        expectedResult = service.addOfficialDocumentToCollectionIfMissing([], officialDocument, officialDocument2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(officialDocument);
        expect(expectedResult).toContain(officialDocument2);
      });

      it('should accept null and undefined values', () => {
        const officialDocument: IOfficialDocument = sampleWithRequiredData;
        expectedResult = service.addOfficialDocumentToCollectionIfMissing([], null, officialDocument, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(officialDocument);
      });

      it('should return initial array if no OfficialDocument is added', () => {
        const officialDocumentCollection: IOfficialDocument[] = [sampleWithRequiredData];
        expectedResult = service.addOfficialDocumentToCollectionIfMissing(officialDocumentCollection, undefined, null);
        expect(expectedResult).toEqual(officialDocumentCollection);
      });
    });

    describe('compareOfficialDocument', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareOfficialDocument(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 18816 };
        const entity2 = null;

        const compareResult1 = service.compareOfficialDocument(entity1, entity2);
        const compareResult2 = service.compareOfficialDocument(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 18816 };
        const entity2 = { id: 8891 };

        const compareResult1 = service.compareOfficialDocument(entity1, entity2);
        const compareResult2 = service.compareOfficialDocument(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 18816 };
        const entity2 = { id: 18816 };

        const compareResult1 = service.compareOfficialDocument(entity1, entity2);
        const compareResult2 = service.compareOfficialDocument(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
