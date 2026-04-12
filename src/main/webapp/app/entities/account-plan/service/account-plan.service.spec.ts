import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IAccountPlan } from '../account-plan.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../account-plan.test-samples';

import { AccountPlanService } from './account-plan.service';

const requireRestSample: IAccountPlan = {
  ...sampleWithRequiredData,
};

describe('AccountPlan Service', () => {
  let service: AccountPlanService;
  let httpMock: HttpTestingController;
  let expectedResult: IAccountPlan | IAccountPlan[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(AccountPlanService);
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

    it('should create a AccountPlan', () => {
      const accountPlan = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(accountPlan).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a AccountPlan', () => {
      const accountPlan = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(accountPlan).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a AccountPlan', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of AccountPlan', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a AccountPlan', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addAccountPlanToCollectionIfMissing', () => {
      it('should add a AccountPlan to an empty array', () => {
        const accountPlan: IAccountPlan = sampleWithRequiredData;
        expectedResult = service.addAccountPlanToCollectionIfMissing([], accountPlan);
        expect(expectedResult).toEqual([accountPlan]);
      });

      it('should not add a AccountPlan to an array that contains it', () => {
        const accountPlan: IAccountPlan = sampleWithRequiredData;
        const accountPlanCollection: IAccountPlan[] = [
          {
            ...accountPlan,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addAccountPlanToCollectionIfMissing(accountPlanCollection, accountPlan);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a AccountPlan to an array that doesn't contain it", () => {
        const accountPlan: IAccountPlan = sampleWithRequiredData;
        const accountPlanCollection: IAccountPlan[] = [sampleWithPartialData];
        expectedResult = service.addAccountPlanToCollectionIfMissing(accountPlanCollection, accountPlan);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(accountPlan);
      });

      it('should add only unique AccountPlan to an array', () => {
        const accountPlanArray: IAccountPlan[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const accountPlanCollection: IAccountPlan[] = [sampleWithRequiredData];
        expectedResult = service.addAccountPlanToCollectionIfMissing(accountPlanCollection, ...accountPlanArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const accountPlan: IAccountPlan = sampleWithRequiredData;
        const accountPlan2: IAccountPlan = sampleWithPartialData;
        expectedResult = service.addAccountPlanToCollectionIfMissing([], accountPlan, accountPlan2);
        expect(expectedResult).toEqual([accountPlan, accountPlan2]);
      });

      it('should accept null and undefined values', () => {
        const accountPlan: IAccountPlan = sampleWithRequiredData;
        expectedResult = service.addAccountPlanToCollectionIfMissing([], null, accountPlan, undefined);
        expect(expectedResult).toEqual([accountPlan]);
      });

      it('should return initial array if no AccountPlan is added', () => {
        const accountPlanCollection: IAccountPlan[] = [sampleWithRequiredData];
        expectedResult = service.addAccountPlanToCollectionIfMissing(accountPlanCollection, undefined, null);
        expect(expectedResult).toEqual(accountPlanCollection);
      });
    });

    describe('compareAccountPlan', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareAccountPlan(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 7481 };
        const entity2 = null;

        const compareResult1 = service.compareAccountPlan(entity1, entity2);
        const compareResult2 = service.compareAccountPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 7481 };
        const entity2 = { id: 6442 };

        const compareResult1 = service.compareAccountPlan(entity1, entity2);
        const compareResult2 = service.compareAccountPlan(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 7481 };
        const entity2 = { id: 7481 };

        const compareResult1 = service.compareAccountPlan(entity1, entity2);
        const compareResult2 = service.compareAccountPlan(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
