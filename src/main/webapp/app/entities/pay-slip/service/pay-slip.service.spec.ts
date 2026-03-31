import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPaySlip } from '../pay-slip.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../pay-slip.test-samples';

import { PaySlipService, RestPaySlip } from './pay-slip.service';

const requireRestSample: RestPaySlip = {
  ...sampleWithRequiredData,
  generatedAt: sampleWithRequiredData.generatedAt?.toJSON(),
  sentToEmployeeAt: sampleWithRequiredData.sentToEmployeeAt?.toJSON(),
};

describe('PaySlip Service', () => {
  let service: PaySlipService;
  let httpMock: HttpTestingController;
  let expectedResult: IPaySlip | IPaySlip[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PaySlipService);
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

    it('should create a PaySlip', () => {
      const paySlip = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(paySlip).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PaySlip', () => {
      const paySlip = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(paySlip).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PaySlip', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PaySlip', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PaySlip', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPaySlipToCollectionIfMissing', () => {
      it('should add a PaySlip to an empty array', () => {
        const paySlip: IPaySlip = sampleWithRequiredData;
        expectedResult = service.addPaySlipToCollectionIfMissing([], paySlip);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(paySlip);
      });

      it('should not add a PaySlip to an array that contains it', () => {
        const paySlip: IPaySlip = sampleWithRequiredData;
        const paySlipCollection: IPaySlip[] = [
          {
            ...paySlip,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPaySlipToCollectionIfMissing(paySlipCollection, paySlip);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PaySlip to an array that doesn't contain it", () => {
        const paySlip: IPaySlip = sampleWithRequiredData;
        const paySlipCollection: IPaySlip[] = [sampleWithPartialData];
        expectedResult = service.addPaySlipToCollectionIfMissing(paySlipCollection, paySlip);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(paySlip);
      });

      it('should add only unique PaySlip to an array', () => {
        const paySlipArray: IPaySlip[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const paySlipCollection: IPaySlip[] = [sampleWithRequiredData];
        expectedResult = service.addPaySlipToCollectionIfMissing(paySlipCollection, ...paySlipArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const paySlip: IPaySlip = sampleWithRequiredData;
        const paySlip2: IPaySlip = sampleWithPartialData;
        expectedResult = service.addPaySlipToCollectionIfMissing([], paySlip, paySlip2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(paySlip);
        expect(expectedResult).toContain(paySlip2);
      });

      it('should accept null and undefined values', () => {
        const paySlip: IPaySlip = sampleWithRequiredData;
        expectedResult = service.addPaySlipToCollectionIfMissing([], null, paySlip, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(paySlip);
      });

      it('should return initial array if no PaySlip is added', () => {
        const paySlipCollection: IPaySlip[] = [sampleWithRequiredData];
        expectedResult = service.addPaySlipToCollectionIfMissing(paySlipCollection, undefined, null);
        expect(expectedResult).toEqual(paySlipCollection);
      });
    });

    describe('comparePaySlip', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePaySlip(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 6421 };
        const entity2 = null;

        const compareResult1 = service.comparePaySlip(entity1, entity2);
        const compareResult2 = service.comparePaySlip(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 6421 };
        const entity2 = { id: 15030 };

        const compareResult1 = service.comparePaySlip(entity1, entity2);
        const compareResult2 = service.comparePaySlip(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 6421 };
        const entity2 = { id: 6421 };

        const compareResult1 = service.comparePaySlip(entity1, entity2);
        const compareResult2 = service.comparePaySlip(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
