import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DATE_FORMAT } from 'app/config/input.constants';
import { IPublicHoliday } from '../public-holiday.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../public-holiday.test-samples';

import { PublicHolidayService, RestPublicHoliday } from './public-holiday.service';

const requireRestSample: RestPublicHoliday = {
  ...sampleWithRequiredData,
  holidayDate: sampleWithRequiredData.holidayDate?.format(DATE_FORMAT),
};

describe('PublicHoliday Service', () => {
  let service: PublicHolidayService;
  let httpMock: HttpTestingController;
  let expectedResult: IPublicHoliday | IPublicHoliday[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(PublicHolidayService);
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

    it('should create a PublicHoliday', () => {
      const publicHoliday = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(publicHoliday).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a PublicHoliday', () => {
      const publicHoliday = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(publicHoliday).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a PublicHoliday', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of PublicHoliday', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a PublicHoliday', () => {
      service.delete(123).subscribe();

      const requests = httpMock.match({ method: 'DELETE' });
      expect(requests.length).toBe(1);
    });

    describe('addPublicHolidayToCollectionIfMissing', () => {
      it('should add a PublicHoliday to an empty array', () => {
        const publicHoliday: IPublicHoliday = sampleWithRequiredData;
        expectedResult = service.addPublicHolidayToCollectionIfMissing([], publicHoliday);
        expect(expectedResult).toEqual([publicHoliday]);
      });

      it('should not add a PublicHoliday to an array that contains it', () => {
        const publicHoliday: IPublicHoliday = sampleWithRequiredData;
        const publicHolidayCollection: IPublicHoliday[] = [
          {
            ...publicHoliday,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addPublicHolidayToCollectionIfMissing(publicHolidayCollection, publicHoliday);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a PublicHoliday to an array that doesn't contain it", () => {
        const publicHoliday: IPublicHoliday = sampleWithRequiredData;
        const publicHolidayCollection: IPublicHoliday[] = [sampleWithPartialData];
        expectedResult = service.addPublicHolidayToCollectionIfMissing(publicHolidayCollection, publicHoliday);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(publicHoliday);
      });

      it('should add only unique PublicHoliday to an array', () => {
        const publicHolidayArray: IPublicHoliday[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const publicHolidayCollection: IPublicHoliday[] = [sampleWithRequiredData];
        expectedResult = service.addPublicHolidayToCollectionIfMissing(publicHolidayCollection, ...publicHolidayArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const publicHoliday: IPublicHoliday = sampleWithRequiredData;
        const publicHoliday2: IPublicHoliday = sampleWithPartialData;
        expectedResult = service.addPublicHolidayToCollectionIfMissing([], publicHoliday, publicHoliday2);
        expect(expectedResult).toEqual([publicHoliday, publicHoliday2]);
      });

      it('should accept null and undefined values', () => {
        const publicHoliday: IPublicHoliday = sampleWithRequiredData;
        expectedResult = service.addPublicHolidayToCollectionIfMissing([], null, publicHoliday, undefined);
        expect(expectedResult).toEqual([publicHoliday]);
      });

      it('should return initial array if no PublicHoliday is added', () => {
        const publicHolidayCollection: IPublicHoliday[] = [sampleWithRequiredData];
        expectedResult = service.addPublicHolidayToCollectionIfMissing(publicHolidayCollection, undefined, null);
        expect(expectedResult).toEqual(publicHolidayCollection);
      });
    });

    describe('comparePublicHoliday', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.comparePublicHoliday(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 12391 };
        const entity2 = null;

        const compareResult1 = service.comparePublicHoliday(entity1, entity2);
        const compareResult2 = service.comparePublicHoliday(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 12391 };
        const entity2 = { id: 8793 };

        const compareResult1 = service.comparePublicHoliday(entity1, entity2);
        const compareResult2 = service.comparePublicHoliday(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 12391 };
        const entity2 = { id: 12391 };

        const compareResult1 = service.comparePublicHoliday(entity1, entity2);
        const compareResult2 = service.comparePublicHoliday(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
