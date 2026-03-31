import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IPaySlipLine } from '../pay-slip-line.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../pay-slip-line.test-samples';

import { PaySlipLineService } from './pay-slip-line.service';

const requireRestSample: IPaySlipLine = {
  ...sampleWithRequiredData,
};

describe('PaySlipLine Service', () => {
  let service: PaySlipLineService;
  let httpMock: HttpTestingController;
  let expectedResult: IPaySlipLine | IPaySlipLine[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PaySlipLineService);
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

    it('should create a PaySlipLine', () => {
      const paySlipLine = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(paySlipLine).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PaySlipLine', () => {
      const paySlipLine = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(paySlipLine).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PaySlipLine', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PaySlipLine', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PaySlipLine', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addPaySlipLineToCollectionIfMissing', () => {
      it('should add a PaySlipLine to an empty array', () => {
        const paySlipLine: IPaySlipLine = sampleWithRequiredData;
        expectedResult = service.addPaySlipLineToCollectionIfMissing([], paySlipLine);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(paySlipLine);
      });

      it('should not add a PaySlipLine to an array that contains it', () => {
        const paySlipLine: IPaySlipLine = sampleWithRequiredData;
        const paySlipLineCollection: IPaySlipLine[] = [
          {
            ...paySlipLine,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPaySlipLineToCollectionIfMissing(paySlipLineCollection, paySlipLine);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PaySlipLine to an array that doesn't contain it", () => {
        const paySlipLine: IPaySlipLine = sampleWithRequiredData;
        const paySlipLineCollection: IPaySlipLine[] = [sampleWithPartialData];
        expectedResult = service.addPaySlipLineToCollectionIfMissing(paySlipLineCollection, paySlipLine);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(paySlipLine);
      });

      it('should add only unique PaySlipLine to an array', () => {
        const paySlipLineArray: IPaySlipLine[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const paySlipLineCollection: IPaySlipLine[] = [sampleWithRequiredData];
        expectedResult = service.addPaySlipLineToCollectionIfMissing(paySlipLineCollection, ...paySlipLineArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const paySlipLine: IPaySlipLine = sampleWithRequiredData;
        const paySlipLine2: IPaySlipLine = sampleWithPartialData;
        expectedResult = service.addPaySlipLineToCollectionIfMissing([], paySlipLine, paySlipLine2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(paySlipLine);
        expect(expectedResult).toContain(paySlipLine2);
      });

      it('should accept null and undefined values', () => {
        const paySlipLine: IPaySlipLine = sampleWithRequiredData;
        expectedResult = service.addPaySlipLineToCollectionIfMissing([], null, paySlipLine, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(paySlipLine);
      });

      it('should return initial array if no PaySlipLine is added', () => {
        const paySlipLineCollection: IPaySlipLine[] = [sampleWithRequiredData];
        expectedResult = service.addPaySlipLineToCollectionIfMissing(paySlipLineCollection, undefined, null);
        expect(expectedResult).toEqual(paySlipLineCollection);
      });
    });

    describe('comparePaySlipLine', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePaySlipLine(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 17388 };
        const entity2 = null;

        const compareResult1 = service.comparePaySlipLine(entity1, entity2);
        const compareResult2 = service.comparePaySlipLine(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 17388 };
        const entity2 = { id: 10105 };

        const compareResult1 = service.comparePaySlipLine(entity1, entity2);
        const compareResult2 = service.comparePaySlipLine(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 17388 };
        const entity2 = { id: 17388 };

        const compareResult1 = service.comparePaySlipLine(entity1, entity2);
        const compareResult2 = service.comparePaySlipLine(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
