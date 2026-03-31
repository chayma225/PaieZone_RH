import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { IBonus } from '../bonus.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../bonus.test-samples';

import { BonusService } from './bonus.service';

const requireRestSample: IBonus = {
  ...sampleWithRequiredData,
};

describe('Bonus Service', () => {
  let service: BonusService;
  let httpMock: HttpTestingController;
  let expectedResult: IBonus | IBonus[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(BonusService);
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

    it('should create a Bonus', () => {
      const bonus = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(bonus).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a Bonus', () => {
      const bonus = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(bonus).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a Bonus', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of Bonus', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a Bonus', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addBonusToCollectionIfMissing', () => {
      it('should add a Bonus to an empty array', () => {
        const bonus: IBonus = sampleWithRequiredData;
        expectedResult = service.addBonusToCollectionIfMissing([], bonus);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(bonus);
      });

      it('should not add a Bonus to an array that contains it', () => {
        const bonus: IBonus = sampleWithRequiredData;
        const bonusCollection: IBonus[] = [
          {
            ...bonus,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addBonusToCollectionIfMissing(bonusCollection, bonus);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a Bonus to an array that doesn't contain it", () => {
        const bonus: IBonus = sampleWithRequiredData;
        const bonusCollection: IBonus[] = [sampleWithPartialData];
        expectedResult = service.addBonusToCollectionIfMissing(bonusCollection, bonus);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(bonus);
      });

      it('should add only unique Bonus to an array', () => {
        const bonusArray: IBonus[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const bonusCollection: IBonus[] = [sampleWithRequiredData];
        expectedResult = service.addBonusToCollectionIfMissing(bonusCollection, ...bonusArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const bonus: IBonus = sampleWithRequiredData;
        const bonus2: IBonus = sampleWithPartialData;
        expectedResult = service.addBonusToCollectionIfMissing([], bonus, bonus2);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(bonus);
        expect(expectedResult).toContain(bonus2);
      });

      it('should accept null and undefined values', () => {
        const bonus: IBonus = sampleWithRequiredData;
        expectedResult = service.addBonusToCollectionIfMissing([], null, bonus, undefined);
        expect(expectedResult).toHaveLength(1);
        expect(expectedResult).toContain(bonus);
      });

      it('should return initial array if no Bonus is added', () => {
        const bonusCollection: IBonus[] = [sampleWithRequiredData];
        expectedResult = service.addBonusToCollectionIfMissing(bonusCollection, undefined, null);
        expect(expectedResult).toEqual(bonusCollection);
      });
    });

    describe('compareBonus', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareBonus(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 9352 };
        const entity2 = null;

        const compareResult1 = service.compareBonus(entity1, entity2);
        const compareResult2 = service.compareBonus(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 9352 };
        const entity2 = { id: 7078 };

        const compareResult1 = service.compareBonus(entity1, entity2);
        const compareResult2 = service.compareBonus(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 9352 };
        const entity2 = { id: 9352 };

        const compareResult1 = service.compareBonus(entity1, entity2);
        const compareResult2 = service.compareBonus(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
