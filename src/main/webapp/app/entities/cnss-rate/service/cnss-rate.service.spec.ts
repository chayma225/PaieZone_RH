import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ICnssRate } from '../cnss-rate.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../cnss-rate.test-samples';

import { CnssRateService, RestCnssRate } from './cnss-rate.service';

const requireRestSample: RestCnssRate = {
  ...sampleWithRequiredData,
  effectiveFrom: sampleWithRequiredData.effectiveFrom?.format(DATE_FORMAT),
};

describe('CnssRate Service', () => {
  let service: CnssRateService;
  let httpMock: HttpTestingController;
  let expectedResult: ICnssRate | ICnssRate[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(CnssRateService);
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

    it('should create a CnssRate', () => {
      const cnssRate = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(cnssRate).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a CnssRate', () => {
      const cnssRate = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(cnssRate).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a CnssRate', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of CnssRate', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a CnssRate', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addCnssRateToCollectionIfMissing', () => {
      it('should add a CnssRate to an empty array', () => {
        const cnssRate: ICnssRate = sampleWithRequiredData;
        expectedResult = service.addCnssRateToCollectionIfMissing([], cnssRate);
        expect(expectedResult).toEqual([cnssRate]);
      });

      it('should not add a CnssRate to an array that contains it', () => {
        const cnssRate: ICnssRate = sampleWithRequiredData;
        const cnssRateCollection: ICnssRate[] = [
          {
            ...cnssRate,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addCnssRateToCollectionIfMissing(cnssRateCollection, cnssRate);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a CnssRate to an array that doesn't contain it", () => {
        const cnssRate: ICnssRate = sampleWithRequiredData;
        const cnssRateCollection: ICnssRate[] = [sampleWithPartialData];
        expectedResult = service.addCnssRateToCollectionIfMissing(cnssRateCollection, cnssRate);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(cnssRate);
      });

      it('should add only unique CnssRate to an array', () => {
        const cnssRateArray: ICnssRate[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const cnssRateCollection: ICnssRate[] = [sampleWithRequiredData];
        expectedResult = service.addCnssRateToCollectionIfMissing(cnssRateCollection, ...cnssRateArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const cnssRate: ICnssRate = sampleWithRequiredData;
        const cnssRate2: ICnssRate = sampleWithPartialData;
        expectedResult = service.addCnssRateToCollectionIfMissing([], cnssRate, cnssRate2);
        expect(expectedResult).toEqual([cnssRate, cnssRate2]);
      });

      it('should accept null and undefined values', () => {
        const cnssRate: ICnssRate = sampleWithRequiredData;
        expectedResult = service.addCnssRateToCollectionIfMissing([], null, cnssRate, undefined);
        expect(expectedResult).toEqual([cnssRate]);
      });

      it('should return initial array if no CnssRate is added', () => {
        const cnssRateCollection: ICnssRate[] = [sampleWithRequiredData];
        expectedResult = service.addCnssRateToCollectionIfMissing(cnssRateCollection, undefined, null);
        expect(expectedResult).toEqual(cnssRateCollection);
      });
    });

    describe('compareCnssRate', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareCnssRate(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 30932 };
        const entity2 = null;

        const compareResult1 = service.compareCnssRate(entity1, entity2);
        const compareResult2 = service.compareCnssRate(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 30932 };
        const entity2 = { id: 13409 };

        const compareResult1 = service.compareCnssRate(entity1, entity2);
        const compareResult2 = service.compareCnssRate(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 30932 };
        const entity2 = { id: 30932 };

        const compareResult1 = service.compareCnssRate(entity1, entity2);
        const compareResult2 = service.compareCnssRate(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
