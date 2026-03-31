import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ILeaveBalance } from '../leave-balance.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../leave-balance.test-samples';

import { LeaveBalanceService, RestLeaveBalance } from './leave-balance.service';

const requireRestSample: RestLeaveBalance = {
  ...sampleWithRequiredData,
  lastUpdatedAt: sampleWithRequiredData.lastUpdatedAt?.toJSON(),
};

describe('LeaveBalance Service', () => {
  let service: LeaveBalanceService;
  let httpMock: HttpTestingController;
  let expectedResult: ILeaveBalance | ILeaveBalance[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(LeaveBalanceService);
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

    it('should create a LeaveBalance', () => {
      const leaveBalance = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(leaveBalance).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a LeaveBalance', () => {
      const leaveBalance = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(leaveBalance).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a LeaveBalance', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of LeaveBalance', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a LeaveBalance', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addLeaveBalanceToCollectionIfMissing', () => {
      it('should add a LeaveBalance to an empty array', () => {
        const leaveBalance: ILeaveBalance = sampleWithRequiredData;
        expectedResult = service.addLeaveBalanceToCollectionIfMissing([], leaveBalance);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(leaveBalance);
      });

      it('should not add a LeaveBalance to an array that contains it', () => {
        const leaveBalance: ILeaveBalance = sampleWithRequiredData;
        const leaveBalanceCollection: ILeaveBalance[] = [
          {
            ...leaveBalance,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addLeaveBalanceToCollectionIfMissing(leaveBalanceCollection, leaveBalance);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a LeaveBalance to an array that doesn't contain it", () => {
        const leaveBalance: ILeaveBalance = sampleWithRequiredData;
        const leaveBalanceCollection: ILeaveBalance[] = [sampleWithPartialData];
        expectedResult = service.addLeaveBalanceToCollectionIfMissing(leaveBalanceCollection, leaveBalance);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(leaveBalance);
      });

      it('should add only unique LeaveBalance to an array', () => {
        const leaveBalanceArray: ILeaveBalance[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const leaveBalanceCollection: ILeaveBalance[] = [sampleWithRequiredData];
        expectedResult = service.addLeaveBalanceToCollectionIfMissing(leaveBalanceCollection, ...leaveBalanceArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const leaveBalance: ILeaveBalance = sampleWithRequiredData;
        const leaveBalance2: ILeaveBalance = sampleWithPartialData;
        expectedResult = service.addLeaveBalanceToCollectionIfMissing([], leaveBalance, leaveBalance2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(leaveBalance);
        expect(expectedResult).toContain(leaveBalance2);
      });

      it('should accept null and undefined values', () => {
        const leaveBalance: ILeaveBalance = sampleWithRequiredData;
        expectedResult = service.addLeaveBalanceToCollectionIfMissing([], null, leaveBalance, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(leaveBalance);
      });

      it('should return initial array if no LeaveBalance is added', () => {
        const leaveBalanceCollection: ILeaveBalance[] = [sampleWithRequiredData];
        expectedResult = service.addLeaveBalanceToCollectionIfMissing(leaveBalanceCollection, undefined, null);
        expect(expectedResult).toEqual(leaveBalanceCollection);
      });
    });

    describe('compareLeaveBalance', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareLeaveBalance(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 9581 };
        const entity2 = null;

        const compareResult1 = service.compareLeaveBalance(entity1, entity2);
        const compareResult2 = service.compareLeaveBalance(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 9581 };
        const entity2 = { id: 6757 };

        const compareResult1 = service.compareLeaveBalance(entity1, entity2);
        const compareResult2 = service.compareLeaveBalance(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 9581 };
        const entity2 = { id: 9581 };

        const compareResult1 = service.compareLeaveBalance(entity1, entity2);
        const compareResult2 = service.compareLeaveBalance(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
