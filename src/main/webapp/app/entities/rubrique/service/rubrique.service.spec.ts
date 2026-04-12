import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IRubrique } from '../rubrique.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../rubrique.test-samples';

import { RubriqueService } from './rubrique.service';

const requireRestSample: IRubrique = {
  ...sampleWithRequiredData,
};

describe('Rubrique Service', () => {
  let service: RubriqueService;
  let httpMock: HttpTestingController;
  let expectedResult: IRubrique | IRubrique[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(RubriqueService);
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

    it('should create a Rubrique', () => {
      const rubrique = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(rubrique).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Rubrique', () => {
      const rubrique = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(rubrique).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Rubrique', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Rubrique', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Rubrique', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addRubriqueToCollectionIfMissing', () => {
      it('should add a Rubrique to an empty array', () => {
        const rubrique: IRubrique = sampleWithRequiredData;
        expectedResult = service.addRubriqueToCollectionIfMissing([], rubrique);
        expect(expectedResult).toEqual([rubrique]);
      });

      it('should not add a Rubrique to an array that contains it', () => {
        const rubrique: IRubrique = sampleWithRequiredData;
        const rubriqueCollection: IRubrique[] = [
          {
            ...rubrique,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRubriqueToCollectionIfMissing(rubriqueCollection, rubrique);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Rubrique to an array that doesn't contain it", () => {
        const rubrique: IRubrique = sampleWithRequiredData;
        const rubriqueCollection: IRubrique[] = [sampleWithPartialData];
        expectedResult = service.addRubriqueToCollectionIfMissing(rubriqueCollection, rubrique);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(rubrique);
      });

      it('should add only unique Rubrique to an array', () => {
        const rubriqueArray: IRubrique[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const rubriqueCollection: IRubrique[] = [sampleWithRequiredData];
        expectedResult = service.addRubriqueToCollectionIfMissing(rubriqueCollection, ...rubriqueArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const rubrique: IRubrique = sampleWithRequiredData;
        const rubrique2: IRubrique = sampleWithPartialData;
        expectedResult = service.addRubriqueToCollectionIfMissing([], rubrique, rubrique2);
        expect(expectedResult).toEqual([rubrique, rubrique2]);
      });

      it('should accept null and undefined values', () => {
        const rubrique: IRubrique = sampleWithRequiredData;
        expectedResult = service.addRubriqueToCollectionIfMissing([], null, rubrique, undefined);
        expect(expectedResult).toEqual([rubrique]);
      });

      it('should return initial array if no Rubrique is added', () => {
        const rubriqueCollection: IRubrique[] = [sampleWithRequiredData];
        expectedResult = service.addRubriqueToCollectionIfMissing(rubriqueCollection, undefined, null);
        expect(expectedResult).toEqual(rubriqueCollection);
      });
    });

    describe('compareRubrique', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRubrique(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 18175 };
        const entity2 = null;

        const compareResult1 = service.compareRubrique(entity1, entity2);
        const compareResult2 = service.compareRubrique(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 18175 };
        const entity2 = { id: 14496 };

        const compareResult1 = service.compareRubrique(entity1, entity2);
        const compareResult2 = service.compareRubrique(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 18175 };
        const entity2 = { id: 18175 };

        const compareResult1 = service.compareRubrique(entity1, entity2);
        const compareResult2 = service.compareRubrique(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
