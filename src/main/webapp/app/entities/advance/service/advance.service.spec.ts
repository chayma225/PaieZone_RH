import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IAdvance } from '../advance.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../advance.test-samples';

import { AdvanceService, RestAdvance } from './advance.service';

const requireRestSample: RestAdvance = {
  ...sampleWithRequiredData,
  requestDate: sampleWithRequiredData.requestDate?.format(DATE_FORMAT),
};

describe('Advance Service', () => {
  let service: AdvanceService;
  let httpMock: HttpTestingController;
  let expectedResult: IAdvance | IAdvance[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AdvanceService);
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

    it('should create a Advance', () => {
      const advance = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(advance).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Advance', () => {
      const advance = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(advance).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Advance', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Advance', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Advance', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addAdvanceToCollectionIfMissing', () => {
      it('should add a Advance to an empty array', () => {
        const advance: IAdvance = sampleWithRequiredData;
        expectedResult = service.addAdvanceToCollectionIfMissing([], advance);
        expect(expectedResult).toEqual([advance]);
      });

      it('should not add a Advance to an array that contains it', () => {
        const advance: IAdvance = sampleWithRequiredData;
        const advanceCollection: IAdvance[] = [
          {
            ...advance,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAdvanceToCollectionIfMissing(advanceCollection, advance);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Advance to an array that doesn't contain it", () => {
        const advance: IAdvance = sampleWithRequiredData;
        const advanceCollection: IAdvance[] = [sampleWithPartialData];
        expectedResult = service.addAdvanceToCollectionIfMissing(advanceCollection, advance);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(advance);
      });

      it('should add only unique Advance to an array', () => {
        const advanceArray: IAdvance[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const advanceCollection: IAdvance[] = [sampleWithRequiredData];
        expectedResult = service.addAdvanceToCollectionIfMissing(advanceCollection, ...advanceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const advance: IAdvance = sampleWithRequiredData;
        const advance2: IAdvance = sampleWithPartialData;
        expectedResult = service.addAdvanceToCollectionIfMissing([], advance, advance2);
        expect(expectedResult).toEqual([advance, advance2]);
      });

      it('should accept null and undefined values', () => {
        const advance: IAdvance = sampleWithRequiredData;
        expectedResult = service.addAdvanceToCollectionIfMissing([], null, advance, undefined);
        expect(expectedResult).toEqual([advance]);
      });

      it('should return initial array if no Advance is added', () => {
        const advanceCollection: IAdvance[] = [sampleWithRequiredData];
        expectedResult = service.addAdvanceToCollectionIfMissing(advanceCollection, undefined, null);
        expect(expectedResult).toEqual(advanceCollection);
      });
    });

    describe('compareAdvance', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAdvance(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 10090 };
        const entity2 = null;

        const compareResult1 = service.compareAdvance(entity1, entity2);
        const compareResult2 = service.compareAdvance(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 10090 };
        const entity2 = { id: 30715 };

        const compareResult1 = service.compareAdvance(entity1, entity2);
        const compareResult2 = service.compareAdvance(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 10090 };
        const entity2 = { id: 10090 };

        const compareResult1 = service.compareAdvance(entity1, entity2);
        const compareResult2 = service.compareAdvance(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
