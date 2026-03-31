import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IEmployeeHistory } from '../employee-history.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../employee-history.test-samples';

import { EmployeeHistoryService, RestEmployeeHistory } from './employee-history.service';

const requireRestSample: RestEmployeeHistory = {
  ...sampleWithRequiredData,
  changedAt: sampleWithRequiredData.changedAt?.toJSON(),
};

describe('EmployeeHistory Service', () => {
  let service: EmployeeHistoryService;
  let httpMock: HttpTestingController;
  let expectedResult: IEmployeeHistory | IEmployeeHistory[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(EmployeeHistoryService);
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

    it('should create a EmployeeHistory', () => {
      const employeeHistory = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(employeeHistory).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a EmployeeHistory', () => {
      const employeeHistory = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(employeeHistory).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a EmployeeHistory', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of EmployeeHistory', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a EmployeeHistory', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addEmployeeHistoryToCollectionIfMissing', () => {
      it('should add a EmployeeHistory to an empty array', () => {
        const employeeHistory: IEmployeeHistory = sampleWithRequiredData;
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing([], employeeHistory);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(employeeHistory);
      });

      it('should not add a EmployeeHistory to an array that contains it', () => {
        const employeeHistory: IEmployeeHistory = sampleWithRequiredData;
        const employeeHistoryCollection: IEmployeeHistory[] = [
          {
            ...employeeHistory,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing(employeeHistoryCollection, employeeHistory);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a EmployeeHistory to an array that doesn't contain it", () => {
        const employeeHistory: IEmployeeHistory = sampleWithRequiredData;
        const employeeHistoryCollection: IEmployeeHistory[] = [sampleWithPartialData];
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing(employeeHistoryCollection, employeeHistory);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(employeeHistory);
      });

      it('should add only unique EmployeeHistory to an array', () => {
        const employeeHistoryArray: IEmployeeHistory[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const employeeHistoryCollection: IEmployeeHistory[] = [sampleWithRequiredData];
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing(employeeHistoryCollection, ...employeeHistoryArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const employeeHistory: IEmployeeHistory = sampleWithRequiredData;
        const employeeHistory2: IEmployeeHistory = sampleWithPartialData;
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing([], employeeHistory, employeeHistory2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(employeeHistory);
        expect(expectedResult).toContain(employeeHistory2);
      });

      it('should accept null and undefined values', () => {
        const employeeHistory: IEmployeeHistory = sampleWithRequiredData;
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing([], null, employeeHistory, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(employeeHistory);
      });

      it('should return initial array if no EmployeeHistory is added', () => {
        const employeeHistoryCollection: IEmployeeHistory[] = [sampleWithRequiredData];
        expectedResult = service.addEmployeeHistoryToCollectionIfMissing(employeeHistoryCollection, undefined, null);
        expect(expectedResult).toEqual(employeeHistoryCollection);
      });
    });

    describe('compareEmployeeHistory', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareEmployeeHistory(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 27008 };
        const entity2 = null;

        const compareResult1 = service.compareEmployeeHistory(entity1, entity2);
        const compareResult2 = service.compareEmployeeHistory(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 27008 };
        const entity2 = { id: 19187 };

        const compareResult1 = service.compareEmployeeHistory(entity1, entity2);
        const compareResult2 = service.compareEmployeeHistory(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 27008 };
        const entity2 = { id: 27008 };

        const compareResult1 = service.compareEmployeeHistory(entity1, entity2);
        const compareResult2 = service.compareEmployeeHistory(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
