import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ITaxBracket } from '../tax-bracket.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../tax-bracket.test-samples';

import { TaxBracketService } from './tax-bracket.service';

const requireRestSample: ITaxBracket = {
  ...sampleWithRequiredData,
};

describe('TaxBracket Service', () => {
  let service: TaxBracketService;
  let httpMock: HttpTestingController;
  let expectedResult: ITaxBracket | ITaxBracket[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TaxBracketService);
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

    it('should create a TaxBracket', () => {
      const taxBracket = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(taxBracket).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TaxBracket', () => {
      const taxBracket = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(taxBracket).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TaxBracket', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TaxBracket', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TaxBracket', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTaxBracketToCollectionIfMissing', () => {
      it('should add a TaxBracket to an empty array', () => {
        const taxBracket: ITaxBracket = sampleWithRequiredData;
        expectedResult = service.addTaxBracketToCollectionIfMissing([], taxBracket);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(taxBracket);
      });

      it('should not add a TaxBracket to an array that contains it', () => {
        const taxBracket: ITaxBracket = sampleWithRequiredData;
        const taxBracketCollection: ITaxBracket[] = [
          {
            ...taxBracket,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTaxBracketToCollectionIfMissing(taxBracketCollection, taxBracket);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TaxBracket to an array that doesn't contain it", () => {
        const taxBracket: ITaxBracket = sampleWithRequiredData;
        const taxBracketCollection: ITaxBracket[] = [sampleWithPartialData];
        expectedResult = service.addTaxBracketToCollectionIfMissing(taxBracketCollection, taxBracket);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(taxBracket);
      });

      it('should add only unique TaxBracket to an array', () => {
        const taxBracketArray: ITaxBracket[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const taxBracketCollection: ITaxBracket[] = [sampleWithRequiredData];
        expectedResult = service.addTaxBracketToCollectionIfMissing(taxBracketCollection, ...taxBracketArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const taxBracket: ITaxBracket = sampleWithRequiredData;
        const taxBracket2: ITaxBracket = sampleWithPartialData;
        expectedResult = service.addTaxBracketToCollectionIfMissing([], taxBracket, taxBracket2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(taxBracket);
        expect(expectedResult).toContain(taxBracket2);
      });

      it('should accept null and undefined values', () => {
        const taxBracket: ITaxBracket = sampleWithRequiredData;
        expectedResult = service.addTaxBracketToCollectionIfMissing([], null, taxBracket, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(taxBracket);
      });

      it('should return initial array if no TaxBracket is added', () => {
        const taxBracketCollection: ITaxBracket[] = [sampleWithRequiredData];
        expectedResult = service.addTaxBracketToCollectionIfMissing(taxBracketCollection, undefined, null);
        expect(expectedResult).toEqual(taxBracketCollection);
      });
    });

    describe('compareTaxBracket', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTaxBracket(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 2073 };
        const entity2 = null;

        const compareResult1 = service.compareTaxBracket(entity1, entity2);
        const compareResult2 = service.compareTaxBracket(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 2073 };
        const entity2 = { id: 13109 };

        const compareResult1 = service.compareTaxBracket(entity1, entity2);
        const compareResult2 = service.compareTaxBracket(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 2073 };
        const entity2 = { id: 2073 };

        const compareResult1 = service.compareTaxBracket(entity1, entity2);
        const compareResult2 = service.compareTaxBracket(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
