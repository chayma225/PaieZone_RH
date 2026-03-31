import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPayrollPeriod } from '../payroll-period.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../payroll-period.test-samples';

import { PayrollPeriodService, RestPayrollPeriod } from './payroll-period.service';

const requireRestSample: RestPayrollPeriod = {
  ...sampleWithRequiredData,
  calculatedAt: sampleWithRequiredData.calculatedAt?.toJSON(),
  validatedAt: sampleWithRequiredData.validatedAt?.toJSON(),
  lockedAt: sampleWithRequiredData.lockedAt?.toJSON(),
};

describe('PayrollPeriod Service', () => {
  let service: PayrollPeriodService;
  let httpMock: HttpTestingController;
  let expectedResult: IPayrollPeriod | IPayrollPeriod[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PayrollPeriodService);
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

    it('should create a PayrollPeriod', () => {
      const payrollPeriod = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(payrollPeriod).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PayrollPeriod', () => {
      const payrollPeriod = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(payrollPeriod).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PayrollPeriod', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PayrollPeriod', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PayrollPeriod', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPayrollPeriodToCollectionIfMissing', () => {
      it('should add a PayrollPeriod to an empty array', () => {
        const payrollPeriod: IPayrollPeriod = sampleWithRequiredData;
        expectedResult = service.addPayrollPeriodToCollectionIfMissing([], payrollPeriod);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(payrollPeriod);
      });

      it('should not add a PayrollPeriod to an array that contains it', () => {
        const payrollPeriod: IPayrollPeriod = sampleWithRequiredData;
        const payrollPeriodCollection: IPayrollPeriod[] = [
          {
            ...payrollPeriod,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPayrollPeriodToCollectionIfMissing(payrollPeriodCollection, payrollPeriod);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PayrollPeriod to an array that doesn't contain it", () => {
        const payrollPeriod: IPayrollPeriod = sampleWithRequiredData;
        const payrollPeriodCollection: IPayrollPeriod[] = [sampleWithPartialData];
        expectedResult = service.addPayrollPeriodToCollectionIfMissing(payrollPeriodCollection, payrollPeriod);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(payrollPeriod);
      });

      it('should add only unique PayrollPeriod to an array', () => {
        const payrollPeriodArray: IPayrollPeriod[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const payrollPeriodCollection: IPayrollPeriod[] = [sampleWithRequiredData];
        expectedResult = service.addPayrollPeriodToCollectionIfMissing(payrollPeriodCollection, ...payrollPeriodArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const payrollPeriod: IPayrollPeriod = sampleWithRequiredData;
        const payrollPeriod2: IPayrollPeriod = sampleWithPartialData;
        expectedResult = service.addPayrollPeriodToCollectionIfMissing([], payrollPeriod, payrollPeriod2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(payrollPeriod);
        expect(expectedResult).toContain(payrollPeriod2);
      });

      it('should accept null and undefined values', () => {
        const payrollPeriod: IPayrollPeriod = sampleWithRequiredData;
        expectedResult = service.addPayrollPeriodToCollectionIfMissing([], null, payrollPeriod, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(payrollPeriod);
      });

      it('should return initial array if no PayrollPeriod is added', () => {
        const payrollPeriodCollection: IPayrollPeriod[] = [sampleWithRequiredData];
        expectedResult = service.addPayrollPeriodToCollectionIfMissing(payrollPeriodCollection, undefined, null);
        expect(expectedResult).toEqual(payrollPeriodCollection);
      });
    });

    describe('comparePayrollPeriod', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePayrollPeriod(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 28456 };
        const entity2 = null;

        const compareResult1 = service.comparePayrollPeriod(entity1, entity2);
        const compareResult2 = service.comparePayrollPeriod(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 28456 };
        const entity2 = { id: 9891 };

        const compareResult1 = service.comparePayrollPeriod(entity1, entity2);
        const compareResult2 = service.comparePayrollPeriod(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 28456 };
        const entity2 = { id: 28456 };

        const compareResult1 = service.comparePayrollPeriod(entity1, entity2);
        const compareResult2 = service.comparePayrollPeriod(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
