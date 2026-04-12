import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IRegulatoryParam } from '../regulatory-param.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../regulatory-param.test-samples';

import { RegulatoryParamService, RestRegulatoryParam } from './regulatory-param.service';

const requireRestSample: RestRegulatoryParam = {
  ...sampleWithRequiredData,
  effectiveFrom: sampleWithRequiredData.effectiveFrom?.format(DATE_FORMAT),
  effectiveTo: sampleWithRequiredData.effectiveTo?.format(DATE_FORMAT),
};

describe('RegulatoryParam Service', () => {
  let service: RegulatoryParamService;
  let httpMock: HttpTestingController;
  let expectedResult: IRegulatoryParam | IRegulatoryParam[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(RegulatoryParamService);
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

    it('should create a RegulatoryParam', () => {
      const regulatoryParam = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(regulatoryParam).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a RegulatoryParam', () => {
      const regulatoryParam = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(regulatoryParam).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a RegulatoryParam', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of RegulatoryParam', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a RegulatoryParam', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addRegulatoryParamToCollectionIfMissing', () => {
      it('should add a RegulatoryParam to an empty array', () => {
        const regulatoryParam: IRegulatoryParam = sampleWithRequiredData;
        expectedResult = service.addRegulatoryParamToCollectionIfMissing([], regulatoryParam);
        expect(expectedResult).toEqual([regulatoryParam]);
      });

      it('should not add a RegulatoryParam to an array that contains it', () => {
        const regulatoryParam: IRegulatoryParam = sampleWithRequiredData;
        const regulatoryParamCollection: IRegulatoryParam[] = [
          {
            ...regulatoryParam,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRegulatoryParamToCollectionIfMissing(regulatoryParamCollection, regulatoryParam);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a RegulatoryParam to an array that doesn't contain it", () => {
        const regulatoryParam: IRegulatoryParam = sampleWithRequiredData;
        const regulatoryParamCollection: IRegulatoryParam[] = [sampleWithPartialData];
        expectedResult = service.addRegulatoryParamToCollectionIfMissing(regulatoryParamCollection, regulatoryParam);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(regulatoryParam);
      });

      it('should add only unique RegulatoryParam to an array', () => {
        const regulatoryParamArray: IRegulatoryParam[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const regulatoryParamCollection: IRegulatoryParam[] = [sampleWithRequiredData];
        expectedResult = service.addRegulatoryParamToCollectionIfMissing(regulatoryParamCollection, ...regulatoryParamArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const regulatoryParam: IRegulatoryParam = sampleWithRequiredData;
        const regulatoryParam2: IRegulatoryParam = sampleWithPartialData;
        expectedResult = service.addRegulatoryParamToCollectionIfMissing([], regulatoryParam, regulatoryParam2);
        expect(expectedResult).toEqual([regulatoryParam, regulatoryParam2]);
      });

      it('should accept null and undefined values', () => {
        const regulatoryParam: IRegulatoryParam = sampleWithRequiredData;
        expectedResult = service.addRegulatoryParamToCollectionIfMissing([], null, regulatoryParam, undefined);
        expect(expectedResult).toEqual([regulatoryParam]);
      });

      it('should return initial array if no RegulatoryParam is added', () => {
        const regulatoryParamCollection: IRegulatoryParam[] = [sampleWithRequiredData];
        expectedResult = service.addRegulatoryParamToCollectionIfMissing(regulatoryParamCollection, undefined, null);
        expect(expectedResult).toEqual(regulatoryParamCollection);
      });
    });

    describe('compareRegulatoryParam', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRegulatoryParam(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 13111 };
        const entity2 = null;

        const compareResult1 = service.compareRegulatoryParam(entity1, entity2);
        const compareResult2 = service.compareRegulatoryParam(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 13111 };
        const entity2 = { id: 25715 };

        const compareResult1 = service.compareRegulatoryParam(entity1, entity2);
        const compareResult2 = service.compareRegulatoryParam(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 13111 };
        const entity2 = { id: 13111 };

        const compareResult1 = service.compareRegulatoryParam(entity1, entity2);
        const compareResult2 = service.compareRegulatoryParam(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
